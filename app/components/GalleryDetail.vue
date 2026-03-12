<template>
  <UModal v-model:open="open" :title="item?.title ?? ''" :close="true">
    <template #body>
      <div v-if="item" class="space-y-4">
        <div class="overflow-hidden rounded-lg bg-(--ui-bg-elevated)">
          <img
            v-if="item.image_url && !imageError"
            :src="item.image_url"
            :alt="item.title"
            class="max-h-[60vh] w-full object-contain"
            loading="lazy"
            @error="imageError = true"
          >
          <div v-else class="flex h-48 items-center justify-center text-(--ui-text-muted)">
            尚未設定圖片
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="badge in item.badges"
            :key="badge.label"
            :label="badge.label"
            :color="badge.color"
            variant="outline"
          />
        </div>

        <p class="text-sm text-(--ui-text-muted)">
          {{ formatDate(item.created_at) }}
        </p>

        <UScrollArea orientation="vertical" class="max-h-48">
          <p class="whitespace-pre-wrap text-sm leading-relaxed">
            {{ item.prompt }}
          </p>
        </UScrollArea>
      </div>

      <div v-else class="flex items-center justify-center p-8 text-(--ui-text-muted)">
        此項目已不存在
      </div>
    </template>

    <template v-if="item" #footer>
      <UButton
        icon="i-lucide-copy"
        label="複製提示詞"
        variant="ghost"
        @click="copyPrompt"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: GalleryItem | null
}>()

const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const imageError = ref(false)

watch(() => props.item, () => {
  imageError.value = false
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

async function copyPrompt() {
  if (!props.item?.prompt) return
  try {
    await navigator.clipboard.writeText(props.item.prompt)
    toast.add({ title: '複製成功', color: 'success' })
  } catch {
    toast.add({ title: '複製失敗', color: 'error' })
  }
}
</script>
