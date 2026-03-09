// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@pinia/nuxt'],
  ssr: false,
  app: {
    head: {
      title: 'Nuxt Banana',
    }
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'],
    },
    types: '~/types/database.types.ts'
  }
})