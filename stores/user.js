// stores/user.js
import { defineStore } from 'pinia'

import {db} from '@/js/firebase.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [],
    checkout: []
  }),
  persist: true
})
