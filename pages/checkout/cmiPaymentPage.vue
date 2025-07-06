<template>
 <client-only>  
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Header with CMI logo -->
      <div class="bg-blue-600 px-6 py-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">CMI Payment</h2>
          <div class="bg-white rounded px-2 py-1">
            <span class="text-blue-600 font-semibold">Test Mode</span>
          </div>
        </div>
      </div>
      <!-- Payment details -->
      <div class="p-6">
        <div class="mb-6 text-center">
          <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Secure Payment</h3>
          <p class="text-gray-500">Centre Monétique Interbancaire</p>
        </div>
        <!-- Order Information -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Order ID:</span>
            <span class="font-semibold">{{ orderId || 'Pending' }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Amount:</span>
            <span class="font-semibold">{{ amountMAD }} MAD</span>
            <span class="font-semibold">{{ amountEuros }} Euros</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Date:</span>
            <span>{{ currentDate }}</span>
          </div>
        </div>
        <!-- Card Input Fields (just for show) -->
        <div class="mb-6">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Card Number</label>
            <input type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="**** **** **** ****" />
          </div>
          <div class="flex gap-4 mb-4">
            <div class="w-1/2">
              <label class="block text-gray-700 text-sm font-bold mb-2">Expiry Date</label>
              <input type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="MM/YY" />
            </div>
            <div class="w-1/2">
              <label class="block text-gray-700 text-sm font-bold mb-2">CVC</label>
              <input type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="***" />
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="space-y-3">
          <button @click="simulateSuccess" class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Simulate Successful Payment' }}
          </button>
          <button @click="simulateFailure" class="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Simulate Failed Payment' }}
          </button>
          <button @click="goBack" class="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors">
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  </div>
 </client-only> 
</template>

<script setup>
import { ref, onMounted, computed, toRaw } from 'vue';
import { useRoute, navigateTo } from '#imports';
import { useStoreUser } from '@/stores/storeUser';
import { useStoreAuth } from '@/stores/storeAuth';

const route = useRoute();
const orderId = ref('');
const amountCents = ref(parseInt(route.query.amount) || 0);
const amountEuros = ref((amountCents.value / 100).toFixed(2));
const amountMAD = ref((amountCents.value / 100 * 11).toFixed(2)); // Example conversion
const isProcessing = ref(false);
const userStore = useStoreUser();
const authStore = useStoreAuth();
const successUrl = ref('/checkout/processing'); // Default success URL
const failUrl = ref('/checkout/checkout'); // Default fail URL

const currentDate = computed(() => {
  return new Date().toLocaleDateString();
});

onMounted(() => {
  const { oid, amountEuros: euros, amountMAD: mad, okUrl, failUrl: fail } = route.query;
  orderId.value = oid || '';
  amountEuros.value = euros || amountEuros.value;
  amountMAD.value = mad || amountMAD.value;
  
  // Set success URL if provided
  if (okUrl && okUrl !== 'undefined') {
    successUrl.value = okUrl;
  }
  
  // Set fail URL if provided
  if (fail && fail !== 'undefined') {
    failUrl.value = fail;
    localStorage.setItem('cmi_fail_url', fail);
  } else {
    localStorage.setItem('cmi_fail_url', failUrl.value);
  }
});

// Create or get an order then simulate successful payment
const simulateSuccess = async () => {
  isProcessing.value = true;
  try {
    // Only create order if we don't have one yet
    if (!orderId.value) {
      // 1. Create the order first
      const response = await $fetch('/api/payments/cmi/cmi-intent', {
        method: 'POST',
        body: {
          userId: route.query.userId || authStore.authInfo?.uid,
          email: route.query.email,
          alias: route.query.alias,
          amount: amountCents.value,
          checkoutItems: toRaw(userStore.userSession.checkout || []),
          paymentSource: 'cmi'
        }
      });

      if (!response.success && !response.orderId) {
        throw new Error('Failed to create order');
      }

      // 2. Save orderId
      orderId.value = response.orderId;
    }

    // 3. Simulate payment success (call your callback endpoint)
    await postToCallback(true);
    
    // 4. Redirect to processing page
    setTimeout(() => {
      navigateTo(`${successUrl.value}?orderId=${orderId.value}&source=cmi`);
    }, 1500);
  } catch (error) {
    console.error('Payment failed:', error);
    alert('Payment failed: ' + (error.message || 'Unknown error'));
  } finally {
    isProcessing.value = false;
  }
};

// Helper function to post to your callback endpoint
const postToCallback = async (success = true) => {
  if (!orderId.value) return; // Skip if no order ID
  
  const payload = {
    oid: orderId.value,
    userId: route.query.userId || authStore.authInfo?.uid,
    ProcReturnCode: success ? '00' : '99',
    Response: success ? 'Approved' : 'Declined',
    TransId: success ? 'TEST-TRANS-ID' : undefined
  };
  
  try {
    return await $fetch('/api/payments/cmi/cmi-callback', {
      method: 'POST', 
      body: payload
    });
  } catch (e) {
    console.error('Callback error:', e);
  }
};

// Simulate payment failure, creating order first if needed
const simulateFailure = async () => {
  isProcessing.value = true;
  try {
    // Only create order if we don't have one yet
    if (!orderId.value) {
      // 1. Create the order first
      const response = await $fetch('/api/payments/cmi/cmi-intent', {
        method: 'POST',
        body: {
          userId: route.query.userId || authStore.authInfo?.uid,
          email: route.query.email,
          alias: route.query.alias,
          amount: amountCents.value,
          checkoutItems: toRaw(userStore.userSession.checkout || []),
          paymentSource: 'cmi'
        }
      });

      if (!response.success && !response.orderId) {
        throw new Error('Failed to create order');
      }

      // 2. Save orderId
      orderId.value = response.orderId;
    }

    // Call callback with failure
    await postToCallback(false);
    
    setTimeout(() => {
      const savedFailUrl = localStorage.getItem('cmi_fail_url');
      navigateTo(savedFailUrl || failUrl.value);
    }, 1500);
  } catch (error) {
    console.error('Process failed:', error);
    alert('Payment process failed: ' + (error.message || 'Unknown error'));
    navigateTo(failUrl.value);
  } finally {
    isProcessing.value = false;
  }
};

const goBack = async () => {
  if (orderId.value) {
    try {
      // Only call callback if we have an order
      await postToCallback(false);
    } catch (e) {
      console.error('Error calling callback:', e);
    }
  }
  navigateTo('/checkout/checkout');
};
</script>