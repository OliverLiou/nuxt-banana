# Data Model: Public Gallery View

**Date**: 2026-03-17
**Source**: `shared/types/index.d.ts`, `shared/utils/galleryItems.ts`

## Entities

### GalleryItem

The primary entity representing a displayable artwork in the gallery.

| Field      | Type                              | Required | Description |
|------------|-----------------------------------|----------|-------------|
| id         | string                            | Yes      | Unique identifier |
| image_url  | string                            | Yes      | URL to the image (external or local /images/ path) |
| title      | string                            | Yes      | Display title of the artwork |
| prompt     | string                            | Yes      | Generation prompt text (copyable by visitors) |
| badges     | Badge[]                           | Yes      | Array of categorization labels (may be empty) |
| created_at | string                            | Yes      | Creation timestamp (format: YYYY-MM-DD HH:mm:ss+TZ) |
| isActive   | boolean                           | Yes      | Visibility flag; only `true` items shown to visitors |

### Badge (embedded in GalleryItem)

| Field | Type       | Required | Description |
|-------|------------|----------|-------------|
| label | string     | Yes      | Display text for the badge |
| color | BadgeColor | Yes      | Color variant from @nuxt/ui BadgeProps |

## Data Access Patterns

### Gallery Grid (homepage)
- **Filter**: `isActive === true`
- **Sort**: `created_at` descending (newest first)
- **Source**: Import from `shared/utils/galleryItems.ts`
- **Loading**: Infinite scroll (batched display from in-memory array)

### Detail Overlay
- **Access**: Single GalleryItem selected by `id`
- **Carousel**: Navigate through filtered (active) items array
- **Carousel behavior**: Circular (wraps from last to first and vice versa)

### Hero Section Marquee
- **Source**: Same filtered active items array
- **Usage**: Auto-scrolling image display

## Validation Rules

- `id` MUST be unique across all GalleryItem entries
- `image_url` MUST be a valid URL (https://) or local path (/images/)
- `badges` MAY be an empty array (UI renders without badge section)
- `created_at` MUST be parseable as a date for sorting and display formatting (YYYY-MM-DD)
- `isActive` determines public visibility; `false` items are completely hidden

## State Transitions

GalleryItem has no client-side state transitions in this feature. The `isActive` flag is read-only from the static data source.

## Scale Assumptions

- Current dataset: 11 items (static TypeScript file)
- Infinite scroll batch size: determined at implementation time (recommended: 6-12 items)
- All data loaded in-memory; no server-side pagination needed for current scale
