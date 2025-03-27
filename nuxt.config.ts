import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  build: {
    // transpile: ['@vue-hero-icons/outline'],
  },

  components:[
    {
      path:'~/components',
      pathPrefix: false
    }
  ],
  

  css: ['~/assets/css/input.css'],

  vite: {
    plugins: [
      tailwindcss()
    ],
    optimizeDeps: {
      exclude: ["fsevents"],
    },
  },
  modules: [
    'vue3-carousel-nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate',
  ],
  imports:{
    dirs:[
      'composables',
      'composables/**',
    ]
  }
})