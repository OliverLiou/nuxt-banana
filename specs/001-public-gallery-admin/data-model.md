# Data Model: Public Gallery and Admin Management

## Persisted Domain Entities

### GalleryItem

The canonical gallery record already represented by the shared global `GalleryItem` type.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | Yes | Immutable primary identifier from Supabase |
| `image_url` | string | Yes | Publicly reachable URL used in hero, gallery grid, and detail modal |
| `title` | string | Yes | Non-empty display title |
| `prompt` | string | Yes | Full prompt text shown in detail modal and copied to clipboard |
| `badges` | `GalleryBadge[]` | No | Optional label list shown in public and admin views |
| `created_at` | string | Yes | ISO timestamp used for newest-first ordering |
| `isActive` | boolean | Yes | Publication flag; `true` means publicly visible |

**Validation rules**

- Create mode requires `image_url` to be produced from a successful upload and public URL lookup
  before the row is inserted.
- `title` and `prompt` are required on both create and edit.
- `badges` may be empty, but every badge row that exists must be complete and valid.
- `created_at` is treated as server-owned and is never edited from the client.

**State transitions**

| From | Event | To | Guard |
|---|---|---|---|
| New form draft | Successful create submit | `isActive = true` or `isActive = false` | Upload succeeds, public URL exists, DB insert succeeds |
| `isActive = false` | Toggle `isActive` on save | `isActive = true` | Valid edit submit succeeds |
| `isActive = true` | Toggle `isActive` off on save | `isActive = false` | Valid edit submit succeeds |
| `isActive = true` or `isActive = false` | Delete confirmed | Deleted | Confirmation accepted and delete succeeds |
| Any persisted state | Save attempt with missing public URL | Unchanged | Save aborts before DB write |

### GalleryBadge

Optional descriptive metadata attached to a `GalleryItem`.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `label` | string | Yes when row exists | User-facing label text |
| `color` | `BadgeProps['color']` | Yes when row exists | Must map to a valid `@nuxt/ui` badge color |

**Relationship**

- One `GalleryItem` contains zero or more `GalleryBadge` entries.

## Access and Authorization Entities

### AuthProfile

Derived authorization record resolved after a Supabase session exists.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `userId` | string | Yes | Supabase auth user identifier |
| `roleKey` | string | Yes | Role value loaded from the existing `profiles` authorization source |
| `isAdmin` | boolean | Yes | Derived flag used by middleware and admin pages |
| `roleLoaded` | boolean | Yes | Prevents admin pages from rendering before role lookup completes |

**Validation rules**

- `isAdmin` becomes `true` only when the resolved `roleKey` matches the project’s admin role.
- Missing or failed role resolution is treated as non-admin access until proven otherwise.

## Client-Side Working Models

### GalleryItemFormState

Transient form model used by the admin slideover. This shape is separate from persisted
`GalleryItem` records so upload state and existing image state can be managed explicitly.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string \| null | No | Present in edit mode only |
| `title` | string | Yes | Bound to `UInput` |
| `prompt` | string | Yes | Bound to `UTextarea` |
| `isActive` | boolean | Yes | Bound to `USwitch`; defaults to `true` on create |
| `badges` | `GalleryBadge[]` | No | Managed by repeater rows |
| `existingImageUrl` | string \| null | Edit only | Current persisted image preview |
| `uploadImage` | File \| File[] \| null | Create required | New upload candidate from `UFileUpload` |
| `mode` | `'create' \| 'edit'` | Yes | Drives validation and submit flow |

**Mode-aware validation**

- **Create**: `uploadImage`, `title`, and `prompt` are required; `badges` are optional.
- **Edit**: `title` and `prompt` are required; either `existingImageUrl` must already exist or
  `uploadImage` must provide a replacement; `badges` are optional.
- All badge rows must have both `label` and `color`.
- Uploads are constrained to `.webp` and under 2 MB.

### PublicGallerySelection

Client-side state for the currently selected public gallery item.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `selectedItem` | `GalleryItem \| null` | No | Drives the detail modal |
| `isOpen` | boolean | Yes | Drives `UModal` visibility |

## Query Views

### PublicGalleryFeed

Filtered public subset used by the homepage.

| Rule | Value |
|---|---|
| Filter | `isActive = true` |
| Sort | `created_at DESC` |
| Reused by | Hero featured set, marquee media, gallery grid, detail modal |
| Featured derivation | First 3 items from the filtered feed |

### AdminGalleryFeed

Full management list used by the admin dashboard.

| Rule | Value |
|---|---|
| Filter | None |
| Sort | `created_at DESC` |
| Reused by | `UTable`, edit slideover, delete confirmation |
