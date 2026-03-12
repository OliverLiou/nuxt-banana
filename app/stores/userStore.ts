import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const role = ref<string | null>(null)

  const isAdmin = computed(() => role.value === 'admin')

  async function fetchRole() {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    if (!user.value) {
      role.value = null
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('roleId')
      .eq('userId', user.value.sub)
      .single()

    // console.log(data)

    if (error) {
      console.error('Failed to fetch role:', error.message)
      role.value = null
      return
    }

    role.value = data?.roleId ?? null
    // console.log(role.value)
  }

  function clearRole() {
    role.value = null
  }

  return {
    role,
    isAdmin,
    fetchRole,
    clearRole,
  }
})
