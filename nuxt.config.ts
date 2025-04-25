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
  
  app: {
    head: {
      script: [
        {
          src: `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID}&currency=EUR`, // Use the environment variable
          async: true,
        }
      ],
    },
  },

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


  runtimeConfig: {
    // Server-only keys (not exposed to client)
    firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET, // Keep secret server-side

    // Public keys (exposed to client via NUXT_PUBLIC_)
    public: {
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID, // Client ID is often public
        environment: process.env.PAYPAL_ENVIRONMENT,
      }
      // Add other public keys here
    }
  },


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