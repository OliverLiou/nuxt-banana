export const useGallery = () => {
  const supabase = useSupabaseClient()
  const store = useGalleryStore()

  const { pending, error } = useAsyncData<GalleryItem[]>('gallery-items', async () => {
    store.setPending(true)
    store.setError(null)

    // const { data, error: fetchError } = await supabase
    //   .from('gallery_items')
    //   .select('*')
    //   .eq('isActive', true)
    //   .order('created_at', { ascending: false })

    // if (fetchError) {
    //   store.setError(fetchError.message)
    //   store.setPending(false)
    //   return []
    // }
    const loremPics: GalleryItem[] = [
      { id: 1, title: 'Lorem Picsum 1', image_url: 'https://actbrkkiegttufuyeldm.supabase.co/storage/v1/object/public/images/nbp-20260112171244653.webp', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 1', badges: [] },
      { id: 2, title: 'Lorem Picsum 2', image_url: 'https://actbrkkiegttufuyeldm.supabase.co/storage/v1/object/public/images/4.webp', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 2', badges: [] },
      { id: 3, title: 'Lorem Picsum 3', image_url: 'https://picsum.photos/id/239/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 3', badges: [] },
      { id: 4, title: 'Lorem Picsum 4', image_url: 'https://picsum.photos/id/240/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 4', badges: [] },
      { id: 5, title: 'Lorem Picsum 5', image_url: 'https://picsum.photos/id/241/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 5', badges: [] },
      { id: 6, title: 'Lorem Picsum 6', image_url: 'https://picsum.photos/id/242/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 6', badges: [] },
      { id: 7, title: 'Lorem Picsum 7', image_url: 'https://picsum.photos/id/243/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 7', badges: [] },
      { id: 8, title: 'Lorem Picsum 8', image_url: 'https://picsum.photos/id/244/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 8', badges: [] },
      { id: 9, title: 'Lorem Picsum 9', image_url: 'https://picsum.photos/id/245/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 9', badges: [] },
      { id: 10, title: 'Lorem Picsum 10', image_url: 'https://picsum.photos/id/246/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 10', badges: [] },
      { id: 11, title: 'Lorem Picsum 11', image_url: 'https://picsum.photos/id/247/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 11', badges: [] },
      { id: 12, title: 'Lorem Picsum 12', image_url: 'https://picsum.photos/id/248/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 12', badges: [] },
      { id: 13, title: 'Lorem Picsum 13', image_url: 'https://picsum.photos/id/249/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 13', badges: [] },
      { id: 14, title: 'Lorem Picsum 14', image_url: 'https://picsum.photos/id/250/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 14', badges: [] },
      { id: 15, title: 'Lorem Picsum 15', image_url: 'https://picsum.photos/id/251/200/300', created_at: '' as string, isActive: true, prompt: 'A sample prompt for Lorem Picsum 15', badges: [] },
    ]

    store.setItems(loremPics ?? [])
    store.setPending(false)
    return loremPics ?? []
  }, {
    server: false,
  })

  const items = computed(() => store.items)

  return { items, pending, error }
}
