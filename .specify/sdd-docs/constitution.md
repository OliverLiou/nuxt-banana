- 此專案為 Brownfield 專案, 已有基本的功能及架構, 嚴格禁止更改, 經過使用者允許才可以更改.
- 若可以直接使用的Composables請直接使用, 不要重複做import的動作。例如 useRoute(), useRouter(), useFetch(), useAsyncData() 等等
- 此專案的元件命名規則請遵守: 大寫駝峰式命名法 (PascalCase), 例如: MyComponent.vue
- 嚴格禁止 自行安裝新的 npm/yarn 套件。
- 嚴格遵循 package.json 中鎖定的 Nuxt 4 與 @nuxt/ui 版本。禁止使用當前版本不支援的實驗性語法
- 優先使用 已存在的元件庫 或 @nuxt/ui, 禁止重複造輪子
- 樣式實作應優先使用 tailwindcss
- 全域狀態管理, 使用 Pinia套件, 採用 Setup Stores (即 defineStore 內傳入 function) 的寫法
- 專案中所有程式碼必須符合 TypeScript 規範, 且不允許有任何 TypeScript 錯誤。
- Component Props、Emit Events、Pinia State 以及 API Response Data 必須定義明確的 interface 或 type,以確保開發體驗 (DX) 與程式碼健壯性
- 使用 @nuxt/ui 的元件時, 型別的定義, 請透過 @nuxt/ui 原模組來引入型別
- 此專案 不要求 撰寫單元測試 (Unit Test) 或端對端測試 (E2E)
- 撰寫.vue檔案時, 請嚴格遵守以下結構順序:
  1. `<template>` 區塊
  2. `<script setup lang="ts">` 區塊
  3. `<style scoped>` 區塊 (如有需要)
- 實作nuxt/ui的元件時, 請透過 nuxt-ui skill 來實作 