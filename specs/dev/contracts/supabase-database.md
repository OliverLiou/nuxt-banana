# Contract: Supabase Database Operations

> All database operations use `useSupabaseClient()` from `@nuxtjs/supabase`.
> Target table: `gallery_items`. Project runs as SPA (`ssr: false`) — all queries are client-side.

---

## Types

```typescript
import type { BadgeProps } from '#ui/types'
type BadgeColor = BadgeProps['color']

interface GalleryItem {
  id: number
  image_url: string
  title: string
  prompt: string
  badges: { label: string; color: BadgeColor }[]
  created_at: string // ISO 8601 timestamp
  isActive: boolean
}

// Form state used for create/edit operations
interface GalleryFormState {
  id?: number
  title: string | null
  image_url: string | null
  upload_image: File | null
  prompt: string | null
  badges: { label: string; color: BadgeColor }[]
  isActive: boolean
}
```

---

## DB-001: List Active Items (Public Gallery)

**Consumer**: `useGallery()` composable (public gallery page)

| Field        | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Operation    | `SELECT`                                               |
| Filter       | `isActive = true`                                      |
| Sort         | `created_at DESC` (newest first)                       |
| Pagination   | Range-based via `.range(from, to)`, `PAGE_SIZE = 12`   |
| Returns      | `GalleryItem[]`                                        |

### Code Pattern

```typescript
const supabase = useSupabaseClient()

const PAGE_SIZE = 12

async function fetchActiveItems(page: number): Promise<{
  data: GalleryItem[]
  hasMore: boolean
}> {
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('isActive', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    data: data ?? [],
    hasMore: (data?.length ?? 0) === PAGE_SIZE,
  }
}
```

### Error Handling

- On network/query error: set store error state, show toast with `color: 'error'`.
- Return empty array on failure; do not throw to caller UI.

---

## DB-002: List All Items (Admin)

**Consumer**: `useGalleryAdmin()` composable (admin management page)

| Field        | Value                                       |
| ------------ | ------------------------------------------- |
| Operation    | `SELECT`                                    |
| Filter       | None (all items, active and inactive)       |
| Sort         | `created_at DESC` (newest first)            |
| Pagination   | None (load all for admin table)             |
| Returns      | `GalleryItem[]`                             |

### Code Pattern

```typescript
async function fetchAllItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
```

### Error Handling

- On error: set store error state, show toast with `color: 'error'`.
- Return empty array on failure.

---

## DB-003: Get Single Item

**Consumer**: Detail modal (public gallery), edit form pre-population (admin)

| Field        | Value                          |
| ------------ | ------------------------------ |
| Operation    | `SELECT`                       |
| Filter       | `id = :itemId`                 |
| Returns      | `GalleryItem \| null`          |

### Code Pattern

```typescript
async function getItem(itemId: number): Promise<GalleryItem | null> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) throw error
  return data
}
```

### Error Handling

- If item not found (PGRST116): return `null`.
- On other errors: show toast with error message.

---

## DB-004: Create Item

**Consumer**: `useGalleryAdmin()` composable (admin create form)

| Field        | Value                                                           |
| ------------ | --------------------------------------------------------------- |
| Operation    | `INSERT`                                                        |
| Input        | `{ title, image_url, prompt, badges, isActive }`                |
| Returns      | `GalleryItem` (the newly created record via `.select().single()`) |

### Input Parameters

```typescript
interface CreateItemInput {
  title: string          // Required, non-empty
  image_url: string      // Required, obtained from storage upload
  prompt: string         // Required, non-empty
  badges: { label: string; color: BadgeColor }[] // At least 1 badge
  isActive: boolean      // Defaults to true
}
```

### Code Pattern

```typescript
async function createItem(input: CreateItemInput): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert({
      title: input.title,
      image_url: input.image_url,
      prompt: input.prompt,
      badges: input.badges,
      isActive: input.isActive,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Error Handling

- On success: show toast `{ title: '項目已新增', color: 'success' }`, refresh admin list, close slideover.
- On failure: show toast `{ title: '新增失敗', description: error.message, color: 'error' }`.
- **Pre-condition**: Image must be uploaded to storage and public URL obtained before calling this operation.

---

## DB-005: Update Item

**Consumer**: `useGalleryAdmin()` composable (admin edit form)

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| Operation    | `UPDATE`                                                         |
| Filter       | `id = :itemId`                                                   |
| Input        | `{ title, image_url, prompt, badges, isActive }`                 |
| Returns      | `GalleryItem` (the updated record via `.select().single()`)      |

### Input Parameters

```typescript
interface UpdateItemInput {
  id: number             // Required, target item ID
  title: string          // Required, non-empty
  image_url: string      // Required (existing URL or new upload URL)
  prompt: string         // Required, non-empty
  badges: { label: string; color: BadgeColor }[] // At least 1 badge
  isActive: boolean
}
```

### Code Pattern

```typescript
async function updateItem(input: UpdateItemInput): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .update({
      title: input.title,
      image_url: input.image_url,
      prompt: input.prompt,
      badges: input.badges,
      isActive: input.isActive,
    })
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Error Handling

- On success: show toast `{ title: '項目已更新', color: 'success' }`, refresh admin list, close slideover.
- On failure: show toast `{ title: '更新失敗', description: error.message, color: 'error' }`.
- If a new image was uploaded to replace the existing one, the storage upload must succeed before calling update.

---

## DB-006: Toggle isActive

**Consumer**: `useGalleryAdmin()` composable (admin table inline toggle)

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Operation    | `UPDATE`                           |
| Filter       | `id = :itemId`                     |
| Input        | `{ isActive: boolean }`            |
| Returns      | void (no data needed)              |

### Code Pattern

```typescript
async function toggleActive(itemId: number, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('gallery_items')
    .update({ isActive })
    .eq('id', itemId)

  if (error) throw error
}
```

### Error Handling

- On success: show toast `{ title: '狀態已更新', color: 'success' }`, update local store.
- On failure: show toast `{ title: '更新失敗', color: 'error' }`, **revert the toggle UI to previous state**.
- Use `loading` state on USwitch during the API call to indicate progress.

---

## DB-007: Delete Item

**Consumer**: `useGalleryAdmin()` composable (admin table delete action)

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Operation    | `DELETE`                           |
| Filter       | `id = :itemId`                     |
| Returns      | void                               |

### Code Pattern

```typescript
async function deleteItem(itemId: number): Promise<void> {
  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}
```

### Error Handling

- **Pre-condition**: Must show confirmation dialog (`confirm()` or custom modal) before executing.
- On success: show toast `{ title: '項目已刪除', color: 'success' }`, remove item from local store, refresh list.
- On failure: show toast `{ title: '刪除失敗', description: error.message, color: 'error' }`.
- Also delete the associated image from Supabase Storage (see `supabase-storage.md` ST-002).

---

## Supabase Table Schema Reference

```sql
CREATE TABLE gallery_items (
  id          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  badges      JSONB DEFAULT '[]'::jsonb,
  "isActive"  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

> Note: `badges` is stored as a JSONB array of `{ label, color }` objects.
> `isActive` uses camelCase as per the existing codebase convention.
