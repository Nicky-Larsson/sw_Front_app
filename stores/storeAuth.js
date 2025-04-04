import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/js/firebase'
//import { useStoreNotes } from '@/stores/storeNotes'

export const useStoreAuth = defineStore('storeAuth', {
  state: () => {
    return { 
      user: {}
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage()  
  },
  actions: {
    init() {
      
     const storeNotes = useStoreNotes()
      
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // this.user.id = user.uid
          this.user.email = user.email
          //this.router.push('/')
          //storeNotes.init()
        } else {
          this.user = {}
          //this.router.replace('/auth')

          //  Clear cart   
          //storeNotes.clearNotes()
        }
      })

    },
    registerUser(credentials) {
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const user = userCredential.user
        console.log('user: ', user)
      }).catch((error) => {
        console.log('error.message: ', error.message)
      })
    },
    loginUser(credentials) {
      signInWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const user = userCredential.user
        this.user.email = user.email
        console.log('user: ', user)
      }).catch((error) => {
        console.log('error.message: ', error.message)
      })
    },
    logoutUser() {
      signOut(auth).then(() => {
        console.log('User signed out')
        this.user = {}
      }).catch((error) => {
        console.log(error.message)
      })
    }
  }
})