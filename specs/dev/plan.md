# Implementation Plan: Public Gallery & Admin Dashboard

**Branch**: `dev` | **Date**: 2026-03-13 | **Spec**: specs/dev/spec.md
**Input**: Feature specification from `specs/dev/spec.md`

**Note**: This plan MUST comply with `.specify/memory/constitution.md`.

## Summary

建構一個公開畫廊首頁（含 Hero 跑馬燈 + 無限捲動卡片牆 + 細節彈窗）及管理員後台（含登入、UTable 列表、USlideover 表單 CRUD、圖片上傳驗證），所有資料透過 Supabase 存取，認證使用既有 `@nuxtjs/supabase` 模組。

**技術方案**：
- Hero：`UPageCTA` + `UMarquee`（桌面三欄垂直 / 手機水平）
- 畫廊：`UBlogPost` 卡片 + `UModal` 細節 + `useIntersectionObserver` 無限捲動
- 管理：`UTable`（render function）+ `USlideover` + `UForm`（自訂驗證）
- 認證：`useSupabaseSession()` 為狀態來源 + middleware 路由守衛

## Technical Context

**Language/Version**: TypeScript 5.x, Nuxt 4.3+, Vue 3.5+
**Primary Dependencies**: `@nuxt/ui` ^4.4.0, `@nuxtjs/supabase` ^2.0.3, `@pinia/nuxt` ^0.11.3, TailwindCSS ^4.1.18
**Storage**: Supabase/PostgreSQL (`gallery_items` 表) + Supabase Storage（圖片 .webp）
**Testing**: 不需要自動化測試；使用 `npx nuxi prepare` + `npm run build` + 手動驗證
**Target Platform**: 瀏覽器端 Nuxt 4 SPA（`ssr: false`）
**Project Type**: Brownfield Nuxt 4 應用，根目錄為 `app/`、`public/`、`shared/`
**Performance Goals**: 首頁載入 < 3 秒（SC-001），管理操作回饋 < 2 秒（SC-007）
**Constraints**: 不安裝新套件、僅使用 TailwindCSS、Pinia setup stores、明確 TypeScript 型別
**Scale/Scope**: 單一管理員角色，無搜尋/篩選功能

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Brownfield boundary is defined and no architectural or behavior change is planned without
      explicit user approval.
      → 現有程式碼幾乎全空（app.vue、index.vue 均為空白），新增不影響既有行為。
- [x] Existing composables, components, and `@nuxt/ui` primitives to reuse are identified.
      → 見 research.md §1：UPageCTA、UMarquee、UBlogPost、UTable、USlideover、UForm 等。
- [x] Route, styling, and state changes stay within `app/pages/`, TailwindCSS, and Pinia
      setup-store conventions.
      → 頁面放 `app/pages/`、樣式用 Tailwind、store 用 `defineStore` setup function。
- [x] TypeScript contract updates for props, emits, state, and API data are identified.
      → 見 contracts/auth-access.md 與 contracts/gallery-data.md。
- [x] Validation covers final diagnostics review and explains whether automated tests are
      intentionally omitted or explicitly requested.
      → 依 Constitution Principle VIII：不需自動測試，使用 `nuxi prepare` + `npm run build` + 手動驗證。
- [x] Component names follow PascalCase and Vue SFC block order is
      `<template>` → `<script setup lang="ts">` → `<style scoped>`.
      → 所有新元件遵循此慣例（見 Source Code 結構）。
- [x] Duplicated logic is extracted into reusable composables or components.
      → Supabase 查詢邏輯抽取至 `useGallery` / `useGalleryAdmin` composables。
- [x] No new packages or version-incompatible syntax are required.
      → 所有元件均來自已鎖定的 `@nuxt/ui` ^4.4.0 與 `@vueuse/core`（由 @nuxt/ui 間接引入）。

## Project Structure

### Documentation (this feature)

```text
specs/dev/
├── plan.md              # 本文件
├── spec.md              # 功能規格書
├── research.md          # Phase 0 技術研究
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 手動驗證步驟
├── contracts/           # Phase 1 技術合約
│   ├── auth-access.md   # 認證與存取控制合約
│   └── gallery-data.md  # 畫廊資料操作合約
├── checklists/
│   └── requirements.md  # 需求檢查清單
└── tasks.md             # Phase 2 任務分解（由 /speckit.tasks 產生）
```

### Source Code (repository root)

```text
app/
├── app.vue                          # 根元件：UApp 包裝 + auth session watcher
├── assets/
│   └── css/main.css                 # TailwindCSS + @nuxt/ui imports（已存在）
├── components/
│   ├── gallery/
│   │   ├── HeroSection.vue          # Hero：UPageCTA + UMarquee 跑馬燈
│   │   ├── GalleryGrid.vue          # 畫廊網格：UBlogPost 卡片 + 無限捲動
│   │   └── GalleryModal.vue         # 細節彈窗：UModal + 完整資訊展示
│   └── admin/
│       ├── GalleryTable.vue         # 管理列表：UTable + render functions
│       ├── GalleryForm.vue          # 建立/編輯表單：USlideover + UForm
│       └── BadgeEditor.vue          # Badge 管理：巢狀 UTable + UInput/USelect
├── composables/
│   ├── useGallery.ts                # 公開畫廊資料查詢 + 無限捲動邏輯
│   └── useGalleryAdmin.ts           # 管理 CRUD 操作 + 圖片上傳
├── middleware/
│   └── auth.ts                      # 路由守衛：未認證 → /login
├── pages/
│   ├── index.vue                    # 首頁：HeroSection + GalleryGrid + GalleryModal
│   ├── login.vue                    # 登入頁：Google OAuth
│   └── admin/
│       └── index.vue                # 管理後台：GalleryTable + GalleryForm
└── stores/
    └── user.store.ts                # 使用者角色狀態（fetchRole / clearRole）

shared/
└── types/
    └── index.d.ts                   # GalleryItem 全域型別（已存在）
```

**Structure Decision**：
- `app/components/gallery/` 與 `app/components/admin/`：依功能域分組，符合 Nuxt 4 慣例
- `app/composables/`：抽取可重用的 Supabase 查詢與上傳邏輯，避免元件內重複程式碼
- `app/stores/user.store.ts`：僅管理衍生角色狀態，`useSupabaseSession()` 仍為認證來源
- 無需建立新的頂層目錄，所有變更在 `app/` 內完成

## Complexity Tracking

> 所有項目均符合 Constitution，無需偏差說明。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| （無）| — | — |
