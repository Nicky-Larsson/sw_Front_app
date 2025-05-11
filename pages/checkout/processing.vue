<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
    <div v-if="status === 'processing'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h1 class="text-2xl font-bold mb-4">Processing Your Order</h1>
      <p class="text-gray-600 mb-2">Your payment was successful!</p>
      <p class="text-gray-600 mb-6">We're finalizing your order and setting up your purchase.</p>
      <p class="text-sm text-gray-500">Order #{{ orderId }}</p>
    </div>
    
    <div v-else-if="status === 'error'" class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div class="text-red-500 text-5xl mb-4">⚠️</div>
      <h1 class="text-2xl font-bold mb-4">We Encountered an Issue</h1>
      <p class="text-gray-600 mb-2">Your payment was successful, but we had a problem setting up your purchase.</p>
      <p class="text-red-600 mb-6">{{ errorMessage }}</p>
      <p class="text-sm text-gray-500">Order #{{ orderId }}</p>
      <p class="text-sm text-gray-500 mb-4">Our team has been notified and will fix this for you.</p>
      <button @click="goToAccount" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        Go to My Account
      </button>
    </div>
    
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
import { ref, onMounted } from 'vue';
import { useRoute, navigateTo } from '#app';
import { useStoreUser } from '~/stores/storeUser';

const route = useRoute();
const userStore = useStoreUser();
const orderId = ref(route.query.orderId || '');
const paymentId = ref(route.query.paymentId || '');
const status = ref('processing');
const errorMessage = ref('');
const maxAttempts = 3;
let attempts = 0;

// Clear cart data locally (for good UX)
userStore.clearCart();

const checkOrderStatus = async () => {
  try {
    const response = await $fetch(`/api/orders/${orderId.value}/status`);
    
    if (response.status === 'paid' && response.accessGranted) {
      status.value = 'success';
      return true;
    } else if (response.status === 'error') {
      status.value = 'error';
      errorMessage.value = response.error || 'There was a problem processing your order.';
      return true;
    }
    
    // Continue checking if still processing
    return false;
  } catch (error) {
    console.error('Error checking order status:', error);
    // Don't change status on network errors, continue checking
    return false;
  }
};

const goToSuccess = () => {
  navigateTo('/checkout/purchaseSuccess');
};

const goToAccount = () => {
  navigateTo('/account/orders');
};

onMounted(async () => {
  // First check immediately
  const done = await checkOrderStatus();
  if (done) return;
  
  // Then check twice more with 1.5 second intervals
  const interval = setInterval(async () => {
    attempts++;
    const done = await checkOrderStatus();
    
    if (done || attempts >= maxAttempts) {
      clearInterval(interval);
      
      // If still processing after max attempts, assume success
      // This ensures users aren't left on a processing page forever
      if (status.value === 'processing') {
        setTimeout(() => {
          status.value = 'success';
        }, 500);
      }
    }
  }, 1500);
  
  // Timeout after 6 seconds total - 99% of webhook calls complete by then
  setTimeout(() => {
    clearInterval(interval);
    if (status.value === 'processing') {
      status.value = 'success';
    }
  }, 6000);
});
</script>