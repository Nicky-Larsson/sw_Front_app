import { defineStore } from 'pinia';
import { useStoreAuth } from '@/stores/storeAuth';
import {
  collection,
  doc, deleteDoc, updateDoc, addDoc, getDocs,
  query, orderBy, setDoc, getDoc, writeBatch
} from 'firebase/firestore';
import { toRaw } from 'vue';
import { useNuxtApp } from '#app'; // Import useNuxtApp to access injected services



export const useStoreUser = defineStore('storeUser', {
  state: () => ({
    userSession: initDefaultSession(), // Initialize userSession with the default structure
  }),
  persist: {
    // storage: localStorage, 
  },
  actions: {
    // Keep your init action structure
    async init() {
      // console.log('StoreUser init action called');
      // Add any initialization logic needed here, potentially calling getUserInfoDb
    },

    async getUserInfoDb() {
      const { $firestore, $firebaseAuth } = useNuxtApp(); // Get injected instances
      const authStore = useStoreAuth();

      // Guard: If already loaded for this user, skip fetching again
      if (
        this.userSession &&
        this.userSession.email &&
        authStore.authInfo &&
        this.userSession.email === authStore.authInfo.email
      ) {
        console.log('getUserInfoDb: Session already loaded, skipping fetch.');
        return;
      }

      // Check if instances are available and user is logged in
      if (!$firestore || !$firebaseAuth || !authStore.authInfo?.uid) {
         console.error("Firestore/Auth not available or user not logged in for getUserInfoDb.");
         // Maybe reset to default session or handle error
         this.userSession = initDefaultSession();
         return;
      }

      // Use the injected $firestore instance
      const userDocRef = doc($firestore, 'users', authStore.authInfo.uid);
      try {
        const userDoc = await getDoc(userDocRef);

        // Keep your cart merging logic exactly as is
        const defaultCart = this.userSession.cart || [];
        console.log('defaultCart (from potentially persisted state): ', defaultCart);

        if (userDoc.exists()) {
          console.log('Starting cart merge process...');
          const loggedInCart = userDoc.data().cart || [];
          console.log('loggedInCart (from Firestore):', loggedInCart);

          const mergedCart = [...loggedInCart]; // Start with Firestore cart
          console.log('Initial mergedCart (copy of loggedInCart):', mergedCart);

          defaultCart.forEach((product) => {
            console.log('Processing product from defaultCart:', product);
            const existsInMergedCart = mergedCart.some((item) =>
              /* item.graphic_novel_uid === product.graphic_novel_uid &&
              item.volume_uid === product.volume_uid &&
              item.volume_name === product.volume_name &&
              item.product_uid === product.product_uid */
              
              item.product_uid.graphic_novel_uid === product.product_uid.graphic_novel_uid &&
              item.product_uid.volume_uid === product.product_uid.volume_uid &&
              item.product_uid.lang === product.product_uid.lang 


            );
            console.log(`Does product exist in mergedCart?`, existsInMergedCart);
            if (!existsInMergedCart) {
              console.log('Adding product to mergedCart:', product);
              mergedCart.push(product);
            }
          });

          // Update the user session state
          this.userSession = {
            ...initDefaultSession(), // Ensure all default fields are present
            ...userDoc.data(),      // Overwrite with Firestore data
            cart: mergedCart,       // Use the merged cart
            // Explicitly keep potentially non-Firestore fields if needed
            checkout: this.userSession.checkout,
            selectedArray: this.userSession.selectedArray,
            choosedLanguage: this.userSession.choosedLanguage || 'fr',
            defaultLanguage: this.userSession.defaultLanguage || 'en',
          };

          console.log('Updated userSession after merge:', this.userSession);

          // Save the potentially updated merged cart back to Firebase if defaultCart had items
          if (defaultCart.length > 0 && JSON.stringify(loggedInCart) !== JSON.stringify(mergedCart)) {
             console.log('Saving merged cart changes back to Firebase...');
             // await this.setUserInfo();
             await this.setCartInfoDb();
             // this.userSession.cart = [];
          }

        } else {
          console.error('User document missing in Firestore! This should not happen after registration.');
          this.userSession = initDefaultSession();
          // Optionally, show an error to the user or trigger a support alert
        }
      } catch (error) {
        console.error('Error retrieving user info:', error.message);
        // Consider resetting session on error
        this.userSession = initDefaultSession();
      }
    },


    async fetchAccessRights(forceRefresh = false) {
      const { $firestore } = useNuxtApp();
      const authStore = useStoreAuth();

      // Check if we already have access rights in the store and forceRefresh is false
      if (!forceRefresh && 
          this.userSession.access_rights && 
          Object.keys(this.userSession.access_rights).length > 0) {
        console.log('Using cached access rights from userSession');
        return this.userSession.access_rights;
      }

      // Otherwise fetch from Firestore
      if (!$firestore || !authStore.authInfo?.uid) {
        console.error("Firestore/Auth not available or user not logged in for fetchAccessRights.");
        return {};
      }

      try {
        console.log('Fetching access rights from Firestore');
        const accessRightsRef = collection($firestore, `users/${authStore.authInfo.uid}/access_rights`);
        const accessRightsSnapshot = await getDocs(accessRightsRef);
        const accessRights = {};
        
        accessRightsSnapshot.forEach((doc) => {
          accessRights[doc.id] = doc.data();
        });

        // Update the userSession with the fetched access rights
        this.userSession.access_rights = accessRights;
        
        console.log('Updated userSession with access rights:', accessRights);
        return accessRights;
      } catch (error) {
        console.error('Error fetching access rights:', error.message);
        return {};
      }
    },


    // Replace your existing fetchAccessRights with this more efficient approach
    async fetchNovelAccessRight(graphicNovelUid, forceRefresh = false) {
      const { $firestore } = useNuxtApp();
      const authStore = useStoreAuth();

      // Initialize access_rights object if it doesn't exist
      if (!this.userSession.access_rights) {
        this.userSession.access_rights = {};
      }

      // Return cached right if available and not forcing refresh
      if (!forceRefresh && this.userSession.access_rights[graphicNovelUid]) {
        console.log(`Using cached access right for novel: ${graphicNovelUid}`);
        return this.userSession.access_rights[graphicNovelUid];
      }

      // Check auth
      if (!$firestore || !authStore.authInfo?.uid) {
        console.error("Firestore/Auth not available or user not logged in");
        return null;
      }

      try {
        console.log(`Fetching access right for novel: ${graphicNovelUid}`);
        
        // Only fetch the specific document we need
        const novelDocRef = doc($firestore, 
          `users/${authStore.authInfo.uid}/access_rights/${graphicNovelUid}`);
        
        const novelDoc = await getDoc(novelDocRef);
        
        if (novelDoc.exists()) {
          // Cache this right in the session
          this.userSession.access_rights[graphicNovelUid] = novelDoc.data();
          console.log(`Cached access right for novel: ${graphicNovelUid}`);
          return novelDoc.data();
        } else {
          console.log(`No access right found for novel: ${graphicNovelUid}`);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching access right for ${graphicNovelUid}:`, error.message);
        return null;
      }
    },


    async hasAccessTo(graphicNovelUid, volumeUid = null, lang = null) {
      try {
        // Check if we need to fetch this novel's access rights
        if (!this.userSession.access_rights || 
            !this.userSession.access_rights[graphicNovelUid]) {
          
          console.log(`Access rights for ${graphicNovelUid} not loaded, fetching now...`);
          
          // Attempt to fetch the novel's access rights
          const novelAccess = await this.fetchNovelAccessRight(graphicNovelUid);
          
          // If we couldn't fetch the rights or the novel isn't found
          if (!novelAccess) {
            console.log(`No access to graphic novel: ${graphicNovelUid}`);
            return false;
          }
        }
        
        // Now we should have the access rights cached in the session
        const novelAccess = this.userSession.access_rights[graphicNovelUid];
        
        // If no specific volume is requested, just check for graphic novel access
        if (!volumeUid) {
          console.log(`User has access to graphic novel: ${graphicNovelUid}`);
          return true;
        }
        
        // Check volume access
        if (!novelAccess.volumes || !novelAccess.volumes[volumeUid]) {
          console.log(`No access to volume: ${volumeUid}`);
          return false;
        }
        
        // If no specific language is requested, just check for volume access
        if (!lang) {
          console.log(`User has access to volume: ${volumeUid}`);
          return true;
        }
        
        // Check language access
        const volumeAccess = novelAccess.volumes[volumeUid];
        const hasAccess = volumeAccess.all_languages || 
                        (volumeAccess.languages && volumeAccess.languages.includes(lang));
        
        console.log(`Access check for ${graphicNovelUid}/${volumeUid}/${lang}: ${hasAccess}`);
        return hasAccess;
      } catch (error) {
        console.error(`Error checking access for ${graphicNovelUid}:`, error);
        return false;
      }
    },


    async refreshPurchasedNovelAccess(purchasedItems) {
      if (!purchasedItems || purchasedItems.length === 0) return;
      
      console.log('Refreshing access rights for purchased items');
      
      // Extract unique graphic novel IDs from purchased items
      const novelIds = [...new Set(purchasedItems.map(item => 
        item.product_uid?.graphic_novel_uid
      ).filter(id => id))];
      
      // Fetch each novel's access rights individually
      const promises = novelIds.map(novelId => 
        this.fetchNovelAccessRight(novelId, true) // Force refresh
      );
      
      // Wait for all fetches to complete
      await Promise.all(promises);
      
      console.log(`Updated access rights for ${novelIds.length} novels`);
    },



    async initUserDocument() {
      const { $firestore, $firebaseAuth } = useNuxtApp();
      const authStore = useStoreAuth();
    
      if (!$firestore || !$firebaseAuth || !authStore.authInfo?.uid) {
        console.error("Firestore/Auth not available or user not logged in for initUserDocument.");
        return;
      }
    
      const userDocRef = doc($firestore, 'users', authStore.authInfo.uid);
      const dataToSave = {
        ...initDefaultSession(),
        email: authStore.authInfo.email || '',
        alias: authStore.authInfo.alias || '',
        userId: authStore.authInfo.uid || '',
        createdAt: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
    
      try {
        await setDoc(userDocRef, dataToSave, { merge: true });
        console.log('Initialized new user document:', dataToSave);
      } catch (error) {
        console.error('Error initializing user document:', error.message);
      }
    },

    async setUserInfo() {
      const { $firestore, $firebaseAuth } = useNuxtApp(); // Get injected instances
      const authStore = useStoreAuth();

      if (!$firestore || !$firebaseAuth || !authStore.authInfo?.uid) {
         console.error("Firestore/Auth not available or user not logged in for set_UserInfo.");
         return;
      }

      // Use the injected $firestore instance
      const userDocRef = doc($firestore, 'users', authStore.authInfo.uid);
      const batch = writeBatch($firestore); // Use injected $firestore

      // Keep your sanitization logic
      // Only save specific fields you intend to manage via set-UserInfo
      const dataToSave = {
        cart: this.userSession.cart || [],
        selectedArray: this.userSession.selectedArray || [],
        last_login: new Date().toISOString(),
        // alias: this.userSession.alias || 'no alias',
        // email: this.userSession.email || '',
        // Add any other fields you want to persist!
      };
      // Simple deep clone to avoid reactivity issues and undefined values for Firestore
      const sanitizedDataToSave = JSON.parse(JSON.stringify(dataToSave));

      try {
        // Save the specific userSession data to Firestore using merge
        batch.set(userDocRef, sanitizedDataToSave, { merge: true });

        // Keep your consents/orders batch logic if still needed
        // const userDocRefConsents = doc($firestore, 'users', authStore.authInfo.uid, 'consents', 'date_consent');
        // const dataConsents = { date_infos: '2023-10-01' }; // Example data
        // batch.set(userDocRefConsents, dataConsents, { merge: true });

        // const userDocRefOrders = doc($firestore, 'users', authStore.authInfo.uid, 'orders', 'date_order');
        // const dataOrders = { date_infos: '2023-10-01' }; // Example data
        // batch.set(userDocRefOrders, dataOrders, { merge: true });

        await batch.commit();
        console.log('User session data saved/merged to Firebase:', sanitizedDataToSave);
      } catch (error) {
        console.error('Error saving user session:', error.message);
      }
    },

    // Keep clearSession as is
    clearSession() {
      this.userSession = {
        ...initDefaultSession(),
        _cleared: true,
      };
      // localStorage.removeItem('userSession'); // Handled by pinia-plugin-persistedstate? Check its config.
      console.log('User session cleared:', this.userSession);
    },

   async setCartInfoDb() {
      const { $firestore, $firebaseAuth } = useNuxtApp();
      const authStore = useStoreAuth();
    
      if (!$firestore || !$firebaseAuth || !authStore.authInfo?.uid) {
        console.error("Firestore/Auth not available or user not logged in for setCartInfo.");
        return;
      }
    
      // Helper to remove undefined fields from objects
      function removeUndefinedFields(obj) {
        if (Array.isArray(obj)) {
          return obj
            .filter(item => item !== undefined && item !== null)
            .map(removeUndefinedFields);
        } else if (obj && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, removeUndefinedFields(v)])
          );
        }
        return obj;
      }
    
      // Clean cart and selectedArray
      const cleanCart = Array.isArray(this.userSession.cart)
        ? this.userSession.cart
            .filter(item => item !== undefined && item !== null)
            .map(removeUndefinedFields)
        : [];
    
      const cleanSelectedArray = Array.isArray(this.userSession.selectedArray)
        ? this.userSession.selectedArray
            .filter(item => item !== undefined && item !== null)
            .map(removeUndefinedFields)
        : [];
    
      const userDocRef = doc($firestore, 'users', authStore.authInfo.uid);
      const dataToSave = {
        cart: cleanCart,
        selectedArray: cleanSelectedArray,
        last_login: new Date().toISOString(),
      };
    
      console.log("dataToSave", dataToSave);
    
      try {
        await setDoc(userDocRef, dataToSave, { merge: true });
        console.log('Cart info saved to Firebase:', dataToSave);
      } catch (error) {
        console.error('Error saving cart info:', error.message);
      }
    },

    // Keep clearCart as is
    clearCart() {
      this.userSession.cart = [];
      this.userSession.checkout = [];
      this.userSession.selectedArray = [];
      console.log('Cart and Checkout cleared');
    },


    async setCheckoutInfoDb() {
      const { $firestore } = useNuxtApp();
      const authStore = useStoreAuth();

      if (!$firestore || !authStore.authInfo?.uid) {
        console.error("Firestore/Auth not available or user not logged in for setCheckoutInfoDb.");
        return null;
      }

      // Clean checkout items
      const cleanCheckout = Array.isArray(this.userSession.checkout)
        ? this.userSession.checkout
            .filter(item => item !== undefined && item !== null)
            .map(item => {
              // Deep clone and remove undefined fields
              return JSON.parse(JSON.stringify(item));
            })
        : [];

      // Calculate total price
      const totalPrice = cleanCheckout.reduce((sum, item) => 
        sum + parseInt(item.price || 0, 10), 0);

      const userDocRef = doc($firestore, 'users', authStore.authInfo.uid);
      const dataToSave = {
        checkout: cleanCheckout,
        checkoutTotal: totalPrice,
        checkoutTotalFormatted: `${(totalPrice / 100).toFixed(2)} EUR`,
        checkoutCreatedAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, dataToSave, { merge: true });
        console.log('Checkout info saved to Firebase:', dataToSave);
        return true;
      } catch (error) {
        console.error('Error saving checkout info:', error.message);
        return false;
      }
    },
    
    // Function to clear checkout after successful order
    async clearCheckoutData() {
      const { $firestore } = useNuxtApp();
      const authStore = useStoreAuth();

      if (!$firestore || !authStore.authInfo?.uid) {
        return;
      }

      try {
        const userDocRef = doc($firestore, 'users', authStore.authInfo.uid);
        await updateDoc(userDocRef, {
          checkout: [],
          checkoutTotal: 0,
          checkoutTotalFormatted: '0.00 EUR',
          checkoutCreatedAt: ''
        });
        
        // Also clear in local state
        this.userSession.checkout = [];
        console.log('Checkout data cleared');
      } catch (error) {
        console.error('Error clearing checkout data:', error);
      }
    },

    async createOrder(orderId, paymentChoice = 'paypal', status = 'pending') {
      const { $firestore, $firebaseAuth } = useNuxtApp(); // Get injected instances
      const authStore = useStoreAuth();

      if (!$firestore || !$firebaseAuth || !authStore.authInfo?.uid) {
         console.error("Firestore/Auth not available or user not logged in for createOrder.");
         return null; // Indicate failure
      }

      // Keep your order creation logic
      const plainCheckout = toRaw(this.userSession.checkout || []).map(item => toRaw(item));
      const filteredCheckout = plainCheckout.filter(item => item !== undefined);
      const totalPrice = filteredCheckout.reduce((sum, item) => sum + parseInt(item.price || 0, 10), 0);
      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime.toISOString().replace(/[:.]/g, '-');

      // Use the injected $firestore instance
      const orderDocRef = doc($firestore, 'users', authStore.authInfo.uid, 'orders', orderId);

      const orderData = {
        userId: authStore.authInfo.uid,
        paymentChoice: paymentChoice,
        orderId: orderId,
        products: filteredCheckout,
        total: totalPrice,
        totalFormated: `${(totalPrice / 100).toFixed(2)} EUR`,
        createdFormated: formattedDateTime,
        createdAt: new Date().toISOString(),
        status: status,
      };

      try {
        await setDoc(orderDocRef, orderData);
        console.log("Order saved:", orderData);

        // await this.manageLastOrder('set', orderId, new Date().toISOString());

        // Clear cart and checkout session after successful order creation
        this.clearCart(); // Use the dedicated action
        return orderId;
      } catch (error) {
        console.error("Error saving order:", error.message);
        return null;
      }
    },

    async updateOrderStatus(orderId, status) {
      const { $firestore, $firebaseAuth } = useNuxtApp(); // Get injected instances
      const authStore = useStoreAuth();

      if (!$firestore || !$firebaseAuth || !authStore.authInfo?.uid) {
         console.error("Firestore/Auth not available or user not logged in for updateOrderStatus.");
         return;
      }

      try {
        // Use the injected $firestore instance
        const orderDocRef = doc($firestore, 'users', authStore.authInfo.uid, 'orders', orderId);
        await updateDoc(orderDocRef, { status: status });
        console.log(`Order ${orderId} updated to status: ${status}`);
      } catch (error) {
        console.error(`Error updating order ${orderId} to status ${status}:`, error.message);
      }
    },
    

    // Keep commented out cart actions if you plan to use them later
    /* addToCart(item) {
      this.userSession.cart.push(item)
    },
    removeFromCart(itemIndex) {
      this.userSession.cart.splice(itemIndex, 1)
    } */
  }
});


function initDefaultSession() {
  return {
    email: '',
    alias: '',
    avatar: '',
    userId: null,
    lastOrderId: null, // Add this
    lastOrderTime: null, // Add this
    createdAt: '',
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
    choosedLanguage: 'fr'
  };
}




/* function testUserSession() {
  return {
            access_rights: { 
                            graphic_novels : [
                                                {
                                                  name: 'Sunset Land',
                                                  type: 'graphic novel',
                                                  title: 'volume_01',
                                                  all_languages: true,
                                                  purchased_languages: ['en', 'all']
                                                },
                                                {
                                                  name: 'Sunset Land',
                                                  type: 'graphic novel',
                                                  title: 'volume_02',
                                                  all_languages: false,
                                                  purchased_languages: ['fr']
                                                }
                                            ]
                            },
            alias: 'Eljid',
            cart: [],
            avatar: '',
            cart_added: '2023-10-01',
            email: authStore.authInfo.email,
            favorite_arts: ['art1', 'art2'],
            favorite_products: [],
            last_login: '2023-10-01 00:00:00',
            last_order: '2023-10-01',
            unsubscribe_demands: [
              { date: '2025-09-01', reason: 'no reason', dayleft: 30 , status: 'pending', canceldate: '' },
              { date: '2027-01-11', reason: 'stop email', dayleft: 30 , status: 'pending', canceldate: '' }
            ],
            unsubscribe_status: 'inactive'

         }

} */