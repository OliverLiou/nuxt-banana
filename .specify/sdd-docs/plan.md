# 專案功能實作計畫 (Plan Phase)

## 1. 登入功能實作
- **身分驗證與 API (Authentication)**：
  - 呼叫 `@nuxtjs/supabase` 提供的 `useSupabaseAuthClient()` 進行驗證。
  - 使用 Supabase Auth 內建機制自動將 Session 寫入 Cookie 確保狀態持久化。
- **狀態管理 (State Management)**：
  - 建立 `stores/auth.store.ts`，使用 Pinia 的 `defineStore` 封裝狀態。包含 `user` (存放 Profile)、`isAuthenticated` (計算屬性) 以及 `logout` (執行 Supabase 登出) 的 Actions。
- **UI 實作 (Login Page)**：
  - 於 `/pages/login.vue` 引入 `UAuthForm` 元件。
  - 透過 `providers` 屬性設定 Google 登入選項：`[{ label: 'Google', icon: 'i-simple-icons-google', click: () => loginWithGoogle() }]`。
  - `loginWithGoogle` 函式內呼叫 `supabaseAuth.signInWithOAuth({ provider: 'google' })` 觸發 OAuth 流程。

## 2. 專案首頁 (Public Gallery View)
- **資料獲取邏輯**：
  - 使用 `useAsyncData` 搭配 `useSupabaseClient` 查詢 `gallery_items` 表。
  - 查詢條件：`.eq('isActive', true).order('created_at', { ascending: false })`。這份資料將使用 Vue 的 `ref` 或 `computed` 同時提供給 Hero Section 與 Gallery Grid 使用。

### 2.1 視覺焦點區塊 (Hero Section)
- **元件實作 (`UPageCTA`)**：
  - `title` 屬性綁定全域環境變數或寫死的專案名稱。
  - `description` 屬性透過隨機字串陣列在 `onMounted` 階段動態賦值。
  - `links` 屬性傳入陣列：`[{ label: '瀏覽更多', color: 'neutral', variant: 'subtle', to: '#gallery-grid' }]`，引導滾動。
- **畫廊跑馬燈 (`UMarquee`)**：
  - 放置於 `UPageCTA` 的預設 slot 中。
  - 響應式控制：利用 `@vueuse/core` 的 `useWindowSize` 或 Tailwind 斷點監聽，動態切換 `orientation` 屬性。
  - **斷點邏輯**：
    - `md` 以上：`orientation="vertical"`。將圖片陣列分割為三等份，使用三個 `<UMarquee>` 呈三欄排列。當迴圈 index 為 1（中間欄）時，設定 `reverse="true"`。
    - `md` 以下：`orientation="horizontal"`，單一元件水平滾動。

### 2.2 作品集展示區塊 (Gallery Grid)
- **外層容器**：使用 `<UScrollArea orientation="vertical">` 包覆，並設定明確的高度 (`h-[calc(...)]`) 以啟動內部滾動。
- **卡片渲染 (`UBlogPost`)**：
  - 使用 `v-for` 迭代獲取的資料。
  - 屬性綁定：`:title="item.title"`、`:image="{ src: item.image_url }"`。
  - 標籤渲染：使用 `<template #badge>` slot，內部再透過 `v-for` 渲染 `item.badges`，使用 `<UBadge :variant="'outline'" :color="badge.color">` 呈現。
- **彈出視窗 (`UModal`)**：
  - 狀態控制：宣告 `const isOpen = ref(false)` 與 `const selectedItem = ref(null)`。點擊 `UBlogPost` 時將對應資料寫入 `selectedItem` 並開啟 Modal。
  - 內部排版：
    - 圖片：`<img :src="selectedItem.image_url" class="w-full h-auto object-cover" />`。
    - 標題與提示詞：使用標準 HTML 標籤渲染 `selectedItem.title` 與 `selectedItem.prompt`。
    - 日期：使用 JavaScript 的 `Date` 物件與 `toLocaleDateString` 方法格式化 `selectedItem.created_at` 為 `YYYY-MM-DD`。 
    - 標籤：使用迴圈渲染 `<UBadge :label="badge.label" :color="badge.color" />`。

## 3. 管理者頁面 (Admin Dashboard)
- **路由防護**：於 `/pages/admin/index.vue` 使用 `definePageMeta({ middleware: ['auth'] })` 攔截未登入使用者。
- **資料獲取邏輯**：使用 `useAsyncData` 查詢 `gallery_items` 表，不設定 `isActive` 條件，完整撈取並依 `created_at` 降冪(desc)排序。

### 3.1 列表檢視 (`UTable`)
- **操作介面**：列表上方配置 `<UButton @click="openCreateSlideover">新增</UButton>`。
- **欄位定義 (Columns)**：在 `<script setup>` 中以 `resolveComponent()` 取得所需元件，並在 `columns` 陣列的各欄位中透過 `cell: ({ row }) => h(...)` Render Function 定義渲染邏輯：
  - `image_url`: `cell: ({ row }) => row.original.image_url ? h('img', { src: row.original.image_url, class: 'w-10 h-10 object-cover' }) : '尚未設定圖片'`。
  - `title`: 預設文字渲染（不需要 `cell`）。
  - `prompt`: `cell: ({ row }) => h(UTextarea , { class: 'truncate max-w-xs block' }, row.original.prompt)`，防止破版。
  - `created_at`: `cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('zh-TW')`，格式化為 `YYYY-MM-DD`。
  - `isActive`: `cell: ({ row }) => h(USwitch, { modelValue: row.original.isActive, disabled: true })`。
  - `badges`: `cell: ({ row }) => h('div', { class: 'flex flex-wrap gap-1' }, row.original.badges.map(badge => h(UBadge, { label: badge.label, color: badge.color })))`。
  - `actions`: `cell: ({ row }) => h('div', { class: 'flex gap-2' }, [h(UButton, { color: 'neutral', variant: 'outline', icon: 'lucide:edit', onClick: () => openEditSlideover(row.original) }), h(UButton, { color: 'error', variant: 'outline', icon: 'lucide:trash', onClick: () => confirmDelete(row.original.id) })])`（`confirmDelete` 需觸發 `UModal` 使用者同意(confirm)後才呼叫 API）。

### 3.2 表單實作 (`USlideover` + `UForm`)
- **狀態管理**：宣告 `const formMode = ref<'create' | 'edit'>('create')` 與 `const formState = reactive({ ... })`。開啟編輯時，使用 `JSON.parse(JSON.stringify(row))` 進行 Deep Copy 寫入 `formState`。
- **自訂驗證邏輯 (Custom Validation)**：
  - 於 `<UForm :validate="validateForm">` 綁定驗證函式。
  - `validateForm` 實作邏輯：
    - **新增模式 (`create`)**：檢查 `!state.upload_image`、`!state.title`、`!state.prompt`、`state.badges.length === 0`，若符合條件則推入錯誤陣列。
    - **編輯模式 (`edit`)**：檢查 `!state.image_url`、`!state.title`、`!state.prompt`、`state.badges.length === 0`，若符合條件則推入錯誤陣列。
- **表單提交流程與防呆 (Submit Handler)**：
  - 觸發 `@submit` 時，若為新增模式（或編輯模式有更新圖片），先呼叫 Supabase Storage API 進行圖片上傳。
  - **【關鍵阻斷機制】**：圖片上傳後，立即呼叫獲取公開網址（Public URL）的 API。**若回傳失敗或網址為空，必須 throw Error 終止流程，顯示 Toast 錯誤通知，並絕對禁止執行後續的資料庫 `insert` / `update` 操作**。
  - 取得有效 `image_url` 後，組合 Payload 寫入 Supabase 資料庫，完成後關閉 Slideover 並重新 fetch 列表。

- **表單欄位定義 (Fields Configuration)**
  - **Edit Mode (編輯模式)**
    - `id`: `<UInput v-model="formState.id" disabled />`
    - `image_url`: `<img :src="formState.image_url" ... />` 展示當前縮圖。
    - `title`: `<UInput v-model="formState.title" />`
    - `prompt`: `<UTextarea v-model="formState.prompt" />`
    - `isActive`: `<USwitch v-model="formState.isActive" />`
    - `badges`: 
      - 配置「新增標籤」按鈕：`@click="formState.badges.push({ label: '', color: 'primary' })"`。
      - 使用精簡版 `<UTable :rows="formState.badges" :columns="badgeColumns">` 渲染。
      - `badgeColumns` 實作：
        - `label`: 使用 Render Function `h(UInput, { modelValue: row.original.label, 'onUpdate:modelValue': (v) => row.original.label = v })`。
        - `color`: 使用 Render Function `h(USelect, { modelValue: row.original.color, items: ['primary', 'red', 'green', ...], 'onUpdate:modelValue': (v) => row.original.color = v })`。
        - `actions`: 使用 Render Function `h(UButton, { color: 'error', variant: 'outline', icon: 'lucide:trash', onClick: () => formState.badges.splice(index, 1) })`。
  
  - **Create Mode (新增模式)**
    - `upload_image`: `<UFileUpload v-model="formState.upload_image" accept="image/webp" :max-file-size="2097152" />` (限制 .webp 且小於 2MB)。
    - `title`: `<UInput v-model="formState.title" />` (預設為 null)。
    - `prompt`: `<UTextarea v-model="formState.prompt" />` (預設為 null)。
    - `isActive`: `<USwitch v-model="formState.isActive" />` (預設為 true)。
    - `badges`: 實作方式完全與 Edit Mode 相同。