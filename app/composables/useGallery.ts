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
      store.appendItems((data as GalleryItem[]) ?? [])
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
