import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import 'dotenv/config';

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Environment Variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePromoDocuments() {
  const volumesRef = collection(db, 'graphic_nov2', 'sunset_land', 'volumes');
  const volumesSnapshot = await getDocs(volumesRef);

  if (volumesSnapshot.empty) {
    console.log('No volumes found to migrate.');
    return;
  }

  console.log(`Found ${volumesSnapshot.size} volumes to process.`);

  for (const volumeDoc of volumesSnapshot.docs) {
    const volumeId = volumeDoc.id;
    console.log(`Processing volume: ${volumeId}`);

    // Reference to the promo document in the subcollection
    const promoDocRef = doc(db, 'graphic_nov2', 'sunset_land', 'volumes', volumeId, 'promo', `${volumeId}_promo`);
    const promoDoc = await getDoc(promoDocRef);

    if (!promoDoc.exists()) {
      console.log(`No promo document found for volume: ${volumeId}`);
      continue;
    }

    const promoData = promoDoc.data();
    console.log(`Existing promo data for ${volumeId}:`, promoData);

    // Process each language
    const supportedLanguages = ['fr', 'en', 'ar', 'ma'];
    const updates = {};

    supportedLanguages.forEach((lang) => {
      if (promoData[lang]) {
        console.log(`Processing language: ${lang}`);

        // Map language codes to full names
        const languageMap = {
          fr: 'French',
          en: 'English',
          ar: 'Arabic',
          ma: 'Darija',
        };

        // Generate `product_uid` by concatenating the fields
        const productUid = `${promoData.graphic_novel_uid}__${promoData.volume_uid}__${lang}`;

        // Generate the Firebase path to the product document
        const firebasePath = `graphic_nov2/${promoData.graphic_novel_uid}/volumes/${promoData.volume_uid}/product/${lang}_version`;


        // Add the generated `product_uid` and Firebase path to the updates
        updates[`${lang}.product_uid`] = {
          product_uid: productUid,
          firebasePath: firebasePath,
          graphic_novel_uid: promoData.graphic_novel_uid,
          volume_uid: promoData.volume_uid,
          lang: lang,
        };

        // Add `lang_version` (parent key name)
        updates[`${lang}.lang_version`] = lang;

        // Add `langage` (mapped language name)
        updates[`${lang}.langage`] = languageMap[lang] || 'Unknown';

        // Remove the old `uid_product` field
        updates[`${lang}.uid_product`] = deleteField(); // Completely delete the field
      }
    });

    console.log(`Updates for promo document ${volumeId}_promo:`, updates);

    // Apply updates to Firestore
    try {
      await updateDoc(promoDocRef, updates);
      console.log(`Successfully updated promo document: ${volumeId}_promo`);
    } catch (error) {
      console.error(`Failed to update promo document ${volumeId}_promo:`, error);
    }
  }

  console.log('Migration completed.');
}

// Run the migration
migratePromoDocuments().catch((error) => {
  console.error('Migration failed:', error);
});