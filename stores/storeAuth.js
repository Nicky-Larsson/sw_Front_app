import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/js/firebase'
import { useStoreUser } from '@/stores/storeUser'
//import { useStoreNotes } from '@/stores/storeNotes'

export const useStoreAuth = defineStore('storeAuth', {
  state: () => {
    return { 
      authInfo: {}
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage()  
  },
  actions: {
    init() {
      const storeUser = useStoreUser()
     // const storeNotes = useStoreNotes()
      
      onAuthStateChanged(auth, (authInfo) => {
        if (authInfo) {
          this.authInfo.id = authInfo.uid
          this.authInfo.email = authInfo.email
          console.log(this.authInfo)
          console.log(authInfo)
          //this.router.push('/')
          storeUser.init()
        } else {
          this.authInfo = {}
          //this.router.replace('/auth')

          //  Clear cart   
          //storeNotes.clearNotes()
        }
      })

    },
    registerUser(credentials) {
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const authInfo = userCredential.user
        console.log('authInfo : ', authInfo)
      }).catch((error) => {
        console.log('error.message: ', error.message)
      })
    },
    loginUser(credentials) {
      signInWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const authInfo = userCredential.user
        this.authInfo.email = authInfo.email
        this.authInfo.id = authInfo.uid
        console.log('authInfo: ', authInfo)
        console.log(this.authInfo.id)
        const storeUser = useStoreUser()
        storeUser.init()
        storeUser.getUserInfo()
      }).catch((error) => {
        console.log('error.message: ', error.message)
      })
    },
    logoutUser() {
      /* signOut(auth).then(() => {
        console.log('UserauthInfo signed out')
        this.authInfo = {}
      }).catch((error) => {
        console.log(error.message)
      }) */
      
      const storeUser = useStoreUser()
      
      storeUser.setUserInfo().then(() => {
        return signOut(auth)
      }).then(() => {
        console.log('UserauthInfo signed out')
        this.authInfo = {}

        storeUser.clearSession()

      }).catch((error) => {
        console.log(error.message)
      })

    }
  }
})