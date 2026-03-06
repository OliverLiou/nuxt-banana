# Contract: Pinia Store Interface

> Store: `useGalleryStore` defined via `defineStore('gallery', () => { ... })`.
> Location: `app/stores/galleryStore.ts`

---

## Current State (Existing)

```typescript
// app/stores/galleryStore.ts — current implementation
import { defineStore } from 'pinia'

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref<GalleryItem[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  function setItems(data: GalleryItem[]) { items.value = data }
  function setPending(val: boolean) { pending.value = val }
  function setError(msg: string | null) { error.value = msg }

  return { items, pending, error, setItems, setPending, setError }
})
```

---

## Extended State (Required for Admin)

The store must be extended to support both public gallery and admin management views.

### Full Store Contract

```typescript
import { defineStore } from 'pinia'
import type { BadgeProps } from '#ui/types'

type BadgeColor = BadgeProps['color']

interface GalleryFormState {
  id?: number
  title: string | null
  image_url: string | null
  upload_image: File | null
  prompt: string | null
  badges: { label: string; color: BadgeColor }[]
  isActive: boolean
}

export const useGalleryStore = defineStore('gallery', () => {
  // ── Public Gallery State ──
  const items = ref<GalleryItem[]>([])       // Active items for public gallery (paginated)
  const pending = ref(false)                  // Loading state for public gallery
  const error = ref<string | null>(null)      // Error state for public gallery
  const page = ref(0)                         // Current page for infinite scroll
  const hasMore = ref(true)                   // Whether more items exist to load

  // ── Admin State ──
  const allItems = ref<GalleryItem[]>([])     // All items (active + inactive) for admin table
  const adminPending = ref(false)             // Loading state for admin operations
  const adminError = ref<string | null>(null) // Error state for admin operations

  // ── Form / Slideover State ──
  const slideoverOpen = ref(false)            // Controls USlideover visibility
  const editingId = ref<number | null>(null)  // ID of item being edited (null = create mode)
  const formState = ref<GalleryFormState>(getDefaultFormState())

  // ── Getters (computed) ──
  const isEditMode = computed(() => editingId.value !== null)

  // ... actions defined below
})
```

---

## State Properties

| Property        | Type                    | Default          | Used By        | Description                                   |
| --------------- | ----------------------- | ---------------- | -------------- | --------------------------------------------- |
| `items`         | `GalleryItem[]`         | `[]`             | Public gallery  | Active items loaded via infinite scroll        |
| `pending`       | `boolean`               | `false`          | Public gallery  | Loading indicator for gallery fetch            |
| `error`         | `string \| null`        | `null`           | Public gallery  | Error message from gallery fetch               |
| `page`          | `number`                | `0`              | Public gallery  | Current pagination page index                  |
| `hasMore`       | `boolean`               | `true`           | Public gallery  | Whether more pages exist for infinite scroll   |
| `allItems`      | `GalleryItem[]`         | `[]`             | Admin           | Complete item list for admin table             |
| `adminPending`  | `boolean`               | `false`          | Admin           | Loading indicator for admin operations         |
| `adminError`    | `string \| null`        | `null`           | Admin           | Error message from admin operations            |
| `slideoverOpen` | `boolean`               | `false`          | Admin           | USlideover open/close state                    |
| `editingId`     | `number \| null`        | `null`           | Admin           | Item ID being edited; `null` = create mode     |
| `formState`     | `GalleryFormState`      | (default below)  | Admin           | Reactive form state for create/edit            |
| `isEditMode`    | `boolean` (computed)    | —                | Admin           | `true` when `editingId !== null`               |

---

## Default Form State

```typescript
function getDefaultFormState(): GalleryFormState {
  return {
    id: undefined,
    title: null,
    image_url: null,
    upload_image: null,
    prompt: null,
    badges: [],
    isActive: true,
  }
}
```

---

## Actions

### Public Gallery Actions

| Action                       | Signature                                              | Description                              |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `setItems`                   | `(data: GalleryItem[]) => void`                        | Replace items array                      |
| `appendItems`                | `(data: GalleryItem[]) => void`                        | Append items for infinite scroll         |
| `setPending`                 | `(val: boolean) => void`                               | Set loading state                        |
| `setError`                   | `(msg: string \| null) => void`                        | Set error state                          |
| `setPage`                    | `(val: number) => void`                                | Set current page index                   |
| `setHasMore`                 | `(val: boolean) => void`                               | Set whether more pages exist             |
| `resetPagination`            | `() => void`                                           | Reset page to 0, hasMore to true, clear items |

### Admin Actions

| Action                       | Signature                                              | Description                              |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `setAllItems`                | `(data: GalleryItem[]) => void`                        | Replace all admin items                  |
| `setAdminPending`            | `(val: boolean) => void`                               | Set admin loading state                  |
| `setAdminError`              | `(msg: string \| null) => void`                        | Set admin error state                    |
| `addItem`                    | `(item: GalleryItem) => void`                          | Add newly created item to `allItems`     |
| `updateItemInList`           | `(item: GalleryItem) => void`                          | Update an item in `allItems` by id       |
| `removeItem`                 | `(id: number) => void`                                 | Remove an item from `allItems` by id     |

### Form / Slideover Actions

| Action                       | Signature                                              | Description                              |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `openCreate`                 | `() => void`                                           | Reset form to defaults, set `editingId = null`, open slideover |
| `openEdit`                   | `(item: GalleryItem) => void`                          | Populate form from item, set `editingId`, open slideover |
| `closeSlideover`             | `() => void`                                           | Close slideover, reset form state        |
| `resetForm`                  | `() => void`                                           | Reset formState to defaults              |

### Action Implementations

```typescript
// ── Public Gallery ──
function appendItems(data: GalleryItem[]) {
  items.value.push(...data)
}

function resetPagination() {
  items.value = []
  page.value = 0
  hasMore.value = true
}

// ── Admin ──
function setAllItems(data: GalleryItem[]) {
  allItems.value = data
}

function addItem(item: GalleryItem) {
  allItems.value.unshift(item) // Newest first
}

function updateItemInList(updated: GalleryItem) {
  const idx = allItems.value.findIndex(i => i.id === updated.id)
  if (idx !== -1) allItems.value[idx] = updated
}

function removeItem(id: number) {
  allItems.value = allItems.value.filter(i => i.id !== id)
}

// ── Form / Slideover ──
function openCreate() {
  editingId.value = null
  formState.value = getDefaultFormState()
  slideoverOpen.value = true
}

function openEdit(item: GalleryItem) {
  editingId.value = item.id
  formState.value = {
    id: item.id,
    title: item.title,
    image_url: item.image_url,
    upload_image: null,
    prompt: item.prompt,
    badges: [...item.badges],
    isActive: item.isActive,
  }
  slideoverOpen.value = true
}

function closeSlideover() {
  slideoverOpen.value = false
  editingId.value = null
  formState.value = getDefaultFormState()
}

function resetForm() {
  formState.value = getDefaultFormState()
}
```

---

## Consumer Patterns

### Public Gallery Page

```typescript
// In useGallery() composable or page component
const store = useGalleryStore()

// Reads: store.items, store.pending, store.error, store.hasMore, store.page
// Writes: store.appendItems(), store.setPending(), store.setError(),
//         store.setPage(), store.setHasMore(), store.resetPagination()
```

### Admin Management Page

```typescript
// In useGalleryAdmin() composable or page component
const store = useGalleryStore()

// Reads: store.allItems, store.adminPending, store.adminError,
//        store.slideoverOpen, store.editingId, store.formState, store.isEditMode
// Writes: store.setAllItems(), store.addItem(), store.updateItemInList(),
//         store.removeItem(), store.openCreate(), store.openEdit(),
//         store.closeSlideover(), store.resetForm()
```

---

## Design Decisions

1. **Single store for both views**: Public and admin state coexist in one store to allow cross-view updates (e.g., toggling `isActive` in admin should eventually be reflectable in the public list).
2. **Form state in store**: Keeps the slideover form state centralized so the composable, page component, and slideover component can all access it without prop drilling.
3. **Optimistic local updates**: After successful CRUD operations, the composable updates the store locally (`addItem`, `updateItemInList`, `removeItem`) rather than re-fetching the full list, for instant UI feedback.
4. **Separate pending/error per context**: Public and admin have independent loading/error states to avoid conflicts when both views are potentially active.
