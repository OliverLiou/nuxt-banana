<template>
  <div class="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
    <h1 class="text-2xl font-bold">
      🖼️ 展示畫廊
    </h1>

    <UScrollArea ref="scrollArea" :orientation="orientation" class="flex-1">
      <template v-if="items.length">
        <div
          :class="[
            mdAndUp
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-1'
              : 'flex gap-4 p-1',
          ]"
        >
          <UBlogPost
            v-for="item in items"
            :key="item.id"
            :title="item.title"
            :image="item.image_url || undefined"
            orientation="vertical"
            variant="outline"
            class="cursor-pointer"
            :class="{ 'min-w-[280px]': !mdAndUp }"
            @click="openDetail(item)"
          >
            <template v-if="!item.image_url" #image>
              <div class="flex h-48 items-center justify-center bg-(--ui-bg-elevated) text-(--ui-text-muted)">
                尚未設定圖片
              </div>
            </template>
            <template #badge>
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="badge in item.badges"
                  :key="badge.label"
                  :label="badge.label"
                  :color="badge.color"
                  variant="outline"
                />
              </div>
            </template>
            <template #footer>
              <UButton
                icon="i-lucide-copy"
                variant="outline"
                color="neutral"
                size="sm"
                @click.stop="copyPrompt(item.prompt)"
              />
            </template>
          </UBlogPost>
        </div>
      </template>

      <div v-else-if="pending" class="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <USkeleton v-for="n in 8" :key="n" class="h-64 rounded-xl" />
      </div>

      <div v-else class="flex h-64 items-center justify-center text-(--ui-text-muted)">
        <p>目前尚無公開的展示作品</p>
      </div>
    </UScrollArea>

    <GalleryDetail v-model:open="detailOpen" :item="selectedItem" />
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, useInfiniteScroll } from '@vueuse/core'

const { items, pending, hasMore, loadMore } = useGallery()
const toast = useToast()

const breakpoints = useBreakpoints({ md: 768 })
const mdAndUp = breakpoints.greaterOrEqual('md')
const orientation = computed(() => mdAndUp.value ? 'vertical' : 'horizontal')

const scrollArea = useTemplateRef('scrollArea')

useInfiniteScroll(
  () => scrollArea.value?.$el?.querySelector('[data-reka-scroll-area-viewport]') as HTMLElement | null,
  () => loadMore(),
  { distance: 200 },
)

async function copyPrompt(prompt: string) {
  try {
    await navigator.clipboard.writeText(prompt)
    toast.add({ title: '複製成功', color: 'success' })
  } catch {
    toast.add({ title: '複製失敗', color: 'error' })
  }
}

const selectedItem = ref<GalleryItem | null>(null)
const detailOpen = ref(false)

function openDetail(item: GalleryItem) {
  selectedItem.value = item
  detailOpen.value = true
}
</script>
