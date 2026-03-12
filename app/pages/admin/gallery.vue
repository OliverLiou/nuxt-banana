<template>
  <div class="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        📋 畫廊管理
      </h1>
      <UButton
        icon="i-lucide-plus"
        label="新增項目"
        @click="openCreate"
      />
    </div>

    <UTable
      :data="allItems"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    >
      <template #empty>
        <div class="py-8 text-center text-gray-400">
          尚無任何項目
        </div>
      </template>
    </UTable>

    <!-- Deactivation Confirmation Modal -->
    <UModal v-model:open="deactivateModalOpen" title="確認停用" :close="true">
      <template #body>
        <p>確定要停用此項目嗎？停用後將從公開畫廊隱藏。</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" label="取消" @click="cancelDeactivate" />
          <UButton color="warning" label="確認停用" :loading="togglingId !== null" @click="confirmDeactivate" />
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModalOpen" title="確認刪除" :close="true">
      <template #body>
        <p class="text-error">
          此操作無法復原，確定要刪除此項目嗎？
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" label="取消" @click="deleteModalOpen = false" />
          <UButton color="error" label="確認刪除" :loading="deleting" @click="confirmDelete" />
        </div>
      </template>
    </UModal>

    <!-- Slideover for Create/Edit -->
    <USlideover
      v-model:open="slideoverOpen"
      :title="isEditMode ? '編輯項目' : '新增項目'"
      side="right"
      :prevent-close="isDirty"
    >
      <template #body>
        <GalleryForm
          :form-state="formState"
          :is-edit-mode="isEditMode"
          :validate="validate"
          @submit="onFormSubmit"
        />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" label="取消" @click="handleSlideoverClose" />
          <UButton label="儲存" :loading="pending" @click="onFormSubmit" />
        </div>
      </template>
    </USlideover>

    <!-- Unsaved Changes Confirmation -->
    <UModal v-model:open="unsavedModalOpen" title="未儲存的變更" :close="true">
      <template #body>
        <p>您有未儲存的變更，確定要離開嗎？</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" label="繼續編輯" @click="unsavedModalOpen = false" />
          <UButton color="warning" label="放棄變更" @click="discardAndClose" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'

definePageMeta({ middleware: 'auth' })

const {
  allItems,
  pending,
  slideoverOpen,
  formState,
  isEditMode,
  fetchAll,
  submitForm,
  toggleActive,
  deleteItem,
  openCreate,
  openEdit,
  closeSlideover,
  validate,
} = useGalleryAdmin()

const UButton = resolveComponent('UButton')

onMounted(() => {
  fetchAll()
})

// ── Toggle with deactivation confirmation ──
const togglingId = ref<string | null>(null)
const deactivateModalOpen = ref(false)
const pendingDeactivateId = ref<string | null>(null)

function handleToggle(itemId: string, newValue: boolean) {
  if (!newValue) {
    pendingDeactivateId.value = itemId
    deactivateModalOpen.value = true
  }
  else {
    togglingId.value = itemId
    toggleActive(itemId, true).finally(() => {
      togglingId.value = null
    })
  }
}

async function confirmDeactivate() {
  if (pendingDeactivateId.value === null) return
  togglingId.value = pendingDeactivateId.value
  await toggleActive(pendingDeactivateId.value, false)
  togglingId.value = null
  pendingDeactivateId.value = null
  deactivateModalOpen.value = false
}

function cancelDeactivate() {
  pendingDeactivateId.value = null
  deactivateModalOpen.value = false
}

// ── Delete confirmation ──
const deleteModalOpen = ref(false)
const deleting = ref(false)
const itemToDelete = ref<GalleryItem | null>(null)

function confirmDeletePrompt(item: GalleryItem) {
  itemToDelete.value = item
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await deleteItem(itemToDelete.value)
    await fetchAll()
  }
  finally {
    deleting.value = false
    itemToDelete.value = null
    deleteModalOpen.value = false
  }
}

// ── Unsaved changes guard ──
const initialFormSnapshot = ref('')
const unsavedModalOpen = ref(false)

watch(slideoverOpen, (open) => {
  if (open) {
    initialFormSnapshot.value = JSON.stringify(formState.value)
  }
})

const isDirty = computed(() => {
  if (!slideoverOpen.value) return false
  return JSON.stringify(formState.value) !== initialFormSnapshot.value
})

function handleSlideoverClose() {
  if (isDirty.value) {
    unsavedModalOpen.value = true
  }
  else {
    closeSlideover()
  }
}

function discardAndClose() {
  unsavedModalOpen.value = false
  closeSlideover()
}

onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value) {
    const confirmed = window.confirm('您有未儲存的變更，確定要離開嗎？')
    next(confirmed)
  }
  else {
    next()
  }
})

// ── Form submit ──
async function onFormSubmit() {
  await submitForm()
  await fetchAll()
}

// ── Table columns ──
const columns: ColumnDef<GalleryItem>[] = [
  {
    accessorKey: 'image_url',
    header: '圖片',
    cell: ({ row }) => row.original.image_url
      ? h('img', {
          src: row.original.image_url,
          class: 'w-16 h-16 object-cover rounded',
          loading: 'lazy',
        })
      : h('span', { class: 'text-sm text-(--ui-text-muted)' }, '尚未設定圖片'),
  },
  {
    accessorKey: 'title',
    header: '標題',
  },
  {
    accessorKey: 'prompt',
    header: '提示詞',
    cell: ({ row }) => {
      const p = row.original.prompt
      return h('span', { class: 'truncate max-w-48 block' }, p?.length > 48 ? `${p.slice(0, 48)}...` : p)
    },
  },
  {
    accessorKey: 'created_at',
    header: '建立日期',
    cell: ({ row }) => {
      const d = row.original.created_at
      if (!d) return ''
      return new Date(d).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
  },
  {
    accessorKey: 'isActive',
    header: '啟用',
    cell: ({ row }) => h(resolveComponent('USwitch'), {
      modelValue: row.original.isActive,
      disabled: true,
    }),
  },
  {
    accessorKey: 'badges',
    header: '標籤',
    cell: ({ row }) => h('div', { class: 'flex flex-wrap gap-1' },
      row.original.badges.map(b =>
        h(resolveComponent('UBadge'), { label: b.label, color: b.color, variant: 'outline' }),
      ),
    ),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(UButton, {
        icon: 'i-lucide-pencil',
        color: 'neutral',
        variant: 'outline',
        size: 'xs',
        onClick: () => openEdit(row.original),
      }),
      h(resolveComponent('UButton'), {
        icon: 'i-lucide-trash-2',
        color: 'error',
        variant: 'outline',
        size: 'xs',
        onClick: () => confirmDeletePrompt(row.original),
      }),
    ]),
  },
]
</script>
