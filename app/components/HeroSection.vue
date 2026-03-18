<template>
  <div>
    <!-- Mobile: single horizontal marquee -->
    <div class="block md:hidden">
      <UPageCTA
        title="Nuxt Banana Gallery"
        description="探索 AI 生成藝術的無限可能"
        orientation="horizontal"
        :links="ctaLinks"
      >
        <div v-if="activeItems.length" class="h-48">
          <UMarquee :overlay="false">
            <img
              v-for="item in activeItems"
              :key="item.id"
              :src="item.image_url"
              :alt="item.title"
              class="w-40 h-32 rounded-lg object-cover"
            />
          </UMarquee>
        </div>
      </UPageCTA>
    </div>

    <!-- Desktop: 3 vertical marquee columns -->
    <div class="hidden md:block">
      <UPageCTA
        title="Nuxt Banana Gallery"
        description="探索 AI 生成藝術的無限可能"
        orientation="horizontal"
        :links="ctaLinks"
      >
        <div v-if="activeItems.length" class="flex h-96 gap-4">
          <UMarquee
            v-for="col in 3"
            :key="col"
            orientation="vertical"
            :reverse="col === 2"
            :overlay="false"
            class="flex-1"
          >
            <img
              v-for="item in columns[col - 1]"
              :key="item.id"
              :src="item.image_url"
              :alt="item.title"
              class="w-full h-48 rounded-xl object-cover"
            />
          </UMarquee>
        </div>
      </UPageCTA>
    </div>
  </div>
</template>

<script setup lang="ts">
const { activeItems } = useGalleryItems()

const ctaLinks = [
  { label: '瀏覽更多', color: 'neutral' as const, variant: 'subtle' as const, to: '#gallery-grid' },
]

const columns = computed(() => [
  activeItems.value.filter((_, i) => i % 3 === 0),
  activeItems.value.filter((_, i) => i % 3 === 1),
  activeItems.value.filter((_, i) => i % 3 === 2),
])
</script>

<style scoped></style>
