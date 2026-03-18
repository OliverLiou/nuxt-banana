<template>
  <UModal v-model:open="isOpen" fullscreen :dismissible="true">
    <template #content>
      <div class="gallery-lightbox relative h-full bg-[#0b0b0d] overflow-hidden">
        <!-- Close button — frosted glass circle -->
        <button
          class="absolute top-4 right-4 z-20 size-10 rounded-full
                 flex items-center justify-center cursor-pointer
                 bg-white/6 text-neutral-500 backdrop-blur-sm
                 hover:bg-white/12 hover:text-neutral-200
                 transition-all duration-300"
          @click="isOpen = false"
        >
          <UIcon name="i-lucide-x" class="size-5" />
        </button>

        <div class="flex flex-col md:flex-row h-full">
          <!-- ===== Image area (70%) ===== -->
          <div class="w-full md:w-[70%] h-1/2 md:h-full flex flex-col select-none overflow-hidden">
            <UCarousel
              ref="carousel"
              :items="props.items"
              :start-index="currentIndex"
              :loop="true"
              :arrows="true"
              :ui="{
                prev: 'sm:start-4',
                next: 'sm:end-4',
              }"
              class="flex-1 min-h-0"
              @select="onSelect"
            >
              <template #default="{ item }">
                <div class="w-full h-full flex items-center justify-center p-4 md:p-10">
                  <img
                    :src="(item as GalleryItem).image_url"
                    :alt="(item as GalleryItem).title"
                    class="max-w-full max-h-full object-contain rounded-lg
                           shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </template>
            </UCarousel>

            <!-- Thumbnail strip -->
            <div class="flex gap-2.5 justify-center py-3 px-4">
              <button
                v-for="thumb in visibleThumbnails"
                :key="thumb.item.id"
                class="relative size-12 md:size-14 rounded-lg overflow-hidden shrink-0
                       outline-none cursor-pointer transition-all duration-300"
                :class="thumb.index === currentIndex
                  ? 'ring-2 ring-amber-400/80 ring-offset-2 ring-offset-[#0b0b0d] scale-110'
                  : 'opacity-40 hover:opacity-70 hover:scale-105'"
                @click="scrollTo(thumb.index)"
              >
                <img :src="thumb.item.image_url" :alt="thumb.item.title" class="size-full object-cover" />
              </button>
            </div>
          </div>

          <!-- ===== Metadata panel (30%) ===== -->
          <div
            class="w-full md:w-[30%] h-1/2 md:h-full
                   bg-[#121214] md:border-l md:border-white/6
                   overflow-y-auto overscroll-contain"
          >
            <div class="p-6 md:px-8 md:py-10 flex flex-col gap-7">
              <!-- Title -->
              <div>
                <span class="gallery-label">標題</span>
                <h2 class="text-xl md:text-2xl font-extralight leading-snug tracking-wide text-neutral-100">
                  {{ currentItem?.title }}
                </h2>
              </div>

              <div class="gallery-divider" />

              <!-- Prompt -->
              <div>
                <span class="gallery-label">Prompt</span>
                <p class="text-sm leading-7 text-neutral-400 italic whitespace-pre-wrap wrap-break-word select-text">
                  {{ currentItem?.prompt }}
                </p>
                <button
                  class="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5
                         text-xs tracking-wide rounded-md cursor-pointer
                         border border-white/8 text-neutral-500
                         hover:border-amber-500/40 hover:text-amber-400/90
                         active:scale-95 transition-all duration-300"
                  @click="copyPrompt"
                >
                  <UIcon name="i-lucide-copy" class="size-3.5" />
                  {{ copyLabel }}
                </button>
              </div>

              <div class="gallery-divider" />

              <!-- Date -->
              <div>
                <span class="gallery-label">日期</span>
                <time class="block text-sm text-neutral-500 tabular-nums">
                  {{ formatDate(currentItem?.created_at) }}
                </time>
              </div>

              <!-- Badges -->
              <template v-if="currentItem?.badges?.length">
                <div class="gallery-divider" />
                <div>
                  <span class="gallery-label">標籤</span>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="badge in currentItem.badges"
                      :key="badge.label"
                      :label="badge.label"
                      :color="badge.color"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: GalleryItem | null
  items: GalleryItem[]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const currentIndex = ref(0)
const carouselRef = useTemplateRef<{ emblaApi?: { scrollTo: (index: number, jump?: boolean) => void } }>('carousel')
const copyLabel = ref('複製 Prompt')

const currentItem = computed(() => props.items[currentIndex.value] ?? null)

// Sync currentIndex when the selected item prop changes
watch(() => props.item, (item) => {
  if (item) {
    const idx = props.items.findIndex(i => i.id === item.id)
    if (idx !== -1) {
      currentIndex.value = idx
      nextTick(() => {
        carouselRef.value?.emblaApi?.scrollTo(idx, true)
      })
    }
  }
})

function onSelect(index: number) {
  currentIndex.value = index
}

// Visible thumbnails: max 5, centered on current index
const visibleThumbnails = computed(() => {
  const total = props.items.length
  if (total <= 5) {
    return props.items.map((item, index) => ({ item, index }))
  }

  let start = currentIndex.value - 2
  let end = currentIndex.value + 2

  if (start < 0) {
    end = Math.min(end + Math.abs(start), total - 1)
    start = 0
  }
  if (end >= total) {
    start = Math.max(start - (end - total + 1), 0)
    end = total - 1
  }

  return props.items.slice(start, end + 1).map((item, i) => ({ item, index: start + i }))
})

function scrollTo(index: number) {
  carouselRef.value?.emblaApi?.scrollTo(index)
}

// Copy prompt
async function copyPrompt() {
  if (!currentItem.value) return
  try {
    await navigator.clipboard.writeText(currentItem.value.prompt)
    copyLabel.value = '已複製！'
    setTimeout(() => { copyLabel.value = '複製 Prompt' }, 2000)
  }
  catch {
    // silent fail
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

// Browser history integration
watch(isOpen, (open) => {
  if (open && currentItem.value) {
    window.history.pushState({}, '', '?item=' + currentItem.value.id)
  }
  else if (!open) {
    window.history.pushState({}, '', window.location.pathname)
  }
})

watch(currentIndex, () => {
  if (isOpen.value && currentItem.value) {
    window.history.replaceState({}, '', '?item=' + currentItem.value.id)
  }
})

function onPopState() {
  isOpen.value = false
}

onMounted(() => window.addEventListener('popstate', onPopState))
onUnmounted(() => window.removeEventListener('popstate', onPopState))
</script>

<style scoped>
.gallery-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4a4a4e;
}

.gallery-divider {
  height: 1px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02), transparent);
}

/* Carousel arrow overrides for dark context */
.gallery-lightbox :deep(button[aria-label]) {
  background: rgba(255, 255, 255, 0.06) !important;
  color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
  transition: all 0.3s;
}
.gallery-lightbox :deep(button[aria-label]:hover) {
  background: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Thin scrollbar for metadata panel */
.gallery-lightbox ::-webkit-scrollbar {
  width: 4px;
}
.gallery-lightbox ::-webkit-scrollbar-track {
  background: transparent;
}
.gallery-lightbox ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}
.gallery-lightbox ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
