# Contract: Supabase Storage Operations

> All storage operations use `useSupabaseClient()` from `@nuxtjs/supabase`.
> Target bucket: `images`. Project runs as SPA (`ssr: false`) — all operations are client-side.

---

## Bucket Configuration

| Setting          | Value            |
| ---------------- | ---------------- |
| Bucket name      | `images`         |
| Access           | Public           |
| Allowed MIME     | `image/*`        |
| Max file size    | 5 MB (enforced client-side) |

---

## File Naming Strategy

Files are stored with a timestamped prefix to avoid collisions:

```
nbp-{timestamp}.{extension}
```

**Examples**:
- `nbp-20260112171244653.webp`
- `nbp-1741234567890.png`

**Generation logic**:

```typescript
function generateFileName(file: File): string {
  const fileExt = file.name.split('.').pop()
  return `nbp-${Date.now()}.${fileExt}`
}
```

> No subdirectories are used — all files reside at the bucket root level, matching the existing URL pattern observed in the codebase: `https://<project>.supabase.co/storage/v1/object/public/images/<filename>.webp`

---

## ST-001: Upload Image

**Consumer**: `useGalleryAdmin()` composable (admin create/edit form submit)

| Field        | Value                                             |
| ------------ | ------------------------------------------------- |
| Operation    | `storage.from('images').upload()`                  |
| Input        | `File` object from `UFileUpload` / `useFileUpload` |
| Returns      | `string` — the public URL of the uploaded image    |

### Code Pattern

```typescript
const supabase = useSupabaseClient()

async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `nbp-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

### Error Handling

- On upload failure: show toast `{ title: '圖片上傳失敗', description: error.message, color: 'error' }`.
- **Critical**: If upload fails, the entire form submission must be aborted. Do not proceed to create/update the database record.
- Common failure reasons: file too large, unsupported format, network error, storage quota exceeded.

### Integration with Form Submit

```typescript
async function onSubmit(event: FormSubmitEvent<GalleryFormState>) {
  const formData = event.data

  // Step 1: Upload image if a new file is selected
  let imageUrl = formData.image_url
  if (formData.upload_image) {
    const uploadedUrl = await uploadImage(formData.upload_image)
    if (!uploadedUrl) return // Abort — upload failed
    imageUrl = uploadedUrl
  }

  // Step 2: Create or update the database record
  if (formData.id) {
    await updateItem({ ...formData, image_url: imageUrl! })
  } else {
    await createItem({ ...formData, image_url: imageUrl! })
  }
}
```

---

## ST-002: Delete Image

**Consumer**: `useGalleryAdmin()` composable (admin delete item action)

| Field        | Value                                          |
| ------------ | ---------------------------------------------- |
| Operation    | `storage.from('images').remove()`              |
| Input        | `string[]` — array of file paths to delete     |
| Returns      | void                                           |

### Code Pattern

```typescript
async function deleteImage(imageUrl: string): Promise<void> {
  // Extract file name from the public URL
  const fileName = imageUrl.split('/').pop()
  if (!fileName) return

  const { error } = await supabase.storage
    .from('images')
    .remove([fileName])

  if (error) {
    console.warn('Failed to delete image from storage:', error.message)
    // Non-blocking: log warning but don't prevent item deletion
  }
}
```

### Error Handling

- Storage deletion is **best-effort**: if it fails, the gallery item is still deleted from the database.
- Log the warning for debugging, but do not show a toast or block the delete flow.
- This prevents orphaned database records while accepting the possibility of orphaned storage files.

### Integration with Item Deletion

```typescript
async function handleDeleteItem(item: GalleryItem): Promise<void> {
  // Step 1: Delete the storage file (best-effort)
  await deleteImage(item.image_url)

  // Step 2: Delete the database record (required)
  await deleteItem(item.id)
}
```

---

## ST-003: Get Public URL

**Consumer**: Used internally after upload (ST-001)

| Field        | Value                                          |
| ------------ | ---------------------------------------------- |
| Operation    | `storage.from('images').getPublicUrl()`         |
| Input        | `string` — file path within the bucket         |
| Returns      | `string` — full public URL                     |

### Code Pattern

```typescript
function getImagePublicUrl(filePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return publicUrl
}
```

### URL Format

```
https://<project-ref>.supabase.co/storage/v1/object/public/images/<fileName>
```

> `getPublicUrl()` is a synchronous helper — it constructs the URL from the project configuration without making a network request. It never throws.

---

## Client-Side Validation (Pre-Upload)

Enforce these constraints via `useFileUpload` before attempting an upload:

```typescript
const { files: uploadFiles, open, reset } = useFileUpload({
  accept: 'image/*',
  maxFiles: 1,
  maxSize: 5 * 1024 * 1024, // 5 MB
})
```

| Constraint      | Value                              | Enforced by         |
| --------------- | ---------------------------------- | ------------------- |
| File type       | `image/*` (PNG, JPG, WebP, etc.)   | `useFileUpload`     |
| Max file count  | 1                                  | `useFileUpload`     |
| Max file size   | 5 MB                               | `useFileUpload`     |
