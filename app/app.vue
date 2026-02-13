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

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}
</script>
