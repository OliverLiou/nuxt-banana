import { defineStore } from 'pinia'
import type { GalleryFormState } from '#shared/types'
import { getDefaultFormState } from '#shared/utils/gallery'

export const useGalleryStore = defineStore('gallery', () => {
  // ── Public Gallery State ──
  const items = ref<GalleryItem[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const hasMore = ref(true)

  // ── Admin State ──
  const allItems = ref<GalleryItem[]>([])
  const adminPending = ref(false)
  const adminError = ref<string | null>(null)

  // ── Form / Slideover State ──
  const slideoverOpen = ref(false)
  const editingId = ref<string | null>(null)
  const formState = ref<GalleryFormState>(getDefaultFormState())

  // ── Getters ──
  const isEditMode = computed(() => editingId.value !== null)

  // ── Public Gallery Actions (preserve existing) ──
  function setItems(data: GalleryItem[]) {
    items.value = data
  }

  function setPending(val: boolean) {
    pending.value = val
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function appendItems(data: GalleryItem[]) {
    items.value.push(...data)
  }

  function setPage(val: number) {
    page.value = val
  }

  function setHasMore(val: boolean) {
    hasMore.value = val
  }

  function resetPagination() {
    items.value = []
    page.value = 0
    hasMore.value = true
  }

  // ── Admin Actions ──
  function setAllItems(data: GalleryItem[]) {
    allItems.value = data
  }

  function setAdminPending(val: boolean) {
    adminPending.value = val
  }

  function setAdminError(msg: string | null) {
    adminError.value = msg
  }

  function addItem(item: GalleryItem) {
    allItems.value.unshift(item)
  }

  function updateItemInList(updated: GalleryItem) {
    const idx = allItems.value.findIndex(i => i.id === updated.id)
    if (idx !== -1) allItems.value[idx] = updated
  }

  function removeItem(id: string) {
    allItems.value = allItems.value.filter(i => i.id !== id)
  }

  // ── Form / Slideover Actions ──
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

  return {
    // Public Gallery
    items, pending, error, page, hasMore,
    setItems, setPending, setError, appendItems, setPage, setHasMore, resetPagination,
    // Admin
    allItems, adminPending, adminError,
    setAllItems, setAdminPending, setAdminError, addItem, updateItemInList, removeItem,
    // Form / Slideover
    slideoverOpen, editingId, formState, isEditMode,
    openCreate, openEdit, closeSlideover, resetForm,
  }
})
