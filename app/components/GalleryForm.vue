<template>
  <UForm
    :validate="validate"
    :state="formState"
    class="space-y-4"
    @submit="$emit('submit')"
  >
    <UFormField name="upload_image" label="圖片" required>
      <template v-if="formState.image_url && isEditMode">
        <div class="space-y-2">
          <img
            :src="formState.image_url"
            alt="預覽"
            class="h-40 w-full rounded-lg object-cover"
            @error="(e: Event) => (e.target as HTMLImageElement).src = '/placeholder.png'"
          >
          <UButton
            label="重新上傳"
            variant="outline"
            size="sm"
            icon="i-lucide-upload"
            @click="triggerUpload"
          />
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          >
        </div>
      </template>
      <template v-else>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
          @change="onFileChange"
        >
        <p v-if="formState.upload_image" class="mt-1 text-xs text-gray-500">
          {{ formState.upload_image.name }}
        </p>
      </template>
    </UFormField>

    <UFormField name="title" label="標題" required>
      <UInput v-model="formState.title" placeholder="請輸入標題" />
    </UFormField>

    <UFormField name="prompt" label="提示詞" required>
      <UTextarea v-model="formState.prompt" placeholder="請輸入提示詞" :rows="4" autoresize />
    </UFormField>

    <UFormField name="isActive" label="啟用狀態">
      <USwitch v-model="formState.isActive" />
    </UFormField>

    <UFormField name="badges" label="標籤" required>
      <div class="space-y-2">
        <div v-if="formState.badges.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="(badge, index) in formState.badges"
            :key="index"
            :label="badge.label"
            :color="badge.color"
            variant="outline"
            class="cursor-pointer"
            @click="removeBadge(index)"
          >
            <template #trailing>
              <UIcon name="i-lucide-x" class="size-3" />
            </template>
          </UBadge>
        </div>

        <div v-if="formState.badges.length < 10" class="flex items-end gap-2">
          <UInput
            v-model="newBadgeLabel"
            placeholder="標籤名稱"
            size="sm"
            class="flex-1"
            @keydown.enter.prevent="addBadge"
          />
          <USelect
            v-model="newBadgeColor"
            :options="badgeColorOptions"
            size="sm"
            class="w-28"
          />
          <UButton
            icon="i-lucide-plus"
            size="sm"
            variant="outline"
            :disabled="!newBadgeLabel.trim()"
            @click="addBadge"
          />
        </div>
        <p v-if="duplicateWarning" class="text-xs text-amber-500">
          此標籤名稱已存在
        </p>
      </div>
    </UFormField>
  </UForm>
</template>

<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { Badge, BadgeColor, GalleryFormState } from '#shared/types'

const { formState, isEditMode } = defineProps<{
  formState: GalleryFormState
  isEditMode: boolean
  validate: (state: Partial<GalleryFormState>) => FormError[]
}>()

defineEmits<{
  submit: []
}>()

const fileInputRef = useTemplateRef('fileInputRef')
const toast = useToast()

const newBadgeLabel = ref('')
const newBadgeColor = ref<BadgeColor>('primary')

const badgeColorOptions = [
  'primary', 'secondary', 'success', 'error', 'warning', 'info', 'neutral',
]

const duplicateWarning = computed(() => {
  if (!newBadgeLabel.value.trim()) return false
  return formState.badges.some((b: Badge) => b.label === newBadgeLabel.value.trim())
})

function addBadge() {
  const label = newBadgeLabel.value.trim()
  if (!label || duplicateWarning.value || formState.badges.length >= 10) return
  formState.badges.push({ label, color: newBadgeColor.value } as Badge)
  newBadgeLabel.value = ''
}

function removeBadge(index: number) {
  formState.badges.splice(index, 1)
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: '檔案大小不得超過 5MB', color: 'error' })
    return
  }
  formState.upload_image = file
  if (formState.image_url) {
    formState.image_url = null
  }
}
</script>
