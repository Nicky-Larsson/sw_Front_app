import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/js/firebase'
import { useStoreUser } from '@/stores/storeUser'
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/js/firebase'; 
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
      const userStore = useStoreUser()
     // const storeNotes = useStoreNotes()
      
      onAuthStateChanged(auth, (authInfo) => {
        if (authInfo) {
          this.authInfo.uid = authInfo.uid
          this.authInfo.email = authInfo.email
          console.log(this.authInfo)
          console.log(authInfo)
          //this.router.push('/')
          userStore.init()
        } else {
          this.authInfo = {}
          //this.router.replace('/auth')

          //  Clear cart   
          //storeNotes.clearNotes()
        }
      })

    },
    /* registerUser(credentials) {
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const authInfo = userCredential.user
        console.log('authInfo : ', authInfo)
      }).catch((error) => {
        console.log('error.message: ', error.message)
      })
    }, */

    registerUser(credentials, additionalInfo) {
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then(async (userCredential) => {
          const authInfo = userCredential.user;
          console.log('authInfo : ', authInfo)

          // Validate and initialize additionalInfo fields
          const alias = additionalInfo?.alias || 'Anonymous'


          // Save additional user information (e.g., alias) in Firestore
          const userDocRef = doc(db, 'users', authInfo.uid); // Create a document for the user
          await setDoc(userDocRef, {
                email: authInfo.email,
                alias: additionalInfo.alias,
                avatar: '',
                createdAt: new Date().toISOString(),
                access_rights: {
                  graphic_novels: []
                },
                cart: [],
                selectedArray: [],
                cart_added: '',
                checkout: [],
                consents: [],
                orders: [],
                last_order: '',
                favorite_arts: [],
                favorite_products: [],
                last_login: '',
                unsubscribe_demands: [],
                unsubscribe_status: 'inactive',
                defaultLanguage: 'en',
                choosedLanguage:  'fr'
            })
            console.log('User document successfully created');

          })
        .catch((error) => {
          console.log('error.message: ', error.message);
        });
    },

    loginUser(credentials) {
      signInWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const authInfo = userCredential.user
        this.authInfo.email = authInfo.email
        this.authInfo.uid = authInfo.uid
        console.log('authInfo: ', authInfo)
        console.log(this.authInfo.uid)
        const userStore = useStoreUser()
        //storeUser.init()
        userStore.getUserInfo()
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
      
      const userStore = useStoreUser()
      
      userStore.setUserInfo().then(() => {
        return signOut(auth)
      }).then(() => {
        console.log('UserauthInfo signed out')
        this.authInfo = {}
        userStore.clearSession()

      }).catch((error) => {
        console.log(error.message)
      })

    }
  }
})
