import { defineStore } from 'pinia'
import {db} from '@/js/firebase.js'
import { ref } from 'vue'
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
    email: storeAuth.authInfo.id,
    cart: [],
    cart_date: '',
  */
  
  state: () => {
    // const cart = []
    // const checkout = ref([])
    // const storeAuth = useStoreAuth()
    return { 
      userSession: initDefaultSession()
    } 
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage()  
  },
  actions: {
    async init() {
      const storeAuth = useStoreAuth()
      // console.log(storeAuth.authInfo.id)
      // userCollectionRef = collection(doc(db, 'user', storeAuth.authInfo.id), 'cart')
      // userCollectionRef = doc(db, 'user', storeAuth.authInfo.id)
      // const cartRef = collection(userCollectionRef, 'cart')
      // await addDoc(cartRef, { book: 'book1', date: '2023-10-01' })
      // const userDocRef = doc(db, 'user', storeAuth.authInfo.id, 'cart', 'pina')
    },
    async getUserInfo() {
      const storeAuth = useStoreAuth()
      const userDocRef = doc(db, 'user', storeAuth.authInfo.id)
      console.log('userDocRef : ', userDocRef)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        this.userSession = userDoc.data()
        this.setUserInfo()
        console.log('userSession : ', this.userSession)
      } else {
        console.log('No such document!')
        this.userSession = this.initDefaultSession();
        this.setUserInfo();
      }
    },

    async setUserInfo() {
      const storeAuth = useStoreAuth()
      const batch = writeBatch(db)

      const userDocRef = doc(db, 'user', storeAuth.authInfo.id)
      // await setDoc(userDocRef, data, { merge: true })
      batch.set(userDocRef, this.userSession, { merge: true });
      

      const userDocRefConsents = doc(db, 'user', storeAuth.authInfo.id,
                                               'consents', 'date_consent')
      const data2 = { date_infos: '2023-10-01' }
      // await setDoc(userDocRefConsents,data2 , { merge: true })
      batch.set(userDocRefConsents, data2, { merge: true });


      const userDocRefOrders = doc(db, 'user', storeAuth.authInfo.id,
        'orders', 'date_order')
      const data3 = { date_infos: '2023-10-01' }
      // await setDoc(userDocRefConsents,data2 , { merge: true })
      batch.set(userDocRefOrders, data3, { merge: true });      

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
    access_rights: {
      graphic_novels: []
    },
    alias: '',
    cart: [], // Initialize cart as an empty array
    avatar: '',
    cart_added: '',
    email: '',
    favorite_arts: [],
    favorite_products: [],
    last_login: '',
    last_order: '',
    unsubscribe_demands: [],
    unsubscribe_status: 'inactive',
    defaultLanguage: 'en',
    choosedLanguage:  'fr'
  }
}

function testUserSession() {
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
      email: storeAuth.authInfo.email,
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

}