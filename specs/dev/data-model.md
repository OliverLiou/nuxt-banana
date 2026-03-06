# Data Model: Gallery Management

> Phase 1 artifact for the Gallery Management feature.
> Defines all entities, their relationships, Supabase schema, TypeScript types, and validation rules.

---

## Entity Overview

| Entity | Kind | Storage | Purpose |
|---|---|---|---|
| **GalleryItem** | Core entity | `gallery_items` table (Supabase) | Single artwork entry in the gallery |
| **Badge** | Embedded value object | JSONB column within `gallery_items` | Categorization tag on a GalleryItem |
| **GalleryFormState** | Client-only type | Pinia store / component state | Reactive form state for create/edit flows |

---

## 1. GalleryItem

### Purpose

Represents a single artwork entry in the gallery system. Displayed on both the public gallery (filtered to `isActive: true`) and the admin management page (all items). Each item contains an image, metadata, and categorization badges.

### Fields

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `id` | `number` | Auto | — | Primary key, auto-increment | Supabase-generated, never set by client |
| `title` | `string` | ✅ | — | Non-empty after trim | Display title of the artwork |
| `image_url` | `string` | ✅ | — | Valid URL pointing to Supabase Storage public object | System-generated from upload; admin never enters manually |
| `prompt` | `string` | ✅ | — | Non-empty after trim; may contain Unicode, special chars, newlines, very long text | The generative AI prompt associated with the artwork |
| `badges` | `Badge[]` | ✅ | `[]` | Min 1, max 10 items; labels unique per item | Stored as JSONB array in Supabase |
| `isActive` | `boolean` | — | `true` | — | Controls public gallery visibility |
| `created_at` | `string` (ISO 8601 timestamp) | Auto | `now()` | Immutable after creation | Used for default sort order (DESC) |

### Relationships

- **Contains** → `Badge[]` (embedded, 1:N, max 10)
- **Referenced by** → Pinia `galleryStore.items` (client-side cache)
- **Stored in** → Supabase `gallery_items` table
- **Image stored in** → Supabase Storage `images` bucket

### State Transitions

```
[Create Form] → upload image → save record → [Active / Inactive]
                                                   │
                                          admin toggle isActive
                                                   │
                                          ┌────────┴────────┐
                                          ▼                  ▼
                                     [Active]          [Inactive]
                                   (public visible)   (admin only)
                                          │
                                     admin delete
                                          │
                                          ▼
                                      [Deleted]
                                   (permanent, no soft-delete)
```

### Validation Rules (mapped to FRs)

| Rule | Source | Description |
|---|---|---|
| `title` is required, non-empty after trim | FR-012 | Form blocks submission; field-level error displayed |
| `prompt` is required, non-empty after trim | FR-012 | Form blocks submission; field-level error displayed |
| `image_url` or `upload_image` required | FR-012 | Edit mode requires `image_url`; create mode requires `upload_image` |
| `badges.length >= 1` | FR-013 | At least one badge required on form submit |
| `badges.length <= 10` | FR-018 | Form prevents adding more badges once limit reached |
| Badge labels unique per item | FR-019 | Form blocks adding a badge with a duplicate label |
| Badge `color` from system palette only | FR-013 | USelect restricts to predefined `BadgeColor` options |

---

## 2. Badge

### Purpose

An embedded value object representing a categorization tag attached to a GalleryItem. Badges have no independent identity — they exist only within the `badges` JSONB array of a GalleryItem row.

### Fields

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| `label` | `string` | ✅ | Non-empty; unique within the parent GalleryItem's `badges` array | Free text (e.g. "Landscape", "Portrait", "Anime") |
| `color` | `BadgeColor` | ✅ | Must be a value from `BadgeProps['color']` (Nuxt UI semantic palette) | Restricted to: `'primary'`, `'secondary'`, `'success'`, `'info'`, `'warning'`, `'error'`, `'neutral'` |

### Relationships

- **Embedded in** → `GalleryItem.badges` (value object, no standalone persistence)

### Validation Rules

| Rule | Description |
|---|---|
| `label` is non-empty | Cannot add a badge with a blank label |
| `label` is unique per parent item | Duplicate label on the same GalleryItem is blocked (FR-019) |
| `color` is from the predefined palette | Free-form color input is not allowed; enforced by `USelect` options |

---

## 3. GalleryFormState

### Purpose

Client-side reactive type used for the admin create/edit form (`USlideover` + `UForm`). Extends GalleryItem fields with an `upload_image` property for new image uploads. The form operates in two modes with different validation requirements.

### Fields

| Field | Type | Required (Create) | Required (Edit) | Default | Notes |
|---|---|---|---|---|---|
| `id` | `number \| undefined` | — | Present | `undefined` | `undefined` = create mode; number = edit mode |
| `title` | `string` | ✅ | ✅ | `''` | Bound to `UInput` via `v-model` |
| `image_url` | `string` | — | ✅ | `''` | Populated from existing record in edit mode |
| `upload_image` | `File \| null` | ✅ | — | `null` | New image file selected via `UFileUpload` |
| `prompt` | `string` | ✅ | ✅ | `''` | Bound to `UTextarea` via `v-model` |
| `badges` | `Badge[]` | ✅ (≥1) | ✅ (≥1) | `[]` | Managed via inline add/remove UI |
| `isActive` | `boolean` | — | — | `true` | Bound to `USwitch` via `v-model` |

### Mode Detection

```ts
const isEditMode = computed(() => formState.id !== null && formState.id !== undefined)
```

### Create vs Edit Validation Matrix

| Field | Create Mode | Edit Mode |
|---|---|---|
| `upload_image` | ✅ Required (must select a file) | ❌ Not required (has existing `image_url`) |
| `image_url` | ❌ Not validated (will be set after upload) | ✅ Required (must have existing URL) |
| `title` | ✅ Required, non-empty | ✅ Required, non-empty |
| `prompt` | ✅ Required, non-empty | ✅ Required, non-empty |
| `badges` | ✅ Length ≥ 1 | ✅ Length ≥ 1 |
| `isActive` | Optional (defaults `true`) | Optional (preserves current) |

### Form Submit Flow

```
User fills form
      │
      ▼
UForm validate() — returns FormError[]
      │
      ├── errors? → display field-level messages, block submit
      │
      ▼ (no errors)
Is create mode with upload_image?
      │
      ├── YES → upload to Supabase Storage
      │           │
      │           ├── upload fails → toast error, abort submit
      │           │
      │           ▼ (success)
      │         Set image_url = publicUrl
      │
      ▼
Save record (insert or update) to gallery_items
      │
      ├── error → toast error
      │
      ▼ (success)
Toast success → close USlideover → refresh store
```

---

## Supabase Table Schema

### `gallery_items` Table

```sql
CREATE TABLE gallery_items (
  id          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  badges      JSONB NOT NULL DEFAULT '[]'::jsonb,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for public gallery queries (active items sorted by date)
CREATE INDEX idx_gallery_items_active_created
  ON gallery_items ("isActive", created_at DESC);

-- Index for admin listing (all items sorted by date)
CREATE INDEX idx_gallery_items_created
  ON gallery_items (created_at DESC);
```

#### JSONB `badges` Column Structure

Each element in the `badges` array is a JSON object:

```json
[
  { "label": "Landscape", "color": "primary" },
  { "label": "AI Art", "color": "success" }
]
```

- Stored as a single JSONB column (no separate badges table)
- Maximum 10 elements enforced at the application layer
- Label uniqueness enforced at the application layer

### Supabase Storage — `images` Bucket

| Property | Value |
|---|---|
| Bucket name | `images` |
| Access | Public (public URLs served directly) |
| File naming | `nbp-{timestamp}.{ext}` (e.g. `nbp-20260112171244653.webp`) |
| Allowed types | `image/*` (PNG, JPG, WebP) |
| Max file size | 5 MB (enforced by `useFileUpload` on client) |
| URL pattern | `https://<project-ref>.supabase.co/storage/v1/object/public/images/<filename>` |

---

## TypeScript Type Definitions

### Existing Global Interface (`shared/types/index.d.ts`)

```ts
import type { BadgeProps } from '#ui/types'
type BadgeColor = BadgeProps['color']

declare global {
  interface GalleryItem {
    id: number
    image_url: string
    title: string
    prompt: string
    badges: { label: string; color: BadgeColor }[]
    created_at: timestamp
    isActive: boolean
  }
}
export {}
```

### Derived Types (to be added)

```ts
import type { BadgeProps } from '#ui/types'

/** Semantic badge color from Nuxt UI palette */
type BadgeColor = BadgeProps['color']

/** Embedded value object within GalleryItem */
interface Badge {
  label: string
  color: BadgeColor
}

/** Reactive form state for admin create/edit USlideover */
interface GalleryFormState {
  id?: number
  title: string
  image_url: string
  upload_image: File | null
  prompt: string
  badges: Badge[]
  isActive: boolean
}

/** Factory for empty create-mode form state */
function getDefaultFormState(): GalleryFormState {
  return {
    id: undefined,
    title: '',
    image_url: '',
    upload_image: null,
    prompt: '',
    badges: [],
    isActive: true,
  }
}

/** Factory to populate form state from an existing GalleryItem (edit mode) */
function getEditFormState(item: GalleryItem): GalleryFormState {
  return {
    id: item.id,
    title: item.title,
    image_url: item.image_url,
    upload_image: null,
    prompt: item.prompt,
    badges: [...item.badges],
    isActive: item.isActive,
  }
}
```

---

## Pinia Store State Shape

### Existing Store (`app/stores/galleryStore.ts`)

```ts
// Current state — already implemented
{
  items: GalleryItem[]    // cached gallery items
  pending: boolean        // loading state
  error: string | null    // error message
}
```

### Extended State (planned for admin features)

The store will be extended or a separate admin composable will manage:

```ts
{
  // Existing (public gallery)
  items: GalleryItem[]       // public active items (paginated, appended)
  pending: boolean
  error: string | null

  // Admin operations (may live in admin composable instead of store)
  adminItems: GalleryItem[]  // all items for admin table (active + inactive)
  adminPending: boolean
  adminError: string | null
}
```

> **Note**: The existing composable `useGallery.ts` wraps store mutations in `useAsyncData()` with `server: false`. Admin CRUD operations will follow the same Supabase client pattern (`useSupabaseClient()`) with toast notifications for feedback.

---

## Constants

```ts
/** Maximum number of badges per GalleryItem */
const MAX_BADGES_PER_ITEM = 10

/** Default page size for infinite scroll pagination */
const GALLERY_PAGE_SIZE = 12

/** Supabase Storage bucket for gallery images */
const STORAGE_BUCKET = 'images'

/** Allowed image MIME types for upload */
const ALLOWED_IMAGE_TYPES = 'image/*'

/** Max upload file size in bytes (5 MB) */
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024
```

---

## Cross-Reference: Spec Requirements → Data Model

| Requirement | Entity / Field | Enforcement |
|---|---|---|
| FR-001: Public shows only active | `GalleryItem.isActive` | Supabase query `.eq('isActive', true)` |
| FR-002: Sorted newest first | `GalleryItem.created_at` | Supabase query `.order('created_at', { ascending: false })` |
| FR-003: Infinite scroll | `GalleryItem` list | `.range(from, to)` pagination |
| FR-004: Display thumbnail, title, badges | `GalleryItem.image_url`, `.title`, `.badges` | UBlogPost prop binding |
| FR-005: Detail modal | All `GalleryItem` fields | Modal reads from item object |
| FR-006: Copy prompt | `GalleryItem.prompt` | Clipboard API |
| FR-009: Admin shows all items | `GalleryItem.isActive` (both true/false) | Supabase query without `.eq('isActive', true)` |
| FR-010: Inline toggle | `GalleryItem.isActive` | USwitch + Supabase update |
| FR-012: Required fields | `GalleryFormState.title`, `.prompt`, `.upload_image`/`.image_url` | Custom validation function |
| FR-013: Badge add with color | `Badge.label`, `Badge.color` | UInput + USelect |
| FR-018: Max 10 badges | `GalleryItem.badges` | Application-layer length check |
| FR-019: No duplicate badge labels | `Badge.label` uniqueness per item | Application-layer duplicate check |
