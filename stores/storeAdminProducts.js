import { defineStore } from 'pinia';
// Remove the direct import of db
// import { db } from '@/js/firebase';
import {
  collection,
  doc, deleteDoc, updateDoc, addDoc,
  query, orderBy, setDoc, getDoc, writeBatch
} from 'firebase/firestore';
import { useNuxtApp } from '#app'; // Import useNuxtApp

// Keep these if used elsewhere
// let notesCollectionRef;
// let notesCollectionQuery;
// let getNotesSnapshot = null;

export const useStoreAdminProducts = defineStore('storeAdminProducts', {
  state: () => {
    return {
      products: [] // Assuming this holds the structure from promoRiwaya.js
    };
  },
  persist: {
    // Remove explicit storage, rely on global config from nuxt.config.ts
    // storage: piniaPluginPersistedstate.localStorage(),
  },
  actions: {
    async getProducts() {
      // Keep this logic as is, it imports local data
      try {
        this.products = [];
        const data = await import('@/stores/seed/promoRiwaya.js');
        this.products = data.default; // Assuming data.default holds the desired structure
        console.log('Products loaded from seed file:', this.products);
      } catch (error) {
        console.error('Failed to load products from seed file:', error);
      }
    },

    async addProducts() {
      const { $firestore } = useNuxtApp(); // Get injected Firestore instance

      // Check if Firestore is available
      if (!$firestore) {
        console.error("Firestore not available via Nuxt plugin in addProducts.");
        return;
      }


      if (!this.products || !this.products.volumes || !Array.isArray(this.products.volumes)) {
        console.error('Products or volumes are not properly initialized.');
        return;
      }

      // Ensure products are loaded from the seed file first
      if (!this.products || (this.products.volumes && this.products.volumes.length === 0)) {
         await this.getProducts();
         // Check again if loading failed
         if (!this.products || (this.products.volumes && this.products.volumes.length === 0)) {
            console.error("Cannot add products, failed to load seed data.");
            return;
         }
      }


      // Use the injected $firestore instance for the batch
      const batch = writeBatch($firestore);

      const COLLECTION = {
        name: 'graphic_nov2',
        graphicNovel_uid: "sunset_land",
        graphicNovel_name: "Sunset Land"
      };

      // Keep your batch logic, just replace 'db' with '$firestore'
      const graphicNovelInfosDocRef = doc($firestore, COLLECTION.name, COLLECTION.graphicNovel_uid);
      const art3dDocRef = doc($firestore, COLLECTION.name, COLLECTION.graphicNovel_uid, 'arts_3d', 'mina_arc_ghoula_01');
      const artWorksDocRef = doc($firestore, COLLECTION.name, COLLECTION.graphicNovel_uid, 'artworks', 'art_001_vol_01');

      batch.set(graphicNovelInfosDocRef, { logo_banner: 'link', title: 'Sunset Land' }, { merge: true });
      batch.set(art3dDocRef, {}, { merge: true });
      batch.set(artWorksDocRef, {}, { merge: true });

      const globalInfos = {
        graphic_novel: COLLECTION.graphicNovel_name,
        graphic_novel_uid: COLLECTION.graphicNovel_uid,
        price: 299, // Example price, adjust if needed
        currency: '€' // Example currency
      };

      // Safely iterate over volumes using forEach (as you were doing)
      if (this.products.volumes && Array.isArray(this.products.volumes)) {
        this.products.volumes.forEach((volumePromo) => {
          if (!volumePromo || !volumePromo.volume_uid) {
             console.warn('Skipping volume due to missing data:', volumePromo);
             return; // Skip this iteration
          }

          // Product Version Doc Ref using $firestore
          const productVersionDocRef = doc($firestore, COLLECTION.name, COLLECTION.graphicNovel_uid, 'volumes', volumePromo.volume_uid, 'product', `prod_version`);
          batch.set(productVersionDocRef, { free_access: true }, { merge: true }); // Example data

          // Volume Info Doc Ref using $firestore
          const volumeInfosDocRef = doc($firestore, COLLECTION.name, COLLECTION.graphicNovel_uid, 'volumes', volumePromo.volume_uid);
          batch.set(volumeInfosDocRef, globalInfos, { merge: true });

          // Promo Doc Ref using $firestore
          const promoDocRef = doc($firestore, COLLECTION.name, COLLECTION.graphicNovel_uid, 'volumes', volumePromo.volume_uid, 'promo', `${volumePromo.volume_uid}_promo`);
          // Ensure volumePromo is a valid object before setting
          if (typeof volumePromo === 'object' && volumePromo !== null) {
             batch.set(promoDocRef, volumePromo, { merge: true });
          } else {
             console.warn(`Skipping promo for volume ${volumePromo.volume_uid} due to invalid data.`);
          }
        });
      } else {
        console.warn('No volumes array found in loaded products data.');
      }

      try {
        await batch.commit();
        console.log('Batch commit successful');
      } catch (error) {
        console.error('Batch commit failed:', error);
      }
    },

    init() {
      // Keep this as is
      this.getProducts();
      console.log('init: Called in StoreAdminProduct <--------');
    },
  },
  getters: {
    // Keep getters as is
  }
});

// Keep helper functions if needed
/*
function thumbnailsRiwaya() { ... }
function versionRiwaya() { ... }
function promoRiwaya() { ... }
*/