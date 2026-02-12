<template>
  <UApp>
    <UContainer class="py-8">
      <h1 class="text-3xl font-bold mb-8">PostCard 展示</h1>
      <!-- 響應式 Grid 佈局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @click-image="handleImageClick"
        /> -->
      </div>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">


// 處理圖片點擊事件
const handleImageClick = (payload: { image: string; title: string }) => {
  console.log('圖片被點擊:', payload)
  // 未來可在此處理 Modal 顯示或其他邏輯
}
</script>
