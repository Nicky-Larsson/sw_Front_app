import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { useRuntimeConfig } from '#imports';

export function getFirebaseDb() {
  const config = useRuntimeConfig();
  const serviceAccountJson = config.firebaseServiceAccountKey;
  
  try {
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined in runtimeConfig.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Only initialize if not already initialized
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin SDK Initialized.");
    }
    
    return getFirestore();
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
    throw new Error("Firebase initialization failed: " + e.message);
  }
}