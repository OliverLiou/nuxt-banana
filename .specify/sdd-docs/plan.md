# 專案功能實作計畫 (Plan Phase)

## 1. 專案首頁 (Public Gallery View)
- **資料獲取邏輯**：
  - 使用 `/shared/utils/getGalleryItems`依照`isActive == true`，再根據`created_at`欄位遞減排序`。 同時提供給 Hero Section 與 Gallery Grid 使用 。
  - 查詢條件：。

### 1.1 視覺焦點區塊 (Hero Section)
- **元件實作 (`UPageCTA`)**：
  - `title` 屬性綁定專案名稱。
  - `description` 屬性透過隨機字串陣列在 `onMounted` 階段動態賦值。
  - `links` 屬性傳入陣列：`[{ label: '瀏覽更多', color: 'neutral', variant: 'subtle', to: '#gallery-grid' }]`，引導滾動。
  - **斷點邏輯**:
    - `md` 以上：`orientation="vertical"`。
    - `md` 以下：`orientation="horizontal"`。
- **畫廊跑馬燈 (`UMarquee`)**：
  - 放置於 `UPageCTA` 的預設 slot 中。
  - 響應式控制：利用 `@vueuse/core` 的 `useWindowSize` 或 Tailwind 斷點監聽，動態切換 `orientation` 屬性。
  - **斷點邏輯**：
    - `md` 以上：將圖片陣列分割為三等份，使用三個 `<UMarquee>` 呈三欄排列。當迴圈 index % 3 = 1 時，設定 `reverse="true"`，`orientation="vertical"`。
    - `md` 以下：`orientation="horizontal"`，單一元件水平滾動。
  
### 1.2 作品集展示區塊 (Gallery Grid)
- **外層容器**：使用 `<UScrollArea orientation="vertical">` 包覆，並設定明確的高度 (`h-[calc(...)]`) 以啟動內部滾動。
- **卡片渲染 (`UBlogPost`)**：
  - 使用 `v-for` 迭代獲取的資料。
  - 屬性綁定：`:title="item.title"`、`:image="item.image_url"`。
  - 標籤渲染：使用 `<template #badge>` slot，內部再透過 `v-for` 渲染 `item.badges`，使用 `<UBadge :variant="'outline'" :color="badge.color">` 呈現。
- **彈出視窗 (`UModal`)**：
  - 狀態控制：宣告 `const isOpen = ref(false)` 與 `const selectedItem = ref(null)`。點擊 `UBlogPost` 時將對應資料寫入 `selectedItem` 並開啟 Modal。
  - `FullScreen`屬性設為true，並將內容寫在content slot當中，不需要有額外的 header 與 footer。
  - Modal排版：
    - `md` 以上: 使用 `flex` 佈局，左側為輪播功能（寬度占比約 60%），右側為文字資訊（寬度占比約 40%）。
    - `md` 以下: 採用垂直堆疊，圖片置頂，文字資訊置底。
  - 輪播功能: 
    - 使用 `UCarousel` 元件
    - `items` 屬性綁定 `galleryItems`。
    - 透過 `selectedItem.id`找出在galleryItems中陣列的index後，綁定 `startIndex` 以顯示當前使用者點擊的圖片和對應文字資訊。
    - 設Previous/Next按鈕切換圖片。
    - 設定 `autoplay(delay: 1000)` 與 `loop` 屬性以實現自動循環播放。
    - 在UCarousel下方實作其他圖片的縮圖列表，可參考官方文件的 Thumbnail Carousel 範例(https://ui.nuxt.com/docs/components/carousel#with-thumbnails)，縮圖列表最多顯示五張即可
  - 文字資訊：
    - 標題: 使用`UInput`渲染 `selectedItem.title`，並將`disabled`屬性設為 `true`
    - 提示詞：使用`UTextarea`渲染 `selectedItem.prompt`，並將`disabled`屬性設為 `true`。
    - 日期：使用`UInputDate`渲染 `selectedItem.created_at`，格式化 `selectedItem.created_at` 為 `YYYY-MM-DD`，並將`disabled`屬性設為 `true`。 
    - 標籤：使用v-for迴圈搭配 `<UBadge :label="badge.label" :color="badge.color" />` 渲染 `selectedItem.badges`。