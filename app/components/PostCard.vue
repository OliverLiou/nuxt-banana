<template>
  <UCard class="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <!-- 圖片區域 - 可點擊 -->
    <div 
      class="relative aspect-video w-full overflow-hidden cursor-pointer group"
      @click="handleImageClick"
    >
      <img 
        :src="item.image_url" 
        :alt="item.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <!-- 圖片右上角時間戳記 -->
      <div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {{ item.created_at }}
      </div>
    </div>

    <!-- 卡片內容 -->
    <div class="p-4 space-y-3">
      <!-- 標題 -->
      <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">
        {{ item.title }}
      </h3>

      <!-- Badge 標籤列表 -->
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(badge, index) in item.badges"
          :key="index"
          :label="badge.label"
          :color="badge.color"
          size="sm"
          variant="outline"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { item } = defineProps<{
 item: GalleryItem
}>()

const emit = defineEmits<{
  'click-image': [payload: { image: string; title: string }]
}>()

// 處理圖片點擊事件
const handleImageClick = () => {
  emit('click-image', { 
    image: item.image_url, 
    title: item.title 
  })
}
</script>
