<template>
  <section id="gallery-grid" class="pt-8 pb-16 px-4 max-w-7xl mx-auto">
    <div v-if="activeItems.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <UIcon name="i-lucide-image-off" class="size-16 text-neutral-400 mb-4" />
      <p class="text-lg text-neutral-500">目前尚無公開的展示作品</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UBlogPost
        v-for="item in displayedItems"
        :key="item.id"
        :title="item.title"
        :image="{ src: item.image_url, alt: item.title }"
        :date="formatDate(item.created_at)"
        :badge="item.badges[0]"
        class="cursor-pointer"
        @click="$emit('select', item)"
      >
        <template #footer>
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="(badge, idx) in item.badges"
              :key="idx"
              :label="badge.label"
              :color="badge.color"
              variant="subtle"
              size="xs"
            />
          </div>
        </template>
      </UBlogPost>
    </div>

    <div v-if="hasMore" ref="sentinel" class="h-4" />
  </section>
</template>

<script setup lang="ts">
defineEmits<{ select: [item: GalleryItem] }>()

const { activeItems } = useGalleryItems()

const BATCH_SIZE = 6
const displayCount = ref(BATCH_SIZE)
const displayedItems = computed(() => activeItems.value.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < activeItems.value.length)

const sentinel = useTemplateRef<HTMLElement>('sentinel')
let observer: IntersectionObserver | null = null

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      displayCount.value += BATCH_SIZE
    }
  })

  watchEffect(() => {
    if (sentinel.value) {
      observer!.observe(sentinel.value)
    }
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>
