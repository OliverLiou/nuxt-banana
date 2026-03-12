export default defineNuxtRouteMiddleware(async (_to) => {
  const userStore = useUserStore()
  const toast = useToast()
  
  console.log(userStore.role)
  if (!userStore.role) {
    return navigateTo('/login')
  }

  if (userStore.role !== 'admin') {
    toast.add({ title: '您無此頁面權限, 即將為您導回首頁', color: 'warning' })
    return navigateTo('/')
  }
})
