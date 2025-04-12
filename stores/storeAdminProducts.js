import { defineStore } from 'pinia'
import { db } from '@/js/firebase'
import { 
  collection,
  doc, deleteDoc, updateDoc, addDoc, 
  query, orderBy, setDoc, getDoc, writeBatch 
} from 'firebase/firestore'
// import { useStoreAuth } from '@/stores/storeAuth'

let notesCollectionRef
let notesCollectionQuery

let getNotesSnapshot = null

export const useStoreAdminProducts = defineStore('storeAdminProducts', {
  state: () => {
    return { 
      products: []
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  }, 
  actions: {
    async getProducts() {
      try {
        this.products = []
        const data = await import('~/stores/seed/promoRiwaya.js')
        this.products = data.default
        console.log('Products loaded:', this.products)
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    },
    async addProducts() {
      
      await this.getProducts()

      const batch = writeBatch(db)

      const COLLECTION = { 
        name: 'graphic_nov2', 
        graphicNovel_uid:"sunset_land",
        graphicNovel_name:"Sunset Land" }



      /*   volume: "volume_01",
           price: 299,
           currency: "€",
           access: { ar: false, fr: false, en: false, ma: false }
      } */

      const productData = {
        ar: { cover: 'link_cover', number: 'المجلد الأول', title: 'بداية المغامرات' },
        fr: { cover: 'link_cover', number: 'volume 1', title: 'début aventure' },
        en: { cover: 'cover link', number: 'Volume 1', title: 'adventure begin' },
        ma: { cover: 'ghilaf', number: 'Volume 1', title: 'بداية المغامرات' }
      }

      const graphicNovelInfosDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid,)

      // Add 3D Art and Artwork references
      const art3dDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid, 'arts_3d', 'mina_arc_ghoula_01')
      const artWorksDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid, 'artworks', 'art_001_vol_01')

      batch.set(graphicNovelInfosDocRef, { logo_banner: 'link', title: 'Sunset Land' }, { merge: true })
      batch.set(art3dDocRef, {}, { merge: true })
      batch.set(artWorksDocRef, {}, { merge: true })

      // VOLUMES
      // Add Volume Info
      // const volumeInfoDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid,, 'volumes', graphicNovel.volume)
      // batch.set(volumeInfoDocRef, { currency: graphicNovel.currency, price: graphicNovel.price }, { merge: true })

      // Language-specific data


      // Product Version
      const globalInfos = {
        graphic_novel: COLLECTION.graphicNovel_name,
        graphic_novel_uid: COLLECTION.graphicNovel_uid,
        price: 299,
        currency: '€'
      } 

      // Safely iterate over volumes using for...of
      if (this.products.volumes && Array.isArray(this.products.volumes)) {
        this.products.volumes.forEach((volumePromo) => {
            // product  
            const productVersionDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid, 'volumes', volumePromo.volume_uid, 'product', `prod_version`)
            batch.set(productVersionDocRef, { free_access: true }, { merge: true })     
       
            // Object.entries(productData).forEach((product) => {
            // })

            //volumes
            const volumeInfosDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid, 'volumes', volumePromo.volume_uid)
            batch.set(volumeInfosDocRef, globalInfos , { merge: true })

            console.log(volumePromo)
            // Promo
            // Object.entries(volumePromo).forEach(([data]) => {
            
            const promoDocRef = doc(db, COLLECTION.name, COLLECTION.graphicNovel_uid, 'volumes', volumePromo.volume_uid, 'promo', `${volumePromo.volume_uid}_promo`)
            batch.set(promoDocRef, volumePromo, { merge: true })
            
            //})
        })

      } else {
        console.warn('No volumes found in products.')
      }





      try {
        await batch.commit();
        console.log('Batch commit successful')
      } catch (error) {
        console.error('Batch commit failed:', error)
      }
    },

    init() {
      this.getProducts()
      console.log('init: Called in StoreProduct  <--------')
    },


  },
  getters: {

  }
})





function thumbnailsRiwaya() {
  return {
  }
}

function versionRiwaya() {
  return {
  }
}

function promoRiwaya() {
  return {
  }
}
