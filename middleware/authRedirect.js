import { useStoreUser } from '@/stores/storeUser';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // const userStore = useStoreUser(); // Access the user store
  const authStore = useStoreAuth()

  console.log('Middleware activated');

  // Redirect if the user is logged in
  if (authStore.authInfo?.email) {
    console.log('User is logged in, redirecting...');
    return navigateTo('/Fanoorassm/3d-library'); // Redirect to the main page
  }

  console.log('User is not logged in, allowing access to the page.');
});