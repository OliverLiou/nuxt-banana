# Contract: Gallery Data Operations

**Feature**: Public Gallery & Admin Dashboard
**Date**: 2026-03-13

## Supabase Client Usage

```ts
// 所有查詢使用 Nuxt 提供的 Supabase client
const client = useSupabaseClient()
```

## Public Gallery Composable Contract

```ts
// app/composables/useGallery.ts

interface UseGalleryReturn {
  // 資料
  items: Ref<GalleryItem[]>
  isLoading: Ref<boolean>
  hasMore: Ref<boolean>

  // 方法
  loadMore(): Promise<void>

  // 無限捲動
  sentinel: Ref<HTMLElement | null>  // IntersectionObserver target
}

// 查詢合約
const QUERY = {
  table: 'gallery_items',
  filter: { isActive: true },
  order: { column: 'created_at', ascending: false },
  pageSize: 12,  // 每次載入筆數
}
```

## Admin Gallery Composable Contract

```ts
// app/composables/useGalleryAdmin.ts

interface UseGalleryAdminReturn {
  // 資料
  items: Ref<GalleryItem[]>
  isLoading: Ref<boolean>

  // CRUD
  createItem(payload: CreateItemPayload): Promise<void>
  updateItem(id: string, payload: UpdateItemPayload): Promise<void>
  deleteItem(id: string): Promise<void>

  // 圖片上傳
  uploadImage(file: File): Promise<string>  // 回傳 public URL

  // 重新載入
  refresh(): Promise<void>
}

// 查詢合約（無 isActive 篩選）
const ADMIN_QUERY = {
  table: 'gallery_items',
  filter: {},  // 不篩選
  order: { column: 'created_at', ascending: false },
}
```

## Data Payloads

```ts
// 建立項目
interface CreateItemPayload {
  image_url: string    // 上傳後取得的 public URL
  title: string
  prompt: string
  badges: { label: string; color: string }[]
  isActive: boolean
}

// 更新項目
interface UpdateItemPayload {
  image_url?: string   // 有新圖片才更新
  title: string
  prompt: string
  badges: { label: string; color: string }[]
  isActive: boolean
}
```

## Image Upload Contract

```ts
interface ImageUploadContract {
  bucket: string            // Supabase Storage bucket 名稱
  acceptedFormat: 'image/webp'
  maxFileSize: 2_097_152    // 2MB in bytes
  fileNameStrategy: 'uuid'  // 使用 UUID 避免衝突

  // 上傳流程
  steps: [
    '1. 驗證檔案格式與大小',
    '2. 上傳至 Supabase Storage',
    '3. 取得 public URL',
    '4. 【阻斷】驗證 URL 可存取',
    '5. 回傳 URL（失敗則 throw Error）',
  ]
}
```

## Form Validation Contract

```ts
// <UForm :validate="validateForm">
interface FormValidationError {
  name: string     // 欄位名稱
  message: string  // 錯誤訊息
}

// validateForm 回傳型別
type ValidateForm = (state: FormState) => FormValidationError[]

// Create 模式檢查
const CREATE_RULES = [
  { field: 'upload_image', rule: '必須上傳圖片' },
  { field: 'title', rule: '不得為空' },
  { field: 'prompt', rule: '不得為空' },
  { field: 'badges', rule: '至少一個標籤' },
  { field: 'badges[].label', rule: '標籤名稱不得為空' },
]

// Edit 模式檢查
const EDIT_RULES = [
  { field: 'image_url', rule: '必須有圖片 URL' },
  { field: 'title', rule: '不得為空' },
  { field: 'prompt', rule: '不得為空' },
  { field: 'badges', rule: '至少一個標籤' },
  { field: 'badges[].label', rule: '標籤名稱不得為空' },
]
```

## Error Handling Contract

```ts
// 所有 CRUD 操作統一使用 Toast 回饋
interface OperationFeedback {
  success: {
    create: '項目建立成功'
    update: '項目更新成功'
    delete: '項目刪除成功'
  }
  error: {
    create: '建立失敗：{error.message}'
    update: '更新失敗：{error.message}'
    delete: '刪除失敗：{error.message}'
    upload: '圖片上傳失敗：{error.message}'
    urlVerify: '無法取得圖片公開網址，操作已中止'
  }
}
```
