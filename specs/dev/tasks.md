# Tasks: Public Gallery & Admin Dashboard

**Input**: Design documents from `specs/dev/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: 依 Constitution Principle VIII，本專案不需要自動化測試。驗證以 `npx nuxi prepare` + `npm run build` + 手動驗證為主。

**Organization**: 任務依 User Story 優先順序分組，每個 Story 可獨立實作與驗證。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案、無依賴）
- **[Story]**: 所屬 User Story（US1, US2, US3, US4）
- 所有描述包含確切檔案路徑

## Path Conventions

- `app/pages/` — 路由頁面
- `app/components/gallery/` — 公開畫廊元件
- `app/components/admin/` — 管理後台元件
- `app/composables/` — 可重用邏輯
- `app/stores/` — Pinia setup stores
- `app/middleware/` — 路由守衛
- `shared/types/` — 共享型別（GalleryItem 已存在）

---

## Phase 1: Setup（專案初始化）

**Purpose**: 確認計畫、盤點現有資源、確認驗證策略

- [ ] T001 Review specs/dev/plan.md 中的 brownfield boundary、Source Code 結構，確認所有新增路徑均在 `app/` 內且無架構變更
- [ ] T002 Inventory 現有程式碼：確認 `app/app.vue`（空）、`app/pages/index.vue`（空）、`shared/types/index.d.ts`（GalleryItem 已定義）、`app/assets/css/main.css`（Tailwind + @nuxt/ui 已設定）為唯一既有檔案
- [ ] T003 [P] Confirm 驗證策略：`npx nuxi prepare` + `npm run build` + quickstart.md 中 13 項手動驗證步驟，不需自動化測試

---

## Phase 2: Foundational（阻斷性前置作業）

**Purpose**: 所有 User Story 共用的基礎架構，**必須全部完成後才能開始任何 Story 實作**

**⚠️ CRITICAL**: 此階段未完成前，不得開始 Phase 3+

- [ ] T004 Set up `app/app.vue` — 加入 `<UApp>` 包裝 `<NuxtPage>`，加入 `watch(useSupabaseSession())` 監聽器，session 建立時呼叫 `useUserStore().fetchRole()`，session 銷毀時呼叫 `clearRole()` 並 `navigateTo('/login')`。參考 specs/dev/contracts/auth-access.md App.vue Auth Watcher Contract
- [ ] T005 [P] Create `app/stores/user.store.ts` — Pinia setup store：`role` ref (`'admin' | null`)、`fetchRole()` async action、`clearRole()` action。型別定義參考 specs/dev/contracts/auth-access.md User Store Contract
- [ ] T006 [P] Create `app/middleware/auth.ts` — Nuxt route middleware：檢查 `useSupabaseSession()`，未認證則 `navigateTo('/login')`。參考 specs/dev/contracts/auth-access.md Auth Middleware Contract
- [ ] T007 [P] Create `app/pages/login.vue` — 使用 `useSupabaseAuthClient()` 的 `signInWithOAuth({ provider: 'google' })` 實作 Google OAuth 登入頁面，搭配 `UAuthForm` 或 `UButton` 觸發登入流程。參考 specs/dev/contracts/auth-access.md Login Flow Contract
- [ ] T008 Run `npx nuxi prepare && npm run build` 驗證 Phase 2 所有檔案無 TypeScript 錯誤

**Checkpoint**: 基礎架構就緒 — User Story 實作可開始

---

## Phase 3: User Story 1 — Public Gallery Browsing (Priority: P1) 🎯 MVP

**Goal**: 訪客可瀏覽公開畫廊、檢視細節、複製 prompt 文字

**Independent Test**: 在 Supabase 插入測試資料後，訪客可瀏覽、檢視細節、複製 prompt — 完整的唯讀使用者體驗（quickstart V-002, V-003, V-004）

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create `app/composables/useGallery.ts` — 實作公開畫廊資料查詢 composable：使用 `useSupabaseClient()` 查詢 `gallery_items` 表（`isActive=true`、`created_at DESC`）、分頁載入（pageSize=12）、`useIntersectionObserver` 無限捲動、匯出 `items`/`isLoading`/`hasMore`/`loadMore`/`sentinel` ref。參考 specs/dev/contracts/gallery-data.md Public Gallery Composable Contract 與 specs/dev/research.md §3
- [ ] T010 [P] [US1] Create `app/components/gallery/GalleryGrid.vue` — 使用 `UBlogPost` 以 `v-for` 渲染畫廊卡片（`:title`/`:image`/`#badge` slot 渲染 `UBadge`），包含 skeleton loading placeholder、空狀態友善訊息（FR-007）、sentinel 元素觸發無限捲動。點擊卡片 emit `select` 事件。參考 specs/dev/research.md §1.2
- [ ] T011 [P] [US1] Create `app/components/gallery/GalleryModal.vue` — `UModal` 顯示完整資訊：大圖、標題、prompt 文字、所有 `UBadge`、格式化 `created_at`（`YYYY-MM-DD`）。包含「Copy Prompt」按鈕使用 `navigator.clipboard.writeText()` + 成功 Toast 通知 + clipboard 不支援時的 fallback。接收 `modelValue`（boolean）+ `item`（GalleryItem | null）props
- [ ] T012 [US1] Implement `app/pages/index.vue` — 首頁整合：呼叫 `useGallery()` 取得資料，渲染 `GalleryGrid`（傳入 items/isLoading/hasMore/sentinel），處理 `@select` 開啟 `GalleryModal`（管理 `isOpen` + `selectedItem` ref）。Hero 區塊暫時以 placeholder 留空（Phase 4 補上）
- [ ] T013 [US1] Run `npx nuxi prepare && npm run build` 驗證 US1 所有檔案無 TypeScript 錯誤

**Checkpoint**: User Story 1 完成 — 訪客可瀏覽畫廊、檢視細節、複製 prompt

---

## Phase 4: User Story 2 — Hero Section & First Impression (Priority: P2)

**Goal**: 首頁頂部顯示 Hero 區塊，含主題描述與動態圖片跑馬燈

**Independent Test**: 載入首頁，Hero 區塊顯示主題描述與自動捲動的圖片跑馬燈，桌面三欄垂直、手機水平（quickstart V-001）

### Implementation for User Story 2

- [ ] T014 [P] [US2] Create `app/components/gallery/HeroSection.vue` — 實作 Hero 區塊：`UPageCTA`（title 為專案名稱、description 為動態隨機文字、links 包含「瀏覽更多」錨點連結至 `#gallery-grid`）。Default slot 放置 `UMarquee`：桌面（≥md）三欄垂直（圖片陣列分三等份，中欄 `reverse`）、手機（<md）單一水平。使用 `useWindowSize` 或 Tailwind 斷點監聽切換 `orientation`。接收 `items`（GalleryItem[]）prop 作為圖片來源。參考 specs/dev/research.md §1.1 與 .specify/sdd-docs/plan.md §2.1
- [ ] T015 [US2] Integrate HeroSection into `app/pages/index.vue` — 將 Phase 3 的 placeholder 替換為 `<HeroSection :items="items" />` 元件，傳入 `useGallery()` 的 active items 資料
- [ ] T016 [US2] Run `npx nuxi prepare && npm run build` 驗證 US2 所有檔案無 TypeScript 錯誤

**Checkpoint**: User Story 1 + 2 均可獨立運作

---

## Phase 5: User Story 3 — Admin Gallery Management (Priority: P3)

**Goal**: 認證管理員可透過後台管理畫廊項目（CRUD 完整操作）

**Independent Test**: 以管理員登入後，執行完整的新增-編輯-刪除流程，驗證 Toast 回饋與列表即時更新（quickstart V-007 ~ V-012）

### Implementation for User Story 3

- [ ] T017 [P] [US3] Create `app/composables/useGalleryAdmin.ts` — 管理 CRUD composable：`useSupabaseClient()` 查詢全部 `gallery_items`（無 isActive 篩選、`created_at DESC`）、`createItem(payload)`、`updateItem(id, payload)`、`deleteItem(id)`、`uploadImage(file)` → 上傳至 Supabase Storage → 取得 public URL → **驗證 URL 可存取（阻斷機制）** → 回傳 URL。所有操作使用 Toast 回饋成功/失敗。參考 specs/dev/contracts/gallery-data.md Admin Gallery Composable Contract + Image Upload Contract + Error Handling Contract
- [ ] T018 [P] [US3] Create `app/components/admin/BadgeEditor.vue` — Badge 管理元件：使用 `UTable` 渲染 `formState.badges` 陣列，columns 使用 render function（`h()`）：label 欄位 `h(UInput)`、color 欄位 `h(USelect, { items: ['primary','red','green','blue','yellow','orange','purple','pink','neutral'] })`、actions 欄位 `h(UButton, { icon: 'lucide:trash' })` 刪除。包含「新增標籤」按鈕 `push({ label: '', color: 'primary' })`。接收 `modelValue`（Badge[]）prop + emit `update:modelValue`。參考 .specify/sdd-docs/plan.md §3.2 badges 段落
- [ ] T019 [P] [US3] Create `app/components/admin/GalleryForm.vue` — 建立/編輯表單元件：`USlideover` 包裝 `UForm`，`formMode` ref（'create' | 'edit'）。Create 模式：`UFileUpload`（accept=image/webp, max 2MB）+ `UInput`（title）+ `UTextarea`（prompt）+ `USwitch`（isActive, 預設 true）+ `BadgeEditor`。Edit 模式：`<img>` 顯示現有圖片 + `UInput`（id, disabled）+ 同上欄位。自訂驗證 `<UForm :validate="validateForm">`：create 檢查 upload_image/title/prompt/badges、edit 檢查 image_url/title/prompt/badges。提交時呼叫 `useGalleryAdmin` 的 create/update 方法。參考 specs/dev/contracts/gallery-data.md Form Validation Contract 與 .specify/sdd-docs/plan.md §3.2
- [ ] T020 [P] [US3] Create `app/components/admin/GalleryTable.vue` — 管理列表元件：`UTable` 定義 columns 使用 render function（`h()`）：image_url → `h('img')`、title → 文字、prompt → `h(UTextarea, { disabled: true })`、created_at → 格式化日期、isActive → `h(USwitch, { disabled: true })`、badges → `h('div', badges.map(b => h(UBadge)))`、actions → edit `h(UButton)` + delete `h(UButton)`。列表上方「新增」按鈕。Emit `create`/`edit(item)`/`delete(id)` 事件。參考 .specify/sdd-docs/plan.md §3.1
- [ ] T021 [US3] Create `app/pages/admin/index.vue` — 管理後台頁面：`definePageMeta({ middleware: ['auth'] })`。整合 `useGalleryAdmin()` + `GalleryTable` + `GalleryForm`。管理 slideover 開關狀態（`isSlideoverOpen`）、formMode、formState（`reactive`，edit 時 deep copy）。刪除操作使用 `UModal` 確認對話框（FR-011）。操作完成後呼叫 `refresh()` 更新列表
- [ ] T022 [US3] Run `npx nuxi prepare && npm run build` 驗證 US3 所有檔案無 TypeScript 錯誤

**Checkpoint**: User Story 1 + 2 + 3 均可獨立運作

---

## Phase 6: User Story 4 — Access Control & Safety (Priority: P4)

**Goal**: 確保未認證使用者無法存取管理功能，所有破壞性操作有確認步驟

**Independent Test**: 未認證狀態下瀏覽 `/admin` 被導向 `/login`；刪除操作需確認才執行（quickstart V-005, V-006, V-010）

### Implementation for User Story 4

- [ ] T023 [US4] Verify auth middleware in `app/middleware/auth.ts` 正確攔截所有 `/admin` 路由，未認證用戶導向 `/login`。若有缺漏則補強
- [ ] T024 [US4] Verify delete confirmation in `app/pages/admin/index.vue` 使用 `UModal` 確認對話框（取消保留項目、確認才刪除）。若有缺漏則補強
- [ ] T025 [US4] Verify image upload failure handling in `app/composables/useGalleryAdmin.ts` — URL 驗證失敗時阻斷提交、Toast 顯示錯誤、無資料寫入。若有缺漏則補強
- [ ] T026 [US4] Run `npx nuxi prepare && npm run build` 驗證 US4 變更無 TypeScript 錯誤

**Checkpoint**: 所有 User Stories 完成，存取控制與安全機制已驗證

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨 Story 的優化與最終驗證

- [ ] T027 [P] Responsive 驗證 — 檢查所有頁面在 desktop（≥1024px）、tablet（768-1023px）、mobile（<768px）的顯示與操作（FR-018, SC-009）
- [ ] T028 [P] Extract 重複邏輯 — 檢查所有 composables 與 components，將重複的 Supabase 查詢模式、Toast 通知模式、日期格式化等抽取為可重用函式
- [ ] T029 Run `npx nuxi prepare && npm run build` 最終建置驗證，確保零 TypeScript 錯誤與零警告
- [ ] T030 [P] Verify Constitution compliance — 確認 PascalCase 命名、SFC block 順序、無新套件、Pinia setup stores、TailwindCSS only
- [ ] T031 Complete manual validation — 依 specs/dev/quickstart.md 逐項執行 V-001 ~ V-013 手動驗證

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無依賴 — 可立即開始
- **Foundational (Phase 2)**: 依賴 Phase 1 完成 — **阻斷所有 User Stories**
- **US1 (Phase 3)**: 依賴 Phase 2 完成
- **US2 (Phase 4)**: 依賴 Phase 3 完成（需 `useGallery` composable + `index.vue` 頁面結構）
- **US3 (Phase 5)**: 依賴 Phase 2 完成（與 US1 獨立，可平行）
- **US4 (Phase 6)**: 依賴 Phase 5 完成（驗證 admin 功能的安全性）
- **Polish (Phase 7)**: 依賴所有 User Stories 完成

### User Story Dependencies

```text
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL
    ↓                ↓
Phase 3 (US1/P1)    Phase 5 (US3/P3)  ← 可平行
    ↓                    ↓
Phase 4 (US2/P2)    Phase 6 (US4/P4)
    ↓                    ↓
    └──────→ Phase 7 (Polish) ←──────┘
```

### Within Each User Story

- 共用型別與可重用邏輯 → 依賴頁面或元件之前
- 元件實作 → 頁面整合之前
- 頁面整合 → 驗證之前
- 完成一個 Story 後才進入下一個 Priority

### Parallel Opportunities

- Phase 2: T005, T006, T007 可平行（不同檔案）
- Phase 3: T009, T010, T011 可平行（composable + 兩個元件）
- Phase 5: T017, T018, T019, T020 可平行（composable + 三個元件）
- Phase 3 與 Phase 5 可平行（US1 與 US3 在 Phase 2 完成後獨立）
- Phase 7: T027, T028, T030 可平行

---

## Parallel Example: User Story 1

```text
# 平行啟動 US1 的獨立任務（Phase 2 完成後）：
Task: "T009 [P] Create useGallery composable in app/composables/useGallery.ts"
Task: "T010 [P] Create GalleryGrid component in app/components/gallery/GalleryGrid.vue"
Task: "T011 [P] Create GalleryModal component in app/components/gallery/GalleryModal.vue"

# 上述完成後，循序整合：
Task: "T012 Implement index.vue page integrating GalleryGrid + GalleryModal"
Task: "T013 Run diagnostics and build validation"
```

## Parallel Example: User Story 3

```text
# 平行啟動 US3 的獨立任務（Phase 2 完成後，可與 US1 平行）：
Task: "T017 [P] Create useGalleryAdmin composable in app/composables/useGalleryAdmin.ts"
Task: "T018 [P] Create BadgeEditor component in app/components/admin/BadgeEditor.vue"
Task: "T019 [P] Create GalleryForm component in app/components/admin/GalleryForm.vue"
Task: "T020 [P] Create GalleryTable component in app/components/admin/GalleryTable.vue"

# 上述完成後，循序整合：
Task: "T021 Implement admin/index.vue integrating table + form + delete confirmation"
Task: "T022 Run diagnostics and build validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — 阻斷所有 Stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 依 quickstart V-002 ~ V-004 驗證
5. 可獨立部署/展示

### Incremental Delivery

1. Setup + Foundational → 基礎就緒
2. + User Story 1 → 畫廊瀏覽 MVP（V-002 ~ V-004）→ Deploy
3. + User Story 2 → Hero 視覺體驗（V-001）→ Deploy
4. + User Story 3 → 管理後台 CRUD（V-007 ~ V-012）→ Deploy
5. + User Story 4 → 存取控制驗證（V-005, V-006）→ Deploy
6. Polish → 最終驗證（V-013 + 全部）→ Final Deploy

### Parallel Team Strategy

```text
Phase 2 完成後：
  Developer A: US1 (Phase 3) → US2 (Phase 4)
  Developer B: US3 (Phase 5) → US4 (Phase 6)
兩條線可平行，最後合併至 Phase 7 Polish
```

---

## Summary

| Metric | Value |
|--------|-------|
| 總任務數 | 31 |
| Phase 1 (Setup) | 3 |
| Phase 2 (Foundational) | 5 |
| Phase 3 (US1/P1) 🎯 MVP | 5 |
| Phase 4 (US2/P2) | 3 |
| Phase 5 (US3/P3) | 6 |
| Phase 6 (US4/P4) | 4 |
| Phase 7 (Polish) | 5 |
| 可平行任務 | 17 (標記 [P]) |
| 建議 MVP 範圍 | Phase 1 + 2 + 3 (13 tasks) |

---

## Notes

- [P] 任務 = 不同檔案、無依賴，可平行執行
- [Story] 標籤將任務對應至 spec.md 中的 User Story
- Component 檔名遵循 PascalCase（如 `GalleryCard.vue`）
- Vue SFC block 順序：`<template>` → `<script setup lang="ts">` → `<style scoped>`
- 每個 Story 結束時執行 diagnostics 確認零錯誤
- 每個任務或邏輯群組完成後 commit
- 實作 @nuxt/ui 元件時必須呼叫 `nuxt-ui` skill
- 避免：模糊任務、同檔案衝突、跨 Story 依賴破壞獨立性
