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
      exclude: ["fsevents", 'node_modules'],
    },
  },
  modules: [
    'vue3-carousel-nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  /* piniaPluginPersistedstate: {
    storage: 'localStorage', // 'sessionStorage', 'cookies'
  }, */
  /* supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false
  }, */
  imports:{
    dirs:[
      'composables',
      'composables/**',
    ]
  }
})



/* 
    '@nuxtjs/supabase',

supabase: {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
  redirect: false
}, */