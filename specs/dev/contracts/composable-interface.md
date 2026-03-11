# Contract: Vue Composable Interfaces

> Composables are the primary data-access layer between Vue components and the Supabase backend.
> All composables use `useSupabaseClient()` for data access and `useGalleryStore()` for state management.

---

## Types (Shared)

```typescript
import type { BadgeProps } from '#ui/types'
type BadgeColor = BadgeProps['color']

interface GalleryItem {
  id: string
  image_url: string
  title: string
  prompt: string
  badges: { label: string; color: BadgeColor }[]
  created_at: string
  isActive: boolean
}

interface GalleryFormState {
  id?: string
  title: string | null
  image_url: string | null
  upload_image: File | null
  prompt: string | null
  badges: { label: string; color: BadgeColor }[]
  isActive: boolean
}
```

---

## COMP-001: `useGallery()` — Public Gallery Composable

**Location**: `app/composables/useGallery.ts` (extend existing)
**Consumer**: Public gallery page

### Signature

```typescript
function useGallery(): {
  // State (reactive, from store)
  items: ComputedRef<GalleryItem[]>
  pending: Ref<boolean>
  error: Ref<string | null>
  hasMore: ComputedRef<boolean>

  // Actions
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}
```

### Return Values

| Property   | Type                          | Description                                   |
| ---------- | ----------------------------- | --------------------------------------------- |
| `items`    | `ComputedRef<GalleryItem[]>`  | Active gallery items loaded so far             |
| `pending`  | `Ref<boolean>`                | `true` while a page is being fetched           |
| `error`    | `Ref<string \| null>`         | Error message from the last failed fetch       |
| `hasMore`  | `ComputedRef<boolean>`        | `true` if more pages can be loaded             |
| `loadMore` | `() => Promise<void>`         | Fetch and append the next page of items        |
| `refresh`  | `() => Promise<void>`         | Reset pagination and reload from page 0        |

### Behavior

1. On composable initialization, triggers the first page load automatically.
2. `loadMore()` guards against duplicate calls (no-op if `pending` or `!hasMore`).
3. Each page fetches `PAGE_SIZE` (12) items with `.range(from, to)`.
4. `hasMore` is set to `false` when a page returns fewer items than `PAGE_SIZE`.
5. `refresh()` calls `store.resetPagination()` then loads the first page again.

### Implementation Pattern

```typescript
export const useGallery = () => {
  const supabase = useSupabaseClient()
  const store = useGalleryStore()
  const toast = useToast()

  const PAGE_SIZE = 12

  const items = computed(() => store.items)
  const hasMore = computed(() => store.hasMore)

  async function loadMore() {
    if (store.pending || !store.hasMore) return
    store.setPending(true)
    store.setError(null)

    const from = store.page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error: fetchError } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('isActive', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) {
      store.setError(fetchError.message)
      toast.add({ title: '載入失敗', color: 'error' })
    } else {
      store.appendItems(data ?? [])
      store.setHasMore((data?.length ?? 0) === PAGE_SIZE)
      store.setPage(store.page + 1)
    }

    store.setPending(false)
  }

  async function refresh() {
    store.resetPagination()
    await loadMore()
  }

  // Initial load
  loadMore()

  return { items, pending: toRef(store, 'pending'), error: toRef(store, 'error'), hasMore, loadMore, refresh }
}
```

### Infinite Scroll Integration

The page component wires `loadMore` to `useInfiniteScroll` from VueUse:

```typescript
const scrollAreaRef = useTemplateRef('scrollArea')

useInfiniteScroll(
  () => scrollAreaRef.value?.$el?.querySelector('[data-reka-scroll-area-viewport]'),
  () => loadMore(),
  { distance: 200 }
)
```

---

## COMP-002: `useGalleryAdmin()` — Admin Management Composable

**Location**: `app/composables/useGalleryAdmin.ts` (new file)
**Consumer**: Admin gallery management page

### Signature

```typescript
function useGalleryAdmin(): {
  // State (reactive, from store)
  allItems: ComputedRef<GalleryItem[]>
  pending: Ref<boolean>
  error: Ref<string | null>
  slideoverOpen: Ref<boolean>
  editingId: Ref<string | null>
  formState: Ref<GalleryFormState>
  isEditMode: ComputedRef<boolean>

  // Data fetching
  fetchAll: () => Promise<void>

  // CRUD actions
  submitForm: () => Promise<void>
  toggleActive: (itemId: string, isActive: boolean) => Promise<void>
  deleteItem: (item: GalleryItem) => Promise<void>

  // Image upload
  uploadImage: (file: File) => Promise<string | null>

  // Slideover / form
  openCreate: () => void
  openEdit: (item: GalleryItem) => void
  closeSlideover: () => void

  // Form validation
  validate: (state: Partial<GalleryFormState>) => FormError[]
}
```

### Return Values

| Property         | Type                               | Description                                     |
| ---------------- | ---------------------------------- | ----------------------------------------------- |
| `allItems`       | `ComputedRef<GalleryItem[]>`       | All items (active + inactive) for admin table    |
| `pending`        | `Ref<boolean>`                     | Loading state for admin operations               |
| `error`          | `Ref<string \| null>`              | Error message from admin operations              |
| `slideoverOpen`  | `Ref<boolean>`                     | Controls slideover visibility                    |
| `editingId`      | `Ref<string \| null>`              | ID of item being edited, `null` = create mode    |
| `formState`      | `Ref<GalleryFormState>`            | Reactive form state                              |
| `isEditMode`     | `ComputedRef<boolean>`             | Whether the form is in edit mode                 |
| `fetchAll`       | `() => Promise<void>`              | Fetch all items for admin table                  |
| `submitForm`     | `() => Promise<void>`              | Handle form submission (create or update)        |
| `toggleActive`   | `(id, isActive) => Promise<void>`  | Toggle item's isActive status                    |
| `deleteItem`     | `(item) => Promise<void>`          | Delete an item (with storage cleanup)            |
| `uploadImage`    | `(file) => Promise<string \| null>` | Upload image to storage, return URL             |
| `openCreate`     | `() => void`                       | Open slideover in create mode                    |
| `openEdit`       | `(item) => void`                   | Open slideover in edit mode with item data       |
| `closeSlideover` | `() => void`                       | Close slideover and reset form                   |
| `validate`       | `(state) => FormError[]`           | Custom validation function for UForm             |

### Implementation Pattern

```typescript
import type { FormError } from '@nuxt/ui'

export const useGalleryAdmin = () => {
  const supabase = useSupabaseClient()
  const store = useGalleryStore()
  const toast = useToast()

  // ── Reactive state from store ──
  const allItems = computed(() => store.allItems)
  const isEditMode = computed(() => store.isEditMode)

  // ── Fetch All Items ──
  async function fetchAll() {
    store.setAdminPending(true)
    store.setAdminError(null)

    const { data, error: fetchError } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      store.setAdminError(fetchError.message)
      toast.add({ title: '載入失敗', color: 'error' })
    } else {
      store.setAllItems(data ?? [])
    }

    store.setAdminPending(false)
  }

  // ── Image Upload ──
  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `nbp-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      toast.add({ title: '圖片上傳失敗', description: uploadError.message, color: 'error' })
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  // ── Form Submit (Create or Update) ──
  async function submitForm() {
    const form = store.formState

    // Step 1: Upload new image if provided
    let imageUrl = form.image_url
    if (form.upload_image) {
      const url = await uploadImage(form.upload_image)
      if (!url) return // Upload failed — abort
      imageUrl = url
    }

    store.setAdminPending(true)

    if (isEditMode.value && form.id) {
      // ── Update ──
      const { data, error } = await supabase
        .from('gallery_items')
        .update({
          title: form.title,
          image_url: imageUrl,
          prompt: form.prompt,
          badges: form.badges,
          isActive: form.isActive,
        })
        .eq('id', form.id)
        .select()
        .single()

      if (error) {
        toast.add({ title: '更新失敗', description: error.message, color: 'error' })
      } else {
        toast.add({ title: '項目已更新', color: 'success' })
        store.updateItemInList(data)
        store.closeSlideover()
      }
    } else {
      // ── Create ──
      const { data, error } = await supabase
        .from('gallery_items')
        .insert({
          title: form.title,
          image_url: imageUrl,
          prompt: form.prompt,
          badges: form.badges,
          isActive: form.isActive,
        })
        .select()
        .single()

      if (error) {
        toast.add({ title: '新增失敗', description: error.message, color: 'error' })
      } else {
        toast.add({ title: '項目已新增', color: 'success' })
        store.addItem(data)
        store.closeSlideover()
      }
    }

    store.setAdminPending(false)
  }

  // ── Toggle isActive ──
  // Note: Called from the edit form save flow or programmatic use.
  // The admin table USwitch is disabled (display only); toggling isActive is done via the edit form.
  async function toggleActive(itemId: string, isActive: boolean) {
    const { error } = await supabase
      .from('gallery_items')
      .update({ isActive })
      .eq('id', itemId)

    if (error) {
      toast.add({ title: '更新失敗', color: 'error' })
      // Revert: caller should re-read store state to revert toggle UI
    } else {
      toast.add({ title: '狀態已更新', color: 'success' })
      const item = store.allItems.find(i => i.id === itemId)
      if (item) store.updateItemInList({ ...item, isActive })
    }
  }

  // ── Delete Item ──
  async function deleteItem(item: GalleryItem) {
    // Step 1: Delete storage file (best-effort)
    const fileName = item.image_url.split('/').pop()
    if (fileName) {
      await supabase.storage.from('images').remove([fileName]).catch(() => {})
    }

    // Step 2: Delete database record
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      toast.add({ title: '刪除失敗', description: error.message, color: 'error' })
    } else {
      toast.add({ title: '項目已刪除', color: 'success' })
      store.removeItem(item.id)
    }
  }

  // ── Form Validation (UForm custom validate) ──
  function validate(state: Partial<GalleryFormState>): FormError[] {
    const errors: FormError[] = []

    if (isEditMode.value) {
      if (!state.image_url) errors.push({ name: 'image_url', message: '圖片為必填' })
    } else {
      if (!state.upload_image) errors.push({ name: 'upload_image', message: '請上傳圖片' })
    }
    if (!state.title?.trim()) errors.push({ name: 'title', message: '標題為必填' })
    if (!state.prompt?.trim()) errors.push({ name: 'prompt', message: '提示詞為必填' })
    if (!state.badges?.length) errors.push({ name: 'badges', message: '至少需要一個標籤' })

    return errors
  }

  // ── Slideover Controls (delegate to store) ──
  function openCreate() { store.openCreate() }
  function openEdit(item: GalleryItem) { store.openEdit(item) }
  function closeSlideover() { store.closeSlideover() }

  return {
    allItems,
    pending: toRef(store, 'adminPending'),
    error: toRef(store, 'adminError'),
    slideoverOpen: toRef(store, 'slideoverOpen'),
    editingId: toRef(store, 'editingId'),
    formState: toRef(store, 'formState'),
    isEditMode,
    fetchAll,
    submitForm,
    toggleActive,
    deleteItem,
    uploadImage,
    openCreate,
    openEdit,
    closeSlideover,
    validate,
  }
}
```

---

## Error Handling Patterns

### Toast Notification Convention

All composable operations follow a consistent toast pattern:

```typescript
// Success
toast.add({ title: '<操作>成功', color: 'success' })

// Error
toast.add({ title: '<操作>失敗', description: error.message, color: 'error' })
```

| Operation         | Success Title   | Error Title       |
| ----------------- | --------------- | ----------------- |
| Load items        | —               | `載入失敗`         |
| Create item       | `項目已新增`     | `新增失敗`         |
| Update item       | `項目已更新`     | `更新失敗`         |
| Delete item       | `項目已刪除`     | `刪除失敗`         |
| Toggle isActive   | `狀態已更新`     | `更新失敗`         |
| Upload image      | —               | `圖片上傳失敗`     |
| Copy prompt       | `複製成功`       | —                 |

### Error Recovery

- **Toggle failure**: The admin table USwitch is `disabled: true` (display only). Toggling isActive is done via the edit form. On failure, the store is not updated, so re-reading store state restores the correct value.
- **Upload failure**: Form submission is aborted. The user retains their form input and can retry.
- **Delete failure**: Item remains in the store and table. No state changes on failure.
- **Fetch failure**: Store error state is set; components display error UI or retry option.

---

## Composable Dependency Graph

```
Page Component
  └── useGallery() / useGalleryAdmin()
        ├── useSupabaseClient()   ← Supabase SDK
        ├── useGalleryStore()     ← Pinia state
        └── useToast()            ← Notifications
```

Both composables are **auto-imported** by Nuxt from the `app/composables/` directory.

---

## MW-001: `auth` Route Middleware

> Location: `app/middleware/auth.ts` — **NEW FILE**
> Activated via: `definePageMeta({ middleware: 'auth' })` on protected pages

### Contract

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  const toast = useToast()

  // Not authenticated — redirect to login
  if (userStore.role === null || userStore.role === undefined) {
    return navigateTo('/login')
  }

  // Authenticated but not admin — redirect to home with toast
  if (userStore.role !== 'admin') {
    toast.add({
      title: '您無此頁面權限, 即將為您導回首頁',
      color: 'error',
    })
    return navigateTo('/')
  }

  // Admin — allow navigation
})
```

### Redirect Rules

| Condition | Action | Destination |
|-----------|--------|-------------|
| `role` is `null` / `undefined` | Redirect (silent) | `/login` |
| `role` is not `'admin'` | Redirect + toast | `/` |
| `role` is `'admin'` | Allow | Continue to page |

### Dependencies

- Reads from: `useUserStore().role`
- Uses: `useToast()`, `navigateTo()`
- Auto-imported by Nuxt (no manual import needed for `defineNuxtRouteMiddleware`)
