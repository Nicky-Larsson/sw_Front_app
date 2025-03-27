// stores/session.js
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', {
  state: () => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [],
    checkout: []
  }),
  persist: true
})