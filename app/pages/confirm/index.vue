<template>
  <div>Waiting for login...</div>
</template>

<script setup lang="ts">
const session = useSupabaseSession()

// Redirect to home once session is established (role fetch handled by app.vue)
watch(session, (s) => {
  if (s) navigateTo('/')
}, { immediate: true })
</script>
