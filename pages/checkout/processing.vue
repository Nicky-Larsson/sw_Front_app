<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
    <!-- Processing State -->
    <div v-if="status === 'processing'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h1 class="text-2xl font-bold mb-4">Processing Your Order</h1>
      <p class="text-gray-600 mb-2">Your payment was successful!</p>
      <p class="text-gray-600 mb-6">We're finalizing your order and setting up your purchase.</p>
      <p class="text-sm text-gray-500">Order #{{ orderId }}</p>
    </div>

    <!-- Delayed State -->
    <div v-else-if="status === 'delayed'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="text-yellow-500 text-5xl mb-4">⏳</div>
      <h1 class="text-2xl font-bold mb-4">Still Confirming Your Order</h1>
      <p class="text-gray-600 mb-4">
        We're taking a little longer than usual to confirm all the details for Order #{{ orderId }}.
      </p>
      <p class="text-gray-600 mb-6">
        Please wait a moment, or you can try refreshing the status.
      </p>
      <div class="space-y-3 sm:space-y-0 sm:space-x-3">
        <button @click="manualCheckOrderStatus" class="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          Refresh Status
        </button>
        <button @click="goToAccount" class="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
          View My Orders
        </button>
      </div>
       <p class="text-xs text-gray-500 mt-6">If this issue persists, please contact support.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="status === 'error'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="text-red-500 text-5xl mb-4">⚠️</div>
      <h1 class="text-2xl font-bold mb-4">We Encountered an Issue</h1>
      <p class="text-red-600 mb-6">{{ errorMessage }}</p>
      <button @click="goToAccount" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        View My Orders
      </button>
    </div>
    
    <!-- Success State -->
    <div v-else-if="status === 'success'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="text-green-500 text-5xl mb-4">✓</div>
      <h1 class="text-2xl font-bold mb-4">Order Completed!</h1>
      <p class="text-gray-600 mb-6">Your order has been successfully processed.</p>
      <button @click="goToSuccess" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, navigateTo } from '#app';
import { useStoreUser } from '@/stores/storeUser';

const route = useRoute();
const userStore = useStoreUser();
const authStore = useStoreAuth();

const orderId = ref(route.query.orderId || '');
const paymentId = ref(route.query.paymentId || '');
const status = ref('processing');
const errorMessage = ref('');
const timeElapsed = ref(0);
const maxWaitTime = 8000; // 8 seconds max wait time
let checkInterval;
let progressTimer;
let attempts = 0;
const maxAttempts = 4;

let cartBackup = [];

// Smart timeout system that balances UX vs reliability
// const userId = userStore.userId; // Retrieve userId from the store

const userId = authStore.authInfo?.uid || userStore.userSession.userId;

const checkOrderStatus = async () => {
  try {
    const response = await $fetch(`/api/orders/${orderId.value}/status`, {
      params: { userId, orderId: orderId.value } // Pass both userId and orderId
    });

    console.log('\n ------\nOrder status from API:', response.status, ', API Access granted:', response.accessGranted, ', API Access Level:', response.accessLevel);

    if (response.status === 'paid' && response.accessGranted) {
      clearAllTimers();
      status.value = 'success';
      userStore.clearCart();
      const purchasedItems = response.orderItems || cartBackup;
      if (purchasedItems && purchasedItems.length > 0) {
        await userStore.refreshPurchasedNovelAccess(purchasedItems);
        console.log('Access rights refreshed for purchased items');
      }
      return true; // Definitive success
    }

    if (response.status === 'error') {
      clearAllTimers();
      status.value = 'error';
      errorMessage.value = response.error || 'There was a problem processing your order.';
      return true; // Definitive error
    }

    // If 'paid' but access is 'provisional', treat as still processing but close to finishing
    // This might mean the webhook ran but your API is still doing final steps.
    // We can let polling continue a bit longer or handle it specially.
    // For now, if it's provisional, we'll let the polling continue.
    if (response.status === 'paid' && response.accessLevel === 'provisional') {
      console.log('Order is paid but access is provisional. Continuing to poll.');
      // Don't increment attempts here if you want to give provisional more time
      // Or, you could fast-track to fewer remaining attempts:
      // if (attempts < maxPollingAttempts -1) attempts = maxPollingAttempts - 2;
    }
    
    // For any other non-definitive status (e.g., 'pending', 'processing_at_stripe')
    return false; // Not yet definitively resolved
  } catch (error) {
    console.error('Error in checkOrderStatus:', error);
    // If the API call itself fails, treat as not resolved, let polling continue or hit max attempts
    return false; 
  }
};

const manualCheckOrderStatus = async () => {
  status.value = 'processing'; // Show spinner again
  attempts = 0; // Reset attempts for this manual check cycle if desired, or manage separately
  const done = await checkOrderStatus();
  if (!done && status.value === 'processing') { // If still not resolved after manual check
    status.value = 'delayed'; // Go back to delayed state
  }
};

const clearAllTimers = () => {
  clearInterval(checkInterval);
  // clearInterval(progressTimer); // You might not need progressTimer anymore if not displaying elapsed time
};

const goToSuccess = () => {
  clearAllTimers();
  navigateTo('/checkout/purchaseSuccess'); // Or to the content they bought
};

const goToAccount = () => {
  clearAllTimers();
  navigateTo('/user/orders');
};

onMounted(async () => {
  // Clear cart immediately for good UX - will restore if error
  const paymentType = route.query.paymentType || 'stripe'; // Or however you track payment type

  if (paymentType !== 'stripe') {
    console.warn('Non-Stripe payment detected, clearing cart immediately');
    userStore.clearCart();
  }
  
  cartBackup = JSON.parse(JSON.stringify(userStore.userSession.checkout || []));
  
  
  // Start progress timer
  progressTimer = setInterval(() => {
    timeElapsed.value += 100;
  }, 100);
  
  // First check immediately
  let done = await checkOrderStatus();
  if (done) return;
  
  // Then check periodically
  const checkDelays = [1500, 2500, 4000]; // Example: 1.5s, then 2.5s, then 4s
  attempts = 0; // Reset attempts count for polling

  checkInterval = setInterval(async () => {
    attempts++;
    if (attempts > maxAttempts) {
      clearAllTimers();
      // After max polling attempts, do one final check
      let finalDone = await checkOrderStatus();
      if (!finalDone && status.value === 'processing') {
        status.value = 'delayed'; // Move to delayed state
      }
      return;
    }
    
    let polledDone = await checkOrderStatus();
    if (polledDone) {
      clearAllTimers();
      return;
    }
    // If not done, the interval will run again with the next delay if you vary it,
    // or just use a fixed delay. For simplicity, using a fixed delay after the first few.
  }, checkDelays[attempts -1] || 5000); // Use defined delays, then a fallback
  
  // Absolute timeout to switch to 'delayed' state if polling doesn't resolve
  setTimeout(() => {
    if (status.value === 'processing') { // If still in initial processing after maxPollingWaitTime
      clearAllTimers();
      status.value = 'delayed';
    }
  }, maxWaitTime);
});

onBeforeUnmount(() => {
  clearAllTimers();
});
</script>