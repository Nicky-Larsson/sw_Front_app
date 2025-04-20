import { defineStore } from 'pinia'
import {db} from '@/js/firebase.js'
import { useStoreAuth } from '@/stores/storeAuth'
import { 
  collection,
  doc, deleteDoc, updateDoc, addDoc, 
  query, orderBy, setDoc, getDoc, writeBatch 
} from 'firebase/firestore'

let userCollectionRef


export const useStoreUser = defineStore('storeUser', {
/*   state: () => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [],
    checkout: []
  },
  {
    persist: true
  }) 
    consents: [],
    orders: [],
    alias: '',
    email: authStore.authInfo.uid,
    cart: [],
    cart_date: '',
  */
  
  state: () => {
    // const cart = []
    // const checkout = ref([])
    // const authStore = useStoreAuth()
    return { 
      userSession: {
                        email: '',
                        alias: '',
                        avatar: '',
                        createdAt: '',
                        access_rights: {
                          graphic_novels: []
                        },
                        cart: [],
                        cart_added: '',
                        checkout: [],
                        selectedArray: [],
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
  },
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
          } else {
            console.log('Skipping product as it already exists in mergedCart:', product);
          }
        });

        // this.userSession = userDoc.data()
        // Update the users session with the merged cart
        this.userSession = {
          ...userDoc.data(),
          cart: mergedCart,
        }
        
        console.log('Updated userSession:', this.userSession);

        // Save the merged cart back to the database
        await this.setUserInfo()

        // optionnal, clear the default cart after merging
        // this.userSession.cart = []

        //this.setUserInfo()
        // console.log('userSession : ', this.userSession)
      } else {
        console.log('No such document!')
        this.userSession = this.initDefaultSession()
        this.setUserInfo()
      }
    },

    async setUserInfo() {
      const authStore = useStoreAuth()
      const batch = writeBatch(db)

      const userDocRef = doc(db, 'users', authStore.authInfo.uid)
      // await setDoc(userDocRef, data, { merge: true })
      batch.set(userDocRef, this.userSession, { merge: true });
      

      const userDocRefConsents = doc(db, 'users', authStore.authInfo.uid,
                                               'consents', 'date_consent')
      const dataConsents = { date_infos: '2023-10-01' }
      // await setDoc(userDocRefConsents,data2 , { merge: true })
      batch.set(userDocRefConsents, dataConsents, { merge: true });


      const userDocRefOrders = doc(db, 'users', authStore.authInfo.uid,
        'orders', 'date_order')
      const dataOrders = { date_infos: '2023-10-01' }
      // await setDoc(userDocRefConsents,data2 , { merge: true })
      batch.set(userDocRefOrders, dataOrders, { merge: true });      

      // Commit the batch
      await batch.commit();

      console.log('storeUser :  start  iniiiit created <<<')
    },


    clearSession() {
      this.userSession = initDefaultSession()
    },


    clearCart() {
      this.userSession.cart = []
    },




    /* addToCart(item) {
      this.userSession.cart.push(item);
    },
    removeFromCart(itemIndex) {
      this.userSession.cart.splice(itemIndex, 1);
    },
    clearCart() {
      this.userSession.cart = [];
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