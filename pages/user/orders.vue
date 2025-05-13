<template>
  <div class="min-h-screen p-6 bg-gray-100">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6">Your Orders</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div v-if="errorMessage" class="text-center text-red-500">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Orders List -->
      <div v-if="!loading && orders.length > 0">
        <div v-for="order in orders" :key="order.id" class="border-b py-4">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-bold text-xl">Order #{{ order.id }}</p>
              <p class="text-xl text-gray-500">Placed on {{ formatDate(order.createdAt) }}</p>
              <p class="text-xl text-gray-500">
                Payment : {{ order.paymentProvider || 'Not Specified' }}
              </p>
              <p class="text-xl text-gray-500">
                <strong>Total:</strong> {{ order.totalPrice }} {{ order.currency }}
              </p>
            </div>
            <button
              @click="viewOrderDetails(order.id)"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- No Orders State -->
      <div v-if="!loading && orders.length === 0" class="text-center text-gray-500">
        <p>You have no orders yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStoreUser } from '@/stores/storeUser';
import { navigateTo } from '#app';

const userStore = useStoreUser();
const authStore = useStoreAuth(); // <-- use your auth store
const orders = ref([]);
const loading = ref(true);
const errorMessage = ref('');


// Fetch orders from the backend API
const fetchOrders = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const userId = authStore.authInfo?.uid || userStore.userSession.userId;

    if (!userId) {
      throw new Error('User is not logged in.');
    }

    // Call the backend API to fetch orders
    const response = await $fetch('/api/orders', {
      params: { userId },
    });

    if (response.success) {
      // Sort orders by createdAt in descending order
      orders.value = response.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('Fetched and sorted orders:', orders.value);
    } else {
      throw new Error(response.message || 'Failed to fetch orders.');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    errorMessage.value = 'Failed to load your orders. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Format date for display
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Navigate to order details page
const viewOrderDetails = (orderId) => {
  navigateTo(`/user/orders/${orderId}`);
};

// Fetch orders on page load
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>