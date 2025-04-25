import { defineStore } from 'pinia'
import {db} from '@/js/firebase.js'
import { useStoreAuth } from '@/stores/storeAuth'
import { 
  collection,
  doc, deleteDoc, updateDoc, addDoc, 
  query, orderBy, setDoc, getDoc, writeBatch 
} from 'firebase/firestore'
import { toRaw } from 'vue';


export const useStoreUser = defineStore('storeUser', {

  state: () => ({
    userSession: initDefaultSession(), // Initialize userSession with the default structure
  }),
  persist: {
    storage: piniaPluginPersistedstate.localStorage()  
  },
  actions: {
    async init() {
      // this.initDefaultSession();
      
      // const authStore = useStoreAuth()
      //  peut etre exploiter pour récupérer les carts  


      // console.log(authStore.authInfo.uid)
      // userCollectionRef = collection(doc(db, 'users', authStore.authInfo.uid), 'cart')
      // userCollectionRef = doc(db, 'users', authStore.authInfo.uid)
      // const cartRef = collection(userCollectionRef, 'cart')
      // await addDoc(cartRef, { book: 'book1', date: '2023-10-01' })
      // const userDocRef = doc(db, 'users', authStore.authInfo.uid, 'cart', 'pina')
    },
    async getUserInfo() {
      const authStore = useStoreAuth()
      const userDocRef = doc(db, 'users', authStore.authInfo.uid)  
      try {
        const userDoc = await getDoc(userDocRef)

        const defaultCart = this.userSession.cart || []
        console.log('defaultCart : ', defaultCart)

        if (userDoc.exists()) {   
          console.log('Starting cart merge process...');
          console.log('Logged-in users cart:', userDoc.data().cart)
          
          // Get the logged-in users's cart
          const loggedInCart = userDoc.data().cart || []

          console.log('defaultCart:', defaultCart);
          console.log('loggedInCart:', loggedInCart);

          const mergedCart = [...loggedInCart]
          console.log('Initial mergedCart (copy of loggedInCart):', mergedCart);


          defaultCart.forEach((product) => {
            console.log('Processing product from defaultCart:', product);
            // Check if the product already exists in mergedCart item.id === product.id
            const existsInMergedCart = mergedCart.some((item) => 
              item.graphic_novel_uid  === product.graphic_novel_uid &&
              item.volume_uid   === product.volume_uid &&
              item.volume_name  === product.volume_name &&
              item.product_uid  === product.product_uid
              );

            console.log(`Does product with id ${product.id} exist in mergedCart?`, existsInMergedCart);

            if (!existsInMergedCart) {
              console.log('Adding product to mergedCart:', product);
              mergedCart.push(product);
            } 
          });

          // this.userSession = userDoc.data()
          // Update the users session with the merged cart
          this.userSession = {
            ...this.userSession, // Preserve existing session data
            ...userDoc.data(),
            cart: mergedCart,
          }
          
          console.log('Updated userSession:', this.userSession);

          // Save the merged cart back to the database
          // Only save to Firebase if there are changes to the cart
          if (defaultCart.length > 0) {
            console.log('Saving merged cart to Firebase...');
            await this.setUserInfo();
          }

        } else {
          console.log('No such document! Initializing default session...');
          this.userSession = initDefaultSession();
          await this.setUserInfo(); // Save the default session to Firebase
        }
      } catch (error) {
        console.error('Error retrieving user info:', error.message);
      }
    },

    async setUserInfo() {
      const authStore = useStoreAuth();
      const userDocRef = doc(db, 'users', authStore.authInfo.uid);

      const batch = writeBatch(db);
    
    
      // Sanitize userSession to remove undefined values
      const sanitizedUserSession = JSON.parse(JSON.stringify({
        cart: this.userSession.cart,
        selectedArray: this.userSession.selectedArray,
        last_login: this.userSession.last_login
      }));
    
      try {
        // Save the sanitized userSession to Firestore
        batch.set(userDocRef, sanitizedUserSession, { merge: true });
    
        // Save consents data
        const userDocRefConsents = doc(db, 'users', authStore.authInfo.uid, 'consents', 'date_consent');
        const dataConsents = { date_infos: '2023-10-01' };
        batch.set(userDocRefConsents, dataConsents, { merge: true });
    
        // Save orders data
        const userDocRefOrders = doc(db, 'users', authStore.authInfo.uid, 'orders', 'date_order');
        const dataOrders = { date_infos: '2023-10-01' };
        batch.set(userDocRefOrders, dataOrders, { merge: true });
    
        // Commit the batch
        await batch.commit();
    
        console.log('User session saved to Firebase:', sanitizedUserSession);
      } catch (error) {
        console.error('Error saving user session:', error.message);
      }
    },


    clearSession() {
      this.userSession = {
        ...initDefaultSession(), // Reset to default session
        _cleared: true, // Mark the session as cleared
      };
      localStorage.removeItem('userSession'); // Clear persisted state
      console.log('User session cleared:', this.userSession);
    },


    clearCart() {
      this.userSession.cart = []
    },


    async createOrder(orderId, paymentChoice = 'paypal', status = 'pending') {
      const authStore = useStoreAuth();
    
      // Unwrap the reactive Proxy to get the plain array
      const plainCheckout = toRaw(this.userSession.checkout || []).map(item => toRaw(item));
    
      console.log("Checkout before saving (raw):", plainCheckout);
    
      // Filter out undefined values
      const filteredCheckout = plainCheckout.filter(item => item !== undefined);
      console.log("Filtered checkout:", filteredCheckout);
    
      // Calculate the total price
      const totalPrice = this.userSession.checkout.reduce((sum, item) => sum + parseInt(item.price || 0, 10), 0);
    
      // Format the current date and time
      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime.toISOString().replace(/[:.]/g, '-'); // Use ISO format and replace colons and dots with dashes
    
      // Reference to the orders collection
      const orderDocRef = doc(db, 'users', authStore.authInfo.uid, 'orders', orderId);
    
      const orderData = {
        userId: authStore.authInfo.uid || "unknown-user", // Fallback to "unknown-user" if uid is undefined
        paymentChoice: paymentChoice, // Payment method (PayPal)
        orderId: orderId || "unknown-order", // Use PayPal's order ID
        products: filteredCheckout, // Use the filtered plain array
        total: totalPrice,
        totalFormated: `${(totalPrice / 100).toFixed(2)} EUR`,
        createdFormated: formattedDateTime,
        createdAt: new Date().toISOString(),
        status: status, // Initial status (pending, paid, or failed)
      };
    
      try {
        // Save the order to Firestore
        await setDoc(orderDocRef, orderData);
        console.log("Order saved:", orderData);
        // Clear cart and checkout session
        this.userSession.cart = [];
        this.userSession.checkout = [];
        return orderId; // Return the order ID
      } catch (error) {
        console.error("Error saving order:", error.message);
        return null; // Indicate failure
      }
    },

    async updateOrderStatus(orderId, status) {
      const authStore = useStoreAuth();
    
      try {
        const orderDocRef = doc(db, 'users', authStore.authInfo.uid, 'orders', orderId);
        await updateDoc(orderDocRef, { status: status });
        console.log(`Order ${orderId} updated to status: ${status}`);
      } catch (error) {
        console.error(`Error updating order ${orderId} to status ${status}:`, error.message);
      }
    },

    async createOrderWithStripe(orderId, paymentChoice = 'stripe', status = 'pending') {
      const authStore = useStoreAuth();
    
      // Unwrap the reactive Proxy to get the plain array
      const plainCheckout = toRaw(this.userSession.checkout || []).map(item => toRaw(item));
    
      console.log("Checkout before saving (raw):", plainCheckout);
    
      // Filter out undefined values
      const filteredCheckout = plainCheckout.filter(item => item !== undefined);
      console.log("Filtered checkout:", filteredCheckout);
    
      // Calculate the total price
      const totalPrice = this.userSession.checkout.reduce((sum, item) => sum + parseInt(item.price, 10), 0);
    
      // Format the current date and time
      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime.toISOString().replace(/[:.]/g, '-'); // Use ISO format and replace colons and dots with dashes
    
      // Generate a readable document name
      const documentName = `Order-${formattedDateTime}`;
    
      // Reference to the orders collection
      const orderDocRef = doc(db, 'users', authStore.authInfo.uid, 'orders', documentName);
    
      const orderData = {
        userId: authStore.authInfo.uid || "unknown-user", // Fallback to "unknown-user" if uid is undefined
        paymentChoice: paymentChoice, // Payment method (Stripe)
        orderId: orderId || "unknown-order", // Use paymentIntent.id as the order ID
        products: filteredCheckout, // Use the filtered plain array
        total: totalPrice,
        totalFormated: `${(totalPrice / 100).toFixed(2)} EUR`,
        createdFormated: formattedDateTime,
        createdAt: new Date().toISOString(),
        status: status, // Initial status (pending, paid, or failed)
      };
    
      try {
        // Save the order to Firestore
        await setDoc(orderDocRef, orderData);
        console.log("Order saved:", orderData);
    
        // Clear cart and checkout session
        this.userSession.cart = [];
        this.userSession.checkout = [];
        return documentName; // Return the order ID
      } catch (error) {
        console.error("Error saving order:", error.message);
        return null; // Indicate failure
      }
    }

    /* addToCart(item) {
      this.userSession.cart.push(item)
    },
    removeFromCart(itemIndex) {
      this.userSession.cart.splice(itemIndex, 1)
    },
    clearCart() {
      this.userSession.cart = []
    } */

  }
})


function initDefaultSession() {
        return {
          email: '',
          alias: '',
          avatar: '',
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
          choosedLanguage:  'fr'
        }
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