<template>
  <UApp>
    <UContainer>
      <UButton v-if="user" label="logOut" @click="logout" />
      <NuxtPage />
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const session = useSupabaseSession()
const userStore = useUserStore()

// Centralized role fetch — session is updated synchronously (unlike user which uses async getClaims)
watch(session, async (newSession) => {
  if (newSession) {
    await userStore.fetchRole()
  } else {
    userStore.clearRole()
  }
}, { immediate: true })

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
