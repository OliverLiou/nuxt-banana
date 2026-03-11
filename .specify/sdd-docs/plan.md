## 展示畫廊頁面 (前台)
- **版面與載入實作**
  - 使用 `UScrollArea` Component 實作滾動範圍。利用響應式設計，當畫面 breakpoint 為 `md` 以上時，`orientation` 屬性設為 `vertical`，否則為 `horizontal`。
  - 圖片列表資料來源：從 `galleryStore` 取得 `items` 狀態。**注意：Store 在撈取或 computed 處理時，需確保僅回傳 `isActive === true` 的項目，並依 `created_at` 降冪 (DESC) 排序**。
  - 當 `items` 陣列為空時，需渲染一個空狀態元件提示使用者目前無資料。
- **單筆項目展示 (`UBlogPost`)**
  - 圖片展示搭配 `UBlogPost` Component 實作，屬性映射如下：
    - `title` → 綁定 `title`
    - `image` → 綁定 `image_url` (需設定 `@error` 事件處理圖片失效時的 Fallback Image)
  - 標籤渲染：透過 `UBlogPost` 的 `#badge` slot 搭配 `v-for` 渲染 `GalleryItem` 中的 `badges` 陣列，使用 `UBadge` 元件，`variant` 設為 `outline`，並將 `color` 屬性綁定至資料中的顏色值。其餘未指定的屬性請勿使用。
- **互動功能**
  - 在 `UBlogPost` 的 `footer` slot 區塊實作「複製提示詞」按鈕，按鈕不需要文字(label)，只需提供icon即可，按鈕外觀設定variant=outline、 color=neutral。
  - 按鈕使用 `UButton` Component。點擊後將 `prompt` 內容寫入剪貼簿，並透過 `useToast()` 觸發 Toast 提示訊息告知使用者「複製成功」，按鈕外觀設定variant=outline、 color=neutral。
  - 在 `UBlogPost` 的 `footer` slot 區塊實作「查看細節」按鈕，按鈕不需要文字(label)，只需提供icon即可，點擊後開啟modal，顯示細節屬性與資料。
  - 開啟細節 Modal後，需顯示以下內容(field說明也須包含)：
    - 圖片: 使用 html `<img>` 標籤，綁定 `image_url`，並設定適當的寬高與 `object-fit: cover` 樣式
    - 標題: 顯示 `GalleryItem.title`
    - 提示詞: 顯示 `GalleryItem.prompt`
    - 建立日期: 顯示 `GalleryItem.created_at` (格式化為 YYYY-MM-DD)
    - 標籤列表: 使用 `v-for` 搭配 `UBadge` Component 顯示 `GalleryItem.badges` 陣列中的每個標籤，並將 `color` 屬性綁定至資料中的顏色值

---

## 管理者頁面 (後台)
- **整體架構與列表**
  - 透過definePageMeta() 設定 middleware，供頁面驗證使用。
  - 此頁面需驗證角色，確保只有管理者能夠存取
    - 驗證規則: 若roleId為空(null or undefined)導入登入頁面，非admin角色，則導回首頁並跳出提示訊息'您無此頁面權限, 即將為您導回首頁'。
  - 登入成功後請透過supabase取得table: `profiles` 以`userId` 對應使用者的 `roleId` 欄位值，判斷是否為 `admin` 角色，並將角色資訊儲存在userStore中(不存在請新增)。
  - middleware的資料來源為userStore中的角色資訊，請確保在登入後正確更新userStore的角色狀態，以便middleware能夠正確驗證使用者權限。
  - 列表檢視使用 `UTable` Component 實作，欄位渲染邏輯定義於 `columns` 屬性中。
  - 列表的上方左側提供「新增」`UButton` 按鈕，點擊後開啟 `USlideover`，並初始化空白的表單狀態供使用者填寫。
  - 新增與編輯介面統一透過 `USlideover` 搭配 `UForm` Component 實作。**採用 UForm 的自訂驗證 (Custom Validation) 函式進行表單檢驗，驗證規則依據表單狀態區分如下：**
    - **新增模式 (Create)**：確保 `upload_image`、`title`、`prompt` 欄位具備有效值（不得為空），且 `badges` 陣列長度必須大於 0。
    - **編輯模式 (Edit)**：確保 `image_url`、`title`、`prompt` 欄位具備有效值（不得為空），且 `badges` 陣列長度必須大於 0。
- **UTable Columns 定義**
  - `image_url` (圖片): 渲染圖片縮圖 (若無圖片顯示，請以文字顯示'尚未設定圖片')。
  - `title` (標題): 直接顯示文字。
  - `prompt` (提示詞): 直接顯示文字 (可套用 truncate 避免破版)。
  - `created_at` (建立日期): 顯示 YYYY-MM-DD 格式，不可編輯。
  - **`isActive` (是否啟用)**: 顯示目前的啟用狀態。使用 `USwitch` Component，`disabled` 設為 `true`。
  - `badges` (標籤設定): 使用 `v-for` 搭配 `UBadge` Component 顯示該項目的所有標籤。
  - `actions` (操作): 提供「編輯」`UButton`(color= netural、variant=outline、 icon=lucide:edit)，點擊後將該筆資料帶入並彈出 `USlideover`；提供「刪除」UButton(color= error、variant=outline、icon=lucide:trash)，點擊需彈出確認視窗 (或使用原生 confirm)，確認後呼叫刪除 API。
- **UForm Fields 表單定義**
  **Edit Mode**
    - 使用Deep Copy將目前編輯的項目資料帶入表單狀態，避免直接修改到列表資料。
    - `id` (ID): 顯示編輯項目的 ID，使用 `UInput` Component，以 `id` 屬性綁定 `v-model`，並設定為 `disabled`。
    - `image_url` (圖片): 顯示目前圖片的縮圖。
    - `title` (標題): 使用 `UInput` Component，以 `title` 屬性綁定 `v-model`。
    - `prompt` (提示詞): 使用 `UTextarea` Component，以 `prompt` 屬性綁定 `v-model`。
    - `isActive` (是否啟用): 使用 `USwitch` Component，以 `isActive` 屬性綁定 `v-model`。
    - `badges` (標籤設定):
      - 顯示目前表單已設定的標籤設定，使用精簡版 `UTable`
      - Columns 設定:
          { 
            accessorKey: 'label',
            header: '標籤文字',
            cell: ({ row }) => {
              h(UInput, { 
                modelValue: row.original.label,
                'onUpdate:modelValue': (value) => row.original.label = value 
              })
            }
          }
          { 
            accessorKey: 'color',
            header: '顏色',
            cell: ({ row }) => h(USelect, {
              modelValue: row.original.color,
              items: /* 放入USelect支援的顏色 */ 
              'onUpdate:modelValue': (value) => row.original.color = value
            })
          }
          { 
            accessorKey: 'actions',
            header: '操作',
            cell: ({ row }) => { h(UButton, {
              color: 'error',
              variant: 'outline',
              icon: 'lucide:trash',
              onClick: () => {/* 刪除邏輯 */} 
              })
            }
          }
      - 提供新增按鈕在標籤列表的上方：點擊後，將新物件 Push 至表單的 `badges` 陣列中。
  
  **Create Mode**
    - `upload_image` (圖片): 提供檔案上傳功能，使用 `UFileUpload` Component，以 `upload_image` 屬性綁定 `v-model`，限制只能上傳圖片格式 (.webp)，並且檔案大小不得超過 2MB。
    - `title` (標題): 預設為null，使用 `UInput` Component，以 `title` 屬性綁定 `v-model`。
    - `prompt` (提示詞): 預設為null，使用 `UTextarea` Component，以 `prompt` 屬性綁定 `v-model`。
    - `isActive` (是否啟用): 預設為true，使用 `USwitch` Component，以 `isActive` 屬性綁定 `v-model`。
    - `badges` (標籤設定): 與 **Edit Mode** 相同
    
- **Supabase gallery_Items Table Info**
  - id: uuid, primary key
  - image_url: text
  - title: text
  - prompt: text
  - badges: jsonb(), IsNullable, Define as Array (ex: [{ "color": "neutral","label":"nature" }])
  - created_at: timestamptz, default now()
  - isActive: boolean, default true
  
- **Supabase profiles Table Info**
  - id: uuid, primary key
  - userId: uuid, foreign key (對應 auth.users 的 id 欄位)
  - roleId: text, foreign key (對應 roles.id 欄位)

- **Supabase roles Table Info**
  - id: text, primary key (ex: 'admin', 'user')
  - created_at: timestamptz, default now()