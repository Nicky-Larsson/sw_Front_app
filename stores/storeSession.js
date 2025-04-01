import { defineStore } from 'pinia'
import {db} from '@/js/firebase.js'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', {
/*   state: () => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [],
    checkout: []
  },
  {
    persist: true
  }) */
  
  state: () => {
    const cart = ref([])
    const checkout = ref([])
    
    return { 
      isMenuOverlay: false,
      isLoading: false,
      cart: cart,
      checkout: checkout
    }
  },

  persist: {
    storage: piniaPluginPersistedstate.localStorage()  
  }

})
