<template>
  <UModal v-model:open="open" :title="item?.title ?? ''" :close="true">
    <template #body>
      <div v-if="item" class="space-y-4">
        <div class="overflow-hidden rounded-lg bg-(--ui-bg-elevated)">
          <img
            :src="item.image_url"
            :alt="item.title"
            class="max-h-[60vh] w-full object-contain"
            loading="lazy"
            @error="onImageError"
          >
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

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function onImageError(e: Event) {
  (e.target as HTMLImageElement).src = '/placeholder.png'
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
