<!-- filepath: /home/vagrant/App_folder/SimoWarch-app-v1/pages/checkout/cmiPaymentPage.vue -->
<template>
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
            <span class="font-semibold">{{ orderId }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Amount:</span>
            <span class="font-semibold">{{ amount }} MAD</span>
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
          <button @click="simulateSuccess" class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
            Simulate Successful Payment
          </button>
          <button @click="simulateFailure" class="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors">
            Simulate Failed Payment
          </button>
          <button @click="goBack" class="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors">
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, navigateTo } from '#imports';

const route = useRoute();
const orderId = ref('');
const amount = ref(0);
const originUrl = ref('');

const currentDate = computed(() => {
  return new Date().toLocaleDateString();
});

onMounted(() => {
  const { oid, amount: amountParam, okUrl, failUrl } = route.query;
  orderId.value = oid || 'TEST-ORDER';
  amount.value = amountParam || '100.00';
  originUrl.value = (okUrl && okUrl !== 'undefined' && okUrl !== undefined) ? okUrl : '/checkout/purchaseSuccess';
  if (failUrl && failUrl !== 'undefined' && failUrl !== undefined) {
    localStorage.setItem('cmi_fail_url', failUrl);
  } else {
    localStorage.removeItem('cmi_fail_url');
  }
});

// --- Add these methods ---
const postToCallback = async (success = true) => {
  const payload = {
    oid: orderId.value,
    ProcReturnCode: success ? '00' : '99',
    Response: success ? 'Approved' : 'Declined',
    TransId: success ? 'TEST-TRANS-ID' : undefined
  };
  await fetch('/api/payments/cmi/cmi-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};

const simulateSuccess = async () => {
  await postToCallback(true);
  setTimeout(() => {
    const url = (originUrl.value && originUrl.value !== 'undefined' && originUrl.value !== undefined)
      ? originUrl.value
      : '/checkout/purchaseSuccess';
    navigateTo(url);
  }, 1500);
};

const simulateFailure = async () => {
  await postToCallback(false);
  setTimeout(() => {
    const failUrl = localStorage.getItem('cmi_fail_url');
    navigateTo((failUrl && failUrl !== 'undefined' && failUrl !== undefined) ? failUrl : '/checkout/checkout');
  }, 1500);
};

const goBack = async () => {
  await postToCallback(false);
  navigateTo('/checkout/checkout');
};
</script>