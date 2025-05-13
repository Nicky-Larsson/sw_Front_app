<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-md text-center">
      <h1 class="text-2xl font-bold text-green-600 mb-4">Thank You for Your Purchase!</h1>
      <p class="text-gray-700 mb-6">
        Your order has been successfully placed. You can view your order details in your account.
      </p>
      <p v-if="orderId" class="text-gray-500 mb-4">
        <strong>Order ID:</strong> {{ orderId }}
      </p>
      <button
        @click="navigateTo('/user/orders')"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        View My Orders
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { navigateTo } from '#app';
import { useStoreUser } from '@/stores/storeUser';

let timeoutId;

const userStore = useStoreUser();
let orderId = null;

onMounted(async () => {
  // Load last order directly
  // const lastOrder = await userStore.manageLastOrder('load');

/*   if (!lastOrder || !lastOrder.lastOrderId || !lastOrder.lastOrderTime) {
    console.error('Missing last order details.');
    showErrorNotification({
      title: 'Order Not Found',
      message: 'We could not retrieve your last order. Please try again later.',
      type: 'error',
      duration: 5000,
    });
    navigateTo('/user/orders'); // Redirect to orders page
    return;
  }

  const { lastOrderId } = lastOrder;
  orderId = lastOrderId;
   */

  timeoutId = setTimeout(() => {
    navigateTo('/');
  }, 20000);
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    console.log('Timeout cleared');
  }
});

const showErrorNotification = (options) => {
  console.warn('Order issue detected:', options);
};
</script>