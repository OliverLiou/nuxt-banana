import type { FormError } from '@nuxt/ui'
import type { GalleryFormState } from '#shared/types'
import type { Json } from '~/types/database.types'

export const useGalleryAdmin = () => {
  const supabase = useSupabaseClient()
  const store = useGalleryStore()
  const toast = useToast()

  const allItems = computed(() => store.allItems)
  const isEditMode = computed(() => store.isEditMode)

  // ── Fetch All Items ──
  async function fetchAll() {
    store.setAdminPending(true)
    store.setAdminError(null)

    const { data, error: fetchError } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      store.setAdminError(fetchError.message)
      toast.add({ title: '載入失敗', color: 'error' })
    } else {
      store.setAllItems((data as GalleryItem[]) ?? [])
    }

    store.setAdminPending(false)
  }

  // ── Image Upload ──
  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `nbp-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      toast.add({ title: '圖片上傳失敗', description: uploadError.message, color: 'error' })
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  // ── Form Submit (Create or Update) ──
  async function submitForm() {
    const form = store.formState

    let imageUrl = form.image_url
    if (form.upload_image) {
      const url = await uploadImage(form.upload_image)
      if (!url) return
      imageUrl = url
    }

    store.setAdminPending(true)

    if (isEditMode.value && form.id) {
      const { data, error } = await supabase
        .from('gallery_items')
        .update({
          title: form.title,
          image_url: imageUrl,
          prompt: form.prompt,
          badges: form.badges as unknown as Json,
          isActive: form.isActive,
        })
        .eq('id', form.id)
        .select()
        .single()

      if (error) {
        toast.add({ title: '更新失敗', description: error.message, color: 'error' })
      } else {
        toast.add({ title: '項目已更新', color: 'success' })
        store.updateItemInList(data as unknown as GalleryItem)
        store.closeSlideover()
      }
    } else {
      const { data, error } = await supabase
        .from('gallery_items')
        .insert({
          title: form.title,
          image_url: imageUrl,
          prompt: form.prompt,
          badges: form.badges as unknown as Json,
          isActive: form.isActive,
        })
        .select()
        .single()

      if (error) {
        toast.add({ title: '新增失敗', description: error.message, color: 'error' })
      } else {
        toast.add({ title: '項目已新增', color: 'success' })
        store.addItem(data as unknown as GalleryItem)
        store.closeSlideover()
      }
    }

    store.setAdminPending(false)
  }

  // ── Toggle isActive ──
  async function toggleActive(itemId: number, isActive: boolean) {
    const { error } = await supabase
      .from('gallery_items')
      .update({ isActive })
      .eq('id', itemId)

    if (error) {
      toast.add({ title: '更新失敗', color: 'error' })
    } else {
      toast.add({ title: '狀態已更新', color: 'success' })
      const item = store.allItems.find((i: GalleryItem) => i.id === itemId)
      if (item) store.updateItemInList({ ...item, isActive })
    }
  }

  // ── Delete Item ──
  async function deleteItem(item: GalleryItem) {
    const fileName = item.image_url.split('/').pop()
    if (fileName) {
      await supabase.storage.from('images').remove([fileName]).catch(() => {})
    }

    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      toast.add({ title: '刪除失敗', description: error.message, color: 'error' })
    } else {
      toast.add({ title: '項目已刪除', color: 'success' })
      store.removeItem(item.id)
    }
  }

  // ── Form Validation ──
  function validate(state: Partial<GalleryFormState>): FormError[] {
    const errors: FormError[] = []

    if (isEditMode.value) {
      if (!state.image_url) errors.push({ name: 'image_url', message: '圖片為必填' })
    } else {
      if (!state.upload_image) errors.push({ name: 'upload_image', message: '請上傳圖片' })
    }
    if (!state.title?.trim()) errors.push({ name: 'title', message: '標題為必填' })
    if (!state.prompt?.trim()) errors.push({ name: 'prompt', message: '提示詞為必填' })
    if (!state.badges?.length) errors.push({ name: 'badges', message: '至少需要一個標籤' })

    return errors
  }

  // ── Slideover Controls ──
  function openCreate() { store.openCreate() }
  function openEdit(item: GalleryItem) { store.openEdit(item) }
  function closeSlideover() { store.closeSlideover() }

  return {
    allItems,
    pending: toRef(store, 'adminPending'),
    error: toRef(store, 'adminError'),
    slideoverOpen: toRef(store, 'slideoverOpen'),
    editingId: toRef(store, 'editingId'),
    formState: toRef(store, 'formState'),
    isEditMode,
    fetchAll,
    submitForm,
    toggleActive,
    deleteItem,
    uploadImage,
    openCreate,
    openEdit,
    closeSlideover,
    validate,
  }
}
