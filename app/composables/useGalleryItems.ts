export function useGalleryItems() {
  const activeItems = computed<GalleryItem[]>(() =>
    galleryItems
      .filter(item => item.isActive)
      .sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  )

  return { activeItems }
}
