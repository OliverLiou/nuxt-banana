<template>
  <div>
    <PostCard 
      v-for="item in items" 
      :key="item.id" 
      :item="item" 
      @click-image="handleImageClick"
      />
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const { data: items, pending, error } = await useAsyncData<GalleryItem[]>('gallery-items', async () => {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('isActive', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('取得資料時發生錯誤:', error.message)
    return []
  }

  return data 
}, {
  server: false, // 僅在客戶端執行
})

onMounted(() => {
  console.log('取得的 Gallery Items:', items.value)
})

// 處理圖片點擊事件
const handleImageClick = (payload: { image: string; title: string }) => {
  console.log('圖片被點擊:', payload)
  // 未來可在此處理 Modal 顯示或其他邏輯
}
</script>