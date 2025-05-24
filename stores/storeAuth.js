import { defineStore } from 'pinia';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
// Remove direct imports of auth and db
// import { auth } from '@/js/firebase';
// import { db } from '@/js/firebase';
import { useStoreUser } from '@/stores/storeUser';
import { doc, setDoc } from 'firebase/firestore';
import { useNuxtApp } from '#app'; // Import useNuxtApp

export const useStoreAuth = defineStore('storeAuth', {
  state: () => {
    return {
      authInfo: {
        email: null,
        uid: null,
        token: null, // Note: Firebase Auth doesn't typically expose the token directly here
      },
    };
  },
  persist: {
    // Remove explicit storage, rely on global config from nuxt.config.ts
    // storage: piniaPluginPersistedstate.localStorage()
  },
  actions: {
    init() {
      const { $firebaseAuth } = useNuxtApp(); // Get injected Auth instance
      const userStore = useStoreUser();

      // Check if Auth is available
      if (!$firebaseAuth) {
        console.error("Firebase Auth not available via Nuxt plugin during init.");
        // Potentially clear local session if auth can't be checked
        this.clearSession();
        userStore.clearSession();
        return;
      }

      // Use the injected $firebaseAuth instance
      onAuthStateChanged($firebaseAuth, (authUserData) => { // Renamed param to avoid conflict
        if (authUserData) {
          // User is signed in
          if (this.authInfo.uid !== authUserData.uid) {
            console.log('Auth state changed: User logged in.');
            this.authInfo.uid = authUserData.uid;
            this.authInfo.email = authUserData.email;
            // Initialize user store AFTER confirming auth state
            userStore.getUserInfoDb(); // Fetch user data now that we know they are logged in
            // userStore.fetchAccessRights(true)
          }
        } else {
          // User is signed out
          if (this.authInfo.uid) { // Only clear if someone was previously logged in
            console.log('Auth state changed: User logged out.');
            this.clearSession(); // Clear auth store state
            userStore.clearSession(); // Clear user store state
          }
        }
      });
    },

    async registerUser(credentials, additionalInfo) {
      const { $firebaseAuth, $firestore } = useNuxtApp(); // Get injected instances


      // Check if services are available
      if (!$firebaseAuth || !$firestore) {
        console.error("Firebase Auth or Firestore not available for registration.");
        // Potentially throw an error or return a failure indicator
        return { success: false, error: "Initialization failed." };
      }

        try {
          // 1. Create Firebase Auth user
          const userCredential = await createUserWithEmailAndPassword(
            $firebaseAuth,
            credentials.email,
            credentials.password
          );
          const uid = userCredential.user.uid;
      
          // 2. Create Firestore user document
        const userDocRef = doc($firestore, 'users', uid);

        const userData = {
          email: credentials.email,
          alias: additionalInfo?.alias || 'Anonymous', // Use provided alias or default
          avatar: '',
          createdAt: new Date().toISOString(),
          access_rights: { graphic_novels: [] },
          cart: [],
          selectedArray: [],
          cart_added: '',
          checkout: [],
          consents: [],
          orders: [],
          last_order: '',
          favorite_arts: [],
          favorite_products: [],
          last_login: new Date().toISOString(), // Set initial last_login
          unsubscribe_demands: [],
          unsubscribe_status: 'inactive',
          defaultLanguage: 'en',
          choosedLanguage: 'fr'
        };

        await setDoc(userDocRef, userData);
        console.log('User document created in Firestore.');


        return { success: true };

      } catch (error) {
        console.error('Registration failed:', error.message);
        // Provide more specific feedback if possible
        return { success: false, error: error.message };
      }
    },

    async loginUser(credentials) {
      const { $firebaseAuth } = useNuxtApp(); // Get injected Auth instance

      if (!$firebaseAuth) {
        console.error("Firebase Auth not available for login.");
        return false; // Indicate failure
      }

      try {
        // Use the injected $firebaseAuth instance
        const userCredential = await signInWithEmailAndPassword($firebaseAuth, credentials.email, credentials.password);
        // Auth state change is handled by onAuthStateChanged in init(),
        // which will update authInfo and call userStore.getUserInfoDb()
        console.log("Login successful via signInWithEmailAndPassword.");
        console.log("userCredential:", userCredential.user);
        const authUserData = userCredential.user;
        this.authInfo.uid = authUserData.uid;
        this.authInfo.email = authUserData.email;
  
        const userStore = useStoreUser();
        await userStore.getUserInfoDb();

        return true; // Return true for successful login attempt
      } catch (error) {
        console.error("Login failed:", error.message);
        return false; // Return false for failed login attempt
      }
    },

    async logoutUser() {
      const { $firebaseAuth } = useNuxtApp();
      if (!$firebaseAuth) {
        console.error("Firebase Auth not available for logout.");
        return;
      }
      try {
        await signOut($firebaseAuth);
        console.log('SignOut called successfully.');
      } catch (error) {
        console.error('Logout failed:', error.message);
      }
    },

    clearSession() {
      // This clears the local Pinia state for auth
      this.authInfo = {
        email: null,
        uid: null,
        token: null,
      };
      console.log('Auth store session cleared:', this.authInfo);
    }
  }
});