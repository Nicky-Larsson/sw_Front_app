import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';

export default defineNuxtPlugin(nuxtApp => {
  let app;
  let db;
  let auth;

  // Get config from runtimeConfig INSIDE the plugin
  const config = useRuntimeConfig();
  const firebaseConfig = config.public.firebase;

  // Basic validation
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase configuration is missing in runtimeConfig.public.firebase");
    // Optionally provide null/undefined or throw an error depending on desired handling
    nuxtApp.provide('firebaseApp', null);
    nuxtApp.provide('firestore', null);
    nuxtApp.provide('firebaseAuth', null);
    return; // Stop execution if config is missing
  }

  // Initialize Firebase only once
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase Client SDK Initialized.");
    } catch (error) {
      console.error("Failed to initialize Firebase Client SDK:", error);
      // Handle initialization error
      nuxtApp.provide('firebaseApp', null);
      nuxtApp.provide('firestore', null);
      nuxtApp.provide('firebaseAuth', null);
      return;
    }
  } else {
    app = getApp(); // Get the already initialized app
  }

  db = getFirestore(app);
  auth = getAuth(app);

  // Inject db and auth into the Nuxt context using provide
  // They will be available as $firestore and $firebaseAuth
  nuxtApp.provide('firebaseApp', app); // Optional: provide the app instance itself
  nuxtApp.provide('firestore', db);
  nuxtApp.provide('firebaseAuth', auth);

  console.log("Firebase services injected via plugin.");
});