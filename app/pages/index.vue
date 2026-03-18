<template>
  <div>
    <HeroSection />
    <GalleryGrid @select="openDetail" />
    <GalleryDetailOverlay
      v-model:open="isOpen"
      :item="selectedItem"
      :items="activeItems"
    />
  </div>
</template>

<script setup lang="ts">
const { activeItems } = useGalleryItems()

const isOpen = ref(false)
const selectedItem = ref<GalleryItem | null>(null)

function openDetail(item: GalleryItem) {
  selectedItem.value = item
  isOpen.value = true
}

// Restore overlay from URL query on initial load
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const itemId = params.get('item')
  if (itemId) {
    const found = activeItems.value.find(i => i.id === itemId)
    if (found) openDetail(found)
  }
})
</script>