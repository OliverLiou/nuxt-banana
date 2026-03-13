# Data Model: Public Gallery & Admin Dashboard

## Entities

### GalleryItem

The central entity representing a creative work in the gallery.

**Supabase Table**: `gallery_items`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | Yes | auto-generated | Unique identifier (primary key) |
| image_url | string | Yes | — | Public URL to the stored image in Supabase Storage |
| title | string | Yes | — | Descriptive title for the gallery item |
| prompt | string | Yes | — | Generation prompt text associated with the image |
| badges | JSON array | Yes | `[]` | Array of badge objects, each containing `label` (string) and `color` (string from @nuxt/ui palette) |
| created_at | timestamp | Yes | auto-generated | Creation timestamp, used for sorting (newest first) |
| isActive | boolean | Yes | `true` | Visibility flag — when true, item appears on public gallery |

**Badge Object Shape**:

| Field | Type | Description |
|-------|------|-------------|
| label | string | Display text for the badge (must not be empty/whitespace) |
| color | string | Color key from the predefined palette: `primary`, `red`, `green`, `blue`, `yellow`, `orange`, `purple`, `pink`, `neutral` |

### Transient Form State (not persisted)

| Field | Type | Context | Description |
|-------|------|---------|-------------|
| upload_image | File | Create mode only | The image file selected for upload (.webp, max 2MB) |

## Validation Rules

- **title**: Must not be empty or whitespace-only
- **prompt**: Must not be empty or whitespace-only
- **badges**: Array must contain at least one badge; each badge.label must not be empty/whitespace
- **upload_image** (create mode): Required; must be .webp format; must be ≤ 2MB
- **upload_image** (edit mode): Optional; if provided, same format/size constraints apply
- **image_url**: After upload, the system must verify the public URL is accessible before saving

## State Transitions

```text
[New] → (admin creates with isActive=true) → [Active/Visible]
[New] → (admin creates with isActive=false) → [Inactive/Hidden]
[Active] ↔ [Inactive] (admin toggles isActive via edit form)
[Active|Inactive] → (admin confirms delete) → [Deleted/Removed]
```

## Query Patterns

| Query | Filter | Sort | Used By |
|-------|--------|------|---------|
| Public gallery | `isActive = true` | `created_at DESC` | Homepage gallery grid + Hero section |
| Admin list | No filter (all items) | `created_at DESC` | Admin dashboard table |

## Storage

- **Images**: Supabase Storage bucket, .webp format only, max 2MB per file
- **Data**: Supabase/PostgreSQL `gallery_items` table
- **Badges**: Stored as JSONB array within the gallery_items row

## Existing Type Definition

The `GalleryItem` type is already declared in `shared/types/index.d.ts` and should be reused across all components and stores.
