<template>
  <!-- Mobile layout -->
  <section class="min-h-svh bg-[#FAFAF8] flex flex-col justify-center md:hidden">
    <div class="px-6 py-12 space-y-6 text-center">
      <h1 class="text-4xl font-light tracking-[0.2em] text-neutral-800">
        Nuxt Banana Gallery
      </h1>
      <div class="mx-auto w-12 h-px bg-amber-500/30" />
      <p class="text-neutral-400 tracking-wide font-light text-lg">
        探索 AI 生成藝術的無限可能
      </p>
      <div>
        <UButton
          color="neutral"
          variant="outline"
          label="瀏覽更多"
          to="#gallery-grid"
        />
      </div>
    </div>
    <div v-if="activeItems.length" class="h-[40vh]">
      <UMarquee :overlay="false">
        <div v-for="item in activeItems" :key="item.id" class="p-2">
          <img
            :src="item.image_url"
            :alt="item.title"
            class="w-40 h-32 rounded-2xl shadow-xl ring-1 ring-black/5 object-cover hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          />
        </div>
      </UMarquee>
    </div>
  </section>

  <!-- Desktop layout -->
  <section class="min-h-svh bg-[#FAFAF8] hidden md:flex items-center relative overflow-hidden">
    <!-- Left: Text content (in container flow, vertically centered) -->
    <div class="container mx-auto px-6 lg:px-12 relative z-10">
      <div class="w-2/5 space-y-6 text-left">
        <h1 class="text-5xl lg:text-6xl font-light tracking-[0.2em] text-neutral-800">
          Nuxt Banana Gallery
        </h1>
        <div class="w-12 h-px bg-amber-500/30" />
        <p class="text-neutral-400 tracking-wide font-light text-lg">
          探索 AI 生成藝術的無限可能
        </p>
        <div>
          <UButton
            color="neutral"
            variant="outline"
            label="瀏覽更多"
            to="#gallery-grid"
          />
        </div>
      </div>
    </div>
    <!-- Right: Marquee columns (absolute, full section height) -->
    <div v-if="activeItems.length" class="absolute top-0 bottom-0 right-0 w-3/5 flex gap-4 px-4 lg:px-8">
      <UMarquee
        v-for="col in 3"
        :key="col"
        orientation="vertical"
        :reverse="col === 2"
        :overlay="true"
        pause-on-hover
        class="flex-1"
      >
        <div v-for="item in columns[col - 1]" :key="item.id" class="p-3">
          <img
            :src="item.image_url"
            :alt="item.title"
            class="w-full h-48 rounded-2xl shadow-xl ring-1 ring-black/5 object-cover hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          />
        </div>
      </UMarquee>
    </div>
  </section>
</template>

<script setup lang="ts">
const { activeItems } = useGalleryItems()

const columns = computed(() => [
  activeItems.value.filter((_, i) => i % 3 === 0),
  activeItems.value.filter((_, i) => i % 3 === 1),
  activeItems.value.filter((_, i) => i % 3 === 2),
])
</script>

<style scoped></style>
