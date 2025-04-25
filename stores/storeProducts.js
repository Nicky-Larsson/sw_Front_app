import { defineStore } from 'pinia';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
// Remove the direct import of db
// import { db } from '@/js/firebase';
import { useNuxtApp } from '#app'; // Import useNuxtApp



export const useStoreProducts = defineStore('storeProducts', {
  state: () => {
    return {
      products: {},
      productsLoaded: false,
      lastUpdated: null
    };
  },
  persist: {
    // Remove explicit storage, rely on global config from nuxt.config.ts
    // storage: piniaPluginPersistedstate.localStorage(),
  },
  actions: {
    async getProducts(forceUpdate = false) {

      // Add an extra safeguard: Check if running on the client here too
      if (import.meta.server) {
        console.warn("getProducts called on server-side. Skipping Firestore fetch.");
        // Optionally set productsLoaded to false or leave as is depending on desired SSR state
        // this.productsLoaded = false;
        return;
      }

      const { $firestore } = useNuxtApp(); // Get injected Firestore instance

      // Check if Firestore is available
      if (!$firestore) {
        console.error("Firestore not available via Nuxt plugin in getProducts.");
        this.productsLoaded = false; // Indicate loading failed
        return;
      }

      const oneHourInMilliseconds = 1 * 60 * 60 * 1000; // every 1h
      const now = Date.now();

      // Check if data is already loaded and fresh (Keep this logic)
      if (!forceUpdate && this.productsLoaded && this.lastUpdated) {
        const timeSinceLastUpdate = now - this.lastUpdated;
        if (timeSinceLastUpdate < oneHourInMilliseconds) {
          console.log('Using cached products data');
          return;
        }
      }

      this.products = {}; // Reset products before fetching
      console.log('getProducts called - Fetching fresh data...');

      try {
        // Query the 'volumes' collection using $firestore
        const volumesSnapshot = await getDocs(collection($firestore, 'graphic_nov2', 'sunset_land', 'volumes'), { source: 'server' });
        console.log('Number of volumes:', volumesSnapshot.docs.length);

        for (const volumeDoc of volumesSnapshot.docs) {
          try {
            console.log('Processing volume:', volumeDoc.id);

            // Query the 'promo' subcollection using $firestore
            const promoDocRef = doc($firestore, 'graphic_nov2', 'sunset_land', 'volumes', volumeDoc.id, 'promo', `${volumeDoc.id}_promo`);
            const promoDoc = await getDoc(promoDocRef);

            if (promoDoc.exists()) {
              const promoData = promoDoc.data();
              console.log('Promo Document Data for', volumeDoc.id, ':', promoData);

              // Keep your data structuring logic exactly as is
              const supportedLanguages = ['fr', 'en', 'ar', 'ma'];
              if (!this.products['sunset_land']) {
                this.products['sunset_land'] = {};
              }
              const volumeUid = promoData.volume_uid || `volume_${volumeDoc.id}`;
              if (!this.products['sunset_land'][volumeUid]) {
                this.products['sunset_land'][volumeUid] = {};
              }
              supportedLanguages.forEach((lang) => {
                if (!this.products['sunset_land'][volumeUid][lang]) {
                  this.products['sunset_land'][volumeUid][lang] = {};
                }
                if (promoData[lang]) {
                  this.products['sunset_land'][volumeUid][lang] = {
                    graphic_novel_uid: promoData.graphic_novel_uid,
                    graphic_novel_title: promoData.graphic_novel,
                    volume_uid: promoData.volume_uid,
                    volume_num: promoData.volume_num,
                    volume_name: promoData[lang].volume,
                    volume_title: promoData[lang].title,
                    description: promoData[lang].description,
                    thumbnail: promoData[lang].thumbnail,
                    cover: promoData[lang].cover,
                    preview: promoData[lang].preview,
                    price: promoData[lang].price,
                    currency: promoData[lang].currency,
                    free_access: promoData[lang].free_access,
                    product_uid: promoData[lang].uid_product,
                  };
                }
              });
            } else {
              console.log('No promo document found for volume:', volumeDoc.id);
            }
          } catch (error) {
            console.error(`Error processing volume ${volumeDoc.id}:`, error);
          }
        }

        // Update the last updated timestamp
        this.lastUpdated = now;
        this.productsLoaded = true;
        console.log('Finished fetching products. Final state:', this.products);

      } catch (error) {
        console.error("Error fetching volumes collection:", error);
        this.productsLoaded = false; // Indicate loading failed
      }
    },

    init() {
      // Call getProducts as before
      if (import.meta.client) {
        this.getProducts();
        console.log('init: Called getProducts in StoreProduct (Client-side) <--------');
      } else {
        console.log('init: Skipping getProducts in StoreProduct (Server-side) <--------');
      }
      // Keep commented out code as is, but note it would also need $firestore if uncommented
      /* const authStore = useStoreAuth()
         const { $firestore } = useNuxtApp();
         if ($firestore && authStore.authInfo.id) {
           notesCollectionRef = collection($firestore, 'users', authStore.authInfo.id, 'notes')
           notesCollectionQuery = query(notesCollectionRef, orderBy('date', 'desc'))
           this.getNotes()
         }
      */
    },

    // Keep other commented out actions/getters as they are
    // They would also need $firestore/$firebaseAuth if uncommented

  },
  getters: {

  }
});