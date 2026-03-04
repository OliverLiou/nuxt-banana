import { defineStore } from 'pinia'

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref<GalleryItem[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  function setItems(data: GalleryItem[]) {
    items.value = data
  }

  function setPending(val: boolean) {
    pending.value = val
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  return { items, pending, error, setItems, setPending, setError }
})
