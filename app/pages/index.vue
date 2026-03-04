<template>
  <div class="h-screen w-full overflow-hidden bg-linear-to-br from-amber-50 via-white to-orange-50">
    <!-- MOBILE layout (< md) -->
    <div class="flex h-screen flex-col md:hidden">
      <div class="flex h-[50vh] items-center justify-center px-6">
        <div class="space-y-4 text-center">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Project
          </p>
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">
            🍌 Nuxt Banana
          </h1>
          <p class="mx-auto max-w-md text-base leading-relaxed text-gray-500">
            一個以 Nuxt 4 + Supabase 驅動的圖片展示畫廊
          </p>
        </div>
      </div>

      <div class="h-[50vh] overflow-hidden">
        <template v-if="items.length">
          <UMarquee orientation="horizontal" pause-on-hover>
            <div
              v-for="item in items"
              :key="item.id"
              class="mx-2 overflow-hidden rounded-xl shadow-md"
            >
              <img
                :src="item.image_url"
                :alt="item.title"
                class="h-48 w-auto"
              >
            </div>
          </UMarquee>
        </template>
        <div v-else-if="pending" class="flex h-full items-center gap-3 px-4">
          <USkeleton v-for="n in 4" :key="n" class="h-40 w-56 shrink-0 rounded-xl" />
        </div>
      </div>
    </div>

    <!-- DESKTOP layout (>= md) -->
    <div class="hidden h-screen md:grid md:grid-cols-2">
      <div class="flex items-center justify-center px-8 lg:px-16">
        <div class="space-y-5">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Project
          </p>
          <h1 class="text-5xl font-bold tracking-tight text-gray-900 lg:text-6xl">
            🍌 Nuxt Banana
          </h1>
          <p class="max-w-lg text-lg leading-relaxed text-gray-500">
            一個以 Nuxt 4 + Supabase 驅動的圖片展示畫廊
          </p>
        </div>
      </div>

      <div class="h-screen self-center p-4">
        <template v-if="items.length">
          <div class="grid h-full gap-3 md:grid-cols-3">
            <UMarquee
              v-for="(column, colIndex) in verticalColumns"
              :key="`col-${colIndex}`"
              orientation="vertical"
              pause-on-hover
              :reverse="colIndex % 3 === 1"
              :ui="{
                content: 'min-w-0'
              }"
            >
              <div v-for="item in column" :key="item.id" class="mb-3 px-1">
                <div>
                  <img
                    :src="item.image_url"
                    :alt="item.title"
                    class="h-48 w-full object-cover rounded-xl"
                  >
                </div>
              </div>
            </UMarquee>
          </div>
        </template>
        <div v-else-if="pending" class="grid h-full gap-3 md:grid-cols-3 2xl:grid-cols-4">
          <USkeleton v-for="n in 4" :key="n" :class="['h-full rounded-xl', n === 4 ? 'hidden xl:block' : '']" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, pending } = useGallery()

const verticalColumns = computed(() =>
  [0, 1, 2].map(colIndex =>
    items.value.filter((_: GalleryItem, i: number) => i % 3 === colIndex),
  ),
)
</script>
