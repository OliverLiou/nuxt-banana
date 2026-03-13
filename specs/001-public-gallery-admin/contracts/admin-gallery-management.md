# Contract: Admin Gallery Management

## Purpose

Define the management workflow for listing, creating, editing, and deleting gallery items.

## Admin List Contract

| Aspect | Contract |
|---|---|
| Data source | All `gallery_items` records, ordered by `created_at DESC` |
| Primary surface | `UTable` |
| Visible columns | Thumbnail, title, truncated prompt, created date, `isActive` status, badge summary, actions |
| Actions | Create, edit, delete |

## Form Contract

### Form State

`GalleryItemFormState` contains:

- `id?`
- `title`
- `prompt`
- `badges`
- `isActive`
- `existingImageUrl`
- `uploadImage`
- `mode`

### Validation Rules

| Mode | Required Fields | Optional Fields | Blockers |
|---|---|---|---|
| Create | `uploadImage`, `title`, `prompt` | `badges`, `isActive` | Invalid file type, file too large, missing public URL |
| Edit | `title`, `prompt`, existing image or replacement upload | `badges`, `isActive` | Missing resulting image, missing public URL |

Badge rows are optional overall, but every row that exists must include a valid label and color.

### Upload Rules

- Accept `.webp` uploads only.
- Limit uploads to files under 2 MB.
- Upload happens before DB insert/update whenever a new file is provided.
- The save must abort if the public URL cannot be resolved.

## Submit Contract

1. Validate form state.
2. Upload new image if create mode or image replacement is requested.
3. Resolve a public image URL from the upload result.
4. Abort immediately if the public URL is missing or invalid.
5. Insert or update the `gallery_items` row only after a valid public URL exists.
6. Refresh the admin list and close the slideover after success.
7. If upload succeeded but later persistence fails, clean up the newly uploaded object before
   returning control to the form.

## Delete Contract

- Delete must require an explicit confirmation modal that names the target item.
- Canceling the confirmation leaves the record unchanged.
- Confirmed delete removes the `gallery_items` row and refreshes the table.
- Storage object deletion is out of scope unless an existing persisted storage key is available
  during implementation.

## Feedback Contract

- Use success toasts for completed create, update, and delete operations.
- Use error toasts for validation, upload, public-URL, and persistence failures.
- Keep field-level validation feedback inside the slideover form.
