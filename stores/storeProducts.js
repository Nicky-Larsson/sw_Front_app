import { defineStore } from 'pinia'
import { collection, doc, getDoc,  getDocs } from 'firebase/firestore';
import { db } from '@/js/firebase'

// import { useStoreAuth } from '@/stores/storeAuth'

let notesCollectionRef
let notesCollectionQuery

let getNotesSnapshot = null

export const useStoreProducts = defineStore('storeProducts', {
  state: () => {
    return { 
      products: {},
      productsLoaded: false
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  }, 
  actions: {
    // graphic_nov/sunset_land/artworks
    // graphic_nov/sunset_land/art_3D
    // graphic_nov/sunset_land/volumes/volume_01/product/ar_version
    // graphic_nov/sunset_land/volumes/volume_01/promo/volume_01_promo

    async getProducts() {
      this.products={}
      console.log('getProducts called');
      // if (this.products.length > 0) return;

      // Query the 'volumes' collection
      const volumesSnapshot = await getDocs(collection(db, 'graphic_nov2', 'sunset_land', 'volumes'), { source: 'server' } )
      volumesSnapshot.docs.forEach((doc) => {
        console.log('Document ID:', doc.id)
      })
      console.log('Volumes Snapshot:', volumesSnapshot.docs)
      // console.log('Volume title:', volumesSnapshot.graphic_novel)
      //console.log('Volume title:', volumesSnapshot.graphic_novel_uid)
      //console.log('Volume title:', volumesSnapshot.currency)
      //console.log('Volume title:', volumesSnapshot.price)
      console.log('Number of volumes:', volumesSnapshot.docs.length)
      
      for (const volumeDoc of volumesSnapshot.docs) {
        try { 
          // Extract volume data
          console.log('Processing volume:', volumeDoc.id)

          // Query the 'promo' subcollection for the current volume
          const promoDocRef = doc(db, 'graphic_nov2', 'sunset_land', 'volumes', volumeDoc.id, 'promo', `${volumeDoc.id}_promo`)

          console.log('Promo Document Path:', promoDocRef.path)

          const promoDoc = await getDoc(promoDocRef)
          if (promoDoc.exists()) {
            const promoData = promoDoc.data() // Extract the plain data
            console.log('Promo Document Data:', promoData); // Pretty-print the data          

            console.log('Updated Products Array:', this.products)

            // this.products['sunset_land'][promoDoc.data().volume_uid]

            // this.products.push(promoDoc.data().fr);
            /* this.products = { 
              sunset_land  : {
                volume_01: {
                  fr : {},
                  en : {},
                  ar : {},
                  ma : {},
                }
              }
            } */
              const supportedLanguages = ['fr', 'en', 'ar', 'ma']; // Define supported languages dynamically

              if (!this.products['sunset_land']) {
                this.products['sunset_land'] = {}; // Initialize 'sunset_land' if it doesn't exist
              }
              
              const volumeUid = promoDoc.data().volume_uid || `volume_${volumeDoc.id}`; // Fallback if volume_uid is undefined
              
              if (!this.products['sunset_land'][volumeUid]) {
                this.products['sunset_land'][volumeUid] = {}; // Initialize the volume object if it doesn't exist
              }
              
              // Iterate over supported languages to initialize and populate data dynamically
              supportedLanguages.forEach((lang) => {
                if (!this.products['sunset_land'][volumeUid][lang]) {
                  this.products['sunset_land'][volumeUid][lang] = {}; // Initialize language object if it doesn't exist
                }
              
                // Populate data for the current language if it exists in promoDoc
                if (promoDoc.data()[lang]) {
                  this.products['sunset_land'][volumeUid][lang] = {
                    graphic_novel_uid: promoDoc.data().graphic_novel_uid, // sunset_land
                    graphic_novel_title: promoDoc.data().graphic_novel,    // Sunset Land
                    volume_uid: promoDoc.data().volume_uid,               // volume_08
                    volume_num: promoDoc.data().volume_num,               // 8
                    volume_name: promoDoc.data()[lang].volume,            // Language-specific volume name
                    volume_title: promoDoc.data()[lang].title,            // Language-specific title
                    description: promoDoc.data()[lang].description,       // Language-specific description
                    thumbnail: promoDoc.data()[lang].thumbnail,           // Language-specific thumbnail
                    cover: promoDoc.data()[lang].cover,                   // Language-specific cover
                    preview: promoDoc.data()[lang].preview,               // Language-specific preview
                    price: promoDoc.data()[lang].price,                   // Language-specific price
                    currency: promoDoc.data()[lang].currency,             // Language-specific currency
                    free_access: promoDoc.data()[lang].free_access,       // Language-specific free access
                    uid_product: promoDoc.data()[lang].uid_product,       // Language-specific product UID
                  };
                }
              });
            // this.products.push()

          } else {
            console.log('No promo document found for volume:', volumeDoc.id)
          } 

          
         } catch (error) {
          console.error(`Error processing volume ${volumeDoc.id}:`, error)
        } 
       }

       console.log('this.products: ', this.products)

    },

    init() {
      this.getProducts()
      console.log('init: Called in StoreProduct  <--------')
      

      /* const storeAuth = useStoreAuth()
      notesCollectionRef = collection(db, 'users', storeAuth.authInfo.id, 'notes')
      notesCollectionQuery = query(notesCollectionRef, orderBy('date', 'desc'))
      this.getNotes() */
    },

    /* 
    async getNotes() {
      this.notesLoaded = false

      if (getNotesSnapshot) getNotesSnapshot() // unsubscribe from any active listener

      getNotesSnapshot = onSnapshot(notesCollectionQuery, (querySnapshot) => {
        let notes = []
        querySnapshot.forEach((doc) => {
          let note = {
            id: doc.id,
            content: doc.data().content,
            date: doc.data().date
          }
          notes.push(note)
        })
        this.notes = notes
        this.notesLoaded = true
      }, error => {
        console.log('error.message: ', error.message)
      })
    },
    clearNotes() {
      this.notes = []
    },
    async addNote(newNoteContent) {
      let currentDate = new Date().getTime(),
          date = currentDate.toString()

      await addDoc(notesCollectionRef, {
        content: newNoteContent,
        date
      })
    },
    async deleteNote(idToDelete) {
      await deleteDoc(doc(notesCollectionRef, idToDelete))
    },
    async updateNote(id, content) {
      await updateDoc(doc(notesCollectionRef, id), {
        content
      })
    } */
  },
  getters: {
/*     getNoteContent: (state) => {
      return (id) => {
        return state.notes.filter(note => note.id === id )[0].content
      }
    },
    totalNotesCount: (state) => {
      return state.notes.length
    },
    totalCharactersCount: (state) => {
      let count = 0
      state.notes.forEach(note => {
        count += note.content.length
      })
      return count
    } */
  }
})



          // Assuming there's only one promo document per volume
          /* let productDoc = {
            id: promoDoc.data().id,
            title: promoDoc.data().title,
            cover: promoDoc.data().cover,
            preview: promoDoc.data().preview,
            description: promoDoc.data().description,
            price: promoDoc.data().price,
            name: promoDoc.data().name,
            volume_num: promoDoc.data().volume_num,
            thumbnail: promoDoc.data().thumbnail,
            promo: null // Placeholder for promo data
          }; */

          // Add the product with promo data to the products array