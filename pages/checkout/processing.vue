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
    
    <!-- Error State -->
    <div v-else-if="status === 'error'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="text-red-500 text-5xl mb-4">⚠️</div>
      <h1 class="text-2xl font-bold mb-4">We Encountered an Issue</h1>
      <p class="text-red-600 mb-6">{{ errorMessage }}</p>
      <button @click="goToSuccess" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        Continue
      </button>
    </div>
    
    <!-- Success State -->
    <div v-else class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
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

// Smart timeout system that balances UX vs reliability
// const userId = userStore.userId; // Retrieve userId from the store

const userId = authStore.authInfo?.uid || userStore.userSession.userId;

const checkOrderStatus = async () => {
  try {
    const response = await $fetch(`/api/orders/${orderId.value}/status`, {
      params: { userId, orderId: orderId.value } // Pass both userId and orderId
    });

    if (response.status === 'paid' && response.accessGranted) {
      clearAllTimers();
      status.value = 'success';
      userStore.clearCart();

      // Get the items that were just purchased
      const purchasedItems = response.orderItems || cartBackup;
      
      // Only refresh access for the novels that were purchased
      await userStore.refreshPurchasedNovelAccess(purchasedItems);
      console.log('Access rights refreshed for purchased items');
      
      return true;
    }

    if (response.status === 'error') {
      clearAllTimers();
      status.value = 'error';
      errorMessage.value = response.error || 'There was a problem processing your order.';
      return true;
    }

    if (response.status === 'paid' && response.accessLevel === 'provisional') {
      attempts = maxAttempts - 1;
    }

    attempts++;
    return false;
  } catch (error) {
    console.error('Error checking order status:', error);
    return false;
  }
};

const clearAllTimers = () => {
  clearInterval(checkInterval);
  clearInterval(progressTimer);
};

const goToSuccess = () => {
  clearAllTimers();
  navigateTo('/checkout/purchaseSuccess');
};

const goToAccount = () => {
  clearAllTimers();
  navigateTo('/user/orders');
};


onMounted(async () => {
  // Clear cart immediately for good UX - will restore if error
  const cartBackup = JSON.parse(JSON.stringify(userStore.userSession.checkout || []));
  userStore.clearCart();
  
  // Start progress timer
  progressTimer = setInterval(() => {
    timeElapsed.value += 100;
  }, 100);
  
  // First check immediately
  const done = await checkOrderStatus();
  if (done) return;
  
  // Then check periodically with increasing intervals
  const checkDelay = [1000, 2000, 2000, 3000]; // 1s, 3s, 5s, 8s total
  
  checkInterval = setInterval(async () => {
    if (attempts >= maxAttempts) {
      clearAllTimers();
      
      // Final check if we're at max attempts
      const finalCheck = await checkOrderStatus();

      console.log('finalCheck <--- : ' + maxAttempts )
      
      // If no definitive status after all attempts, assume success for UX
      if (!finalCheck && status.value === 'processing') {
        status.value = 'success';
      }
      return;
    }
    
    const done = await checkOrderStatus();
    if (done) return;
    


  }, checkDelay[attempts] || 2000);
  
  // Set absolute max timeout regardless of checks
  setTimeout(() => {
    if (status.value === 'processing') {
      clearAllTimers();
      status.value = 'success';
    }
  }, maxWaitTime);
});

onBeforeUnmount(() => {
  clearAllTimers();
});
</script>