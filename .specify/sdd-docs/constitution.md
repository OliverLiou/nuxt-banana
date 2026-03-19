- 此專案為 Brownfield，已有基本的功能及架構，除非使用者允許或指定否則嚴格禁止更改
- 若有可以直接使用的Composables請直接使用，不要重複做import的動作。例如 useRoute()，useRouter()，useFetch()，useAsyncData() 等等
- 元件命名規則請遵守大寫駝峰式命名法 (PascalCase)，例如: MyComponent.vue
- Nuxt 4 的頁面 (Pages) 必須放在 `pages` 目錄下，並且遵循 Nuxt 的路由規則來命名檔案和資料夾，例如: `pages/index.vue` 對應到根路由 `/`，`pages/about.vue` 對應到 `/about`
- 嚴格禁止自行安裝新的 npm/yarn 套件。
- 嚴格遵循 package.json中鎖定的 Nuxt 4 與 nuxt/ui 版本。禁止使用當前版本不支援的實驗性語法
- 優先使用已存在的Component或nuxt/ui，禁止重複造輪子
- 樣式實作必須使用 TailwindCSS
- 狀態管理，使用 Pinia套件，採用 Setup Stores (即 defineStore 內傳入 function) 的寫法
- 專案中所有程式碼必須符合 TypeScript 規範，不允許有任何 TypeScript 錯誤(errors)或警告(warnings)，有出現需要修正，若是在執行階段(即 npm run dev)後可以解決的問題，可以先忽略
- Component Props、Emit Events、Pinia State 以及 API Response Data 必須定義明確的 interface 或 type，以確保開發體驗 (DX) 與程式碼健壯性
- 使用 nuxt/ui 的元件時，type的定義，請透過 nuxt/ui 原模組來引入type
- 此專案不要求撰寫單元測試 (Unit Test) 或端對端測試 (E2E)
- 撰寫.vue檔案時，請嚴格遵守以下結構順序:
  1. `<template>` 區塊
  2. `<script setup lang="ts">` 區塊
  3. `<style scoped>` 區塊 (如有需要)
- speckit-implement階段，當任務需要實作 nuxt-ui 相關component時，務必使用 nuxt-ui skill
- 當程式碼出現重複性時，務必將重複的程式碼抽離成可重用的 Composable 或Component，以提升程式碼的可維護性與可讀性，例: h(resolveComponent('UButton')，{ ... }) => const UButton = resolveComponent('UButton'); h(UButton，{ ... })
- implement階段完成後，務必檢查寫完的程式碼有無warning或error