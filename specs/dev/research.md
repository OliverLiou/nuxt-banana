# Research: Public Gallery & Admin Dashboard

**Date**: 2026-03-13 | **Spec**: specs/dev/spec.md

## 1. @nuxt/ui 元件選型

### 1.1 Hero Section

| 元件 | 用途 | 理由 |
|------|------|------|
| `UPageCTA` | Hero 區塊容器 | 提供 title / description / links 屬性，內建響應式排版 |
| `UMarquee` | 圖片跑馬燈 | 支援 `orientation` (vertical/horizontal) 與 `reverse` 屬性，適合動態展示 |

**響應式策略**：
- `md` 以上：三欄垂直 `UMarquee`（中欄反轉），嵌入 `UPageCTA` 的 default slot
- `md` 以下：單一水平 `UMarquee`
- 使用 `@vueuse/core` 的 `useWindowSize` 或 Tailwind 斷點判斷切換

### 1.2 Gallery Grid

| 元件 | 用途 | 理由 |
|------|------|------|
| `UBlogPost` | 畫廊卡片 | 內建 `:title` / `:image` / `#badge` slot，適合圖文展示 |
| `UModal` | 細節彈窗 | 覆蓋層顯示完整資訊，不跳離頁面 |
| `UBadge` | 分類標籤 | 支援 `color` / `variant` / `label` 屬性 |

### 1.3 Admin Dashboard

| 元件 | 用途 | 理由 |
|------|------|------|
| `UTable` | 資料表格 | 支援 `columns` 定義 + `cell` render function (`h()`) |
| `USlideover` | 表單面板 | 側滑覆蓋層，保持列表可見 |
| `UForm` | 表單容器 | 支援 `:validate` 自訂驗證函式 |
| `UInput` | 文字輸入 | 標題等短文字欄位 |
| `UTextarea` | 長文輸入 | Prompt 等多行文字 |
| `USwitch` | 開關切換 | isActive 狀態切換 |
| `USelect` | 下拉選擇 | Badge color 選擇 |
| `UButton` | 操作按鈕 | CRUD 操作觸發 |
| `UFileUpload` | 檔案上傳 | 支援 `accept` 與 `max-file-size` 限制 |

## 2. Supabase 整合模式

### 2.1 資料查詢

```ts
// 公開畫廊 — 僅活躍項目
const client = useSupabaseClient()
const { data } = await useAsyncData('gallery', () =>
  client.from('gallery_items')
    .select('*')
    .eq('isActive', true)
    .order('created_at', { ascending: false })
)

// 管理員 — 全部項目
const { data } = await useAsyncData('admin-gallery', () =>
  client.from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })
)
```

### 2.2 圖片上傳流程

```text
1. 使用者選擇 .webp 檔案 (≤ 2MB)
2. 呼叫 Supabase Storage API 上傳
3. 取得 Public URL
4. 【關鍵阻斷】驗證 URL 可存取 → 失敗則中止，不寫入 DB
5. 組合 payload 寫入 gallery_items 表
```

### 2.3 認證

- `useSupabaseSession()` 作為認證狀態的單一來源
- `useSupabaseAuthClient()` 執行 OAuth 登入
- Middleware 透過 session 判斷是否允許進入 admin 頁面

## 3. 無限捲動策略

**方案**：使用 `@vueuse/core` 的 `useIntersectionObserver` 搭配 Supabase 分頁查詢

```text
1. 初始載入 N 筆資料（如 12 筆）
2. 在列表底部放置 sentinel 元素
3. IntersectionObserver 偵測到 sentinel 可見時觸發載入
4. 使用 .range(from, to) 進行分頁查詢
5. 無更多資料時停止監聽
```

**注意**：`@vueuse/core` 已被 `@nuxt/ui` 間接引入，無需額外安裝。

## 4. 表單驗證策略

**方案**：`<UForm :validate="validateForm">` 自訂驗證

- Create 模式：檢查 `upload_image` + `title` + `prompt` + `badges.length > 0`
- Edit 模式：檢查 `image_url` + `title` + `prompt` + `badges.length > 0`
- Badge 子項：每個 `label` 不得為空白

## 5. 專案現有狀態分析

| 層級 | 現有內容 | 需建立 |
|------|----------|--------|
| Pages | `index.vue`（空） | `index.vue`（重寫）、`login.vue`、`admin/index.vue` |
| Components | 無 | Hero、Gallery、GalleryCard、GalleryModal、Admin 相關 |
| Composables | 無 | `useGallery`、`useGalleryAdmin` |
| Stores | 無 | `auth.store.ts`（角色管理） |
| Middleware | 無 | `auth.ts`（路由守衛） |
| Types | `GalleryItem`（已定義） | 表單狀態型別 |
| app.vue | 空 | 加入 `UApp` 包裝 + auth watcher |

## 6. 風險與緩解

| 風險 | 緩解方案 |
|------|----------|
| `UMarquee` 響應式切換可能有效能問題 | 使用 CSS 隱藏 + 條件渲染避免重複 DOM |
| 無限捲動在資料量小時體驗差 | 資料不足時隱藏 sentinel，顯示結束訊息 |
| Supabase Storage 上傳失敗無回饋 | 實作阻斷機制 + Toast 錯誤通知 |
| Clipboard API 瀏覽器不支援 | 使用 `navigator.clipboard` + fallback 方案 |
