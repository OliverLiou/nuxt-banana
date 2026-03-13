# Contract: Authentication & Access Control

**Feature**: Public Gallery & Admin Dashboard
**Date**: 2026-03-13

## Auth State Source

```ts
// 認證狀態的唯一來源 — 不在 Pinia 中複製 session
const session = useSupabaseSession()
const isAuthenticated = computed(() => !!session.value)
```

## User Store Contract

```ts
// app/stores/user.store.ts
interface UserStoreState {
  role: 'admin' | null
}

interface UserStoreActions {
  fetchRole(): Promise<void>   // session 建立時呼叫
  clearRole(): void            // session 銷毀時呼叫
}

// 使用 Pinia setup store 模式
export const useUserStore = defineStore('user', () => {
  const role = ref<'admin' | null>(null)

  async function fetchRole(): Promise<void> { /* ... */ }
  function clearRole(): void { role.value = null }

  return { role, fetchRole, clearRole }
})
```

## Auth Middleware Contract

```ts
// app/middleware/auth.ts
// 路由守衛：檢查 useSupabaseSession()
// 未認證 → navigateTo('/login')
// 使用方式：definePageMeta({ middleware: ['auth'] })

export default defineNuxtRouteMiddleware((to) => {
  const session = useSupabaseSession()
  if (!session.value) {
    return navigateTo('/login')
  }
})
```

## Login Flow Contract

```ts
// app/pages/login.vue
// 使用 useSupabaseAuthClient() 進行 OAuth 登入
interface LoginFlow {
  provider: 'google'
  method: 'signInWithOAuth'
  redirect: '/confirm'  // nuxt.config.ts 已設定
}
```

## App.vue Auth Watcher Contract

```ts
// app/app.vue
// 監聽 session 變化，自動同步 user store
watch(useSupabaseSession(), (newSession) => {
  if (newSession) {
    useUserStore().fetchRole()
  } else {
    useUserStore().clearRole()
    navigateTo('/login')
  }
})
```

## Route Protection Matrix

| Route | Auth Required | Middleware | Redirect |
|-------|:---:|:---:|----------|
| `/` | ❌ | — | — |
| `/login` | ❌ | — | — |
| `/confirm` | ❌ | — | — |
| `/admin` | ✅ | `auth` | → `/login` |
| `/admin/*` | ✅ | `auth` | → `/login` |
