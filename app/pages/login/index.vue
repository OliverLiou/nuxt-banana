<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
    <UPageCard class="w-full max-w-sm bg-gray-50">
      <UAuthForm
        title="歡迎回來!"
        description="請從下方選擇登入方式"
        icon="i-lucide-user"
        :providers="providers"
      />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const supabase = useSupabaseClient()
const session = useSupabaseSession()

const providers = ref<ButtonProps[]>([
  {
    label: '使用 Google 登入',
    icon: 'logos:google-icon',
    color: 'neutral',
    variant: 'outline',
    onClick: () => signInWithGoogle(),
  }
])

// Redirect to home if already logged in
watch(session, (s) => {
  if (s) navigateTo('/')
}, { immediate: true })

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: '/confirm',
    },
  })
  if (error) console.log(error)
}
</script>
