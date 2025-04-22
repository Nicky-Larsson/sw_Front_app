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
      authInfo: {
        email: null,
        uid: null,
        token: null,
      },
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
          if (this.authInfo.uid !== authInfo.uid) {
            this.authInfo.uid = authInfo.uid;
            this.authInfo.email = authInfo.email;
            console.log('User logged in:', this.authInfo);
            userStore.init();
          }
        } else {
          if (this.authInfo.uid) {
            this.clearSession();
            userStore.clearSession();
            console.log('User logged out, sessions cleared');
          }
        }
      });

    },
    /* registerUser(credentials) {
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password).then((userCredential) => {
        const authInfo = userCredential.user
        console.log('authInfo : ', authInfo)
      }).catch((error) => {
        console.log('error.message: ', error.message)
      })
    }, */

    async registerUser(credentials, additionalInfo) {
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

    async loginUser(credentials) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        this.authInfo.email = userCredential.user.email;
        this.authInfo.uid = userCredential.user.uid;
        console.log("Login successful:", this.authInfo);
        // Fetch and update user session data
        const userStore = useStoreUser();
        await userStore.getUserInfo();

        return true; // Return true for successful login
      } catch (error) {
        console.error("Login failed:", error.message);
        return false; // Return false for failed login
      }
    },
    async logoutUser() {
      try {
        const userStore = useStoreUser();

        // Save user data before logging out
        await userStore.setUserInfo();

        // Perform Firebase sign-out
        await signOut(auth);

        // Clear both auth and user sessions
        this.clearSession();
        userStore.clearSession();

        console.log('Logout successful, session and authInfo cleared');
      } catch (error) {
        console.error('Logout failed:', error.message);
      }
    },
    clearSession() {
      this.authInfo = {
        email: null,
        uid: null,
        token: null,
      };
      console.log('Auth session cleared:', this.authInfo);
    }
  }
})
