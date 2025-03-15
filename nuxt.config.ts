import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

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
    'vue3-carousel-nuxt'],
  imports:{
    dirs:[
      'composables',
      'composables/**',
    ]
  }
})