<template>
  <div class="min-h-screen p-6 bg-gray-100">
    <div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6">Order #{{ order?.id }}</h1>
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading order details...</p>
      </div>
      <div v-if="errorMessage" class="text-center text-red-500">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-if="order && !loading">
        <p class="mb-2 text-gray-700"><strong>Placed on: </strong> {{ formatDate(order.createdAt) }}</p>
        <p class="mb-2 text-gray-700">
          <strong>Status: </strong> 
          <span :class="getStatusClass(order.status)">{{ order.status || 'N/A' }}</span>
        </p>
        <p class="mb-2 text-gray-700"><strong>Payment: </strong> {{ order.payment_infos?.payment_method || order.webhook_answer?.payment_method || '-' }}</p>
        <p class="mb-4 text-gray-700"><strong>Total:</strong> {{ formatEuro(order.totalPrice) }}</p>
        <h2 class="text-xl font-semibold mb-2">Products</h2>
        <div v-if="order.checkoutItems && order.checkoutItems.length > 0">
          <div
            v-for="(prod, idx) in order.checkoutItems"
            :key="idx"
            class="flex items-start border-b py-4 gap-4"
          >
            <NuxtLink
              :to="`/Fanoorassm/${prod.product_uid.graphic_novel_uid}/volume/${prod.product_uid.volume_uid}`"
              class="flex items-center flex-1 min-w-0"
              style="text-decoration: none;"
            >
              <img
                :src="prod.thumbnail || '/placeholder.png'"
                alt="Product image"
                class="w-16 h-16 object-cover rounded mr-4 flex-shrink-0"
              />
              <div class="flex flex-col min-w-0">
                <div class="font-bold truncate">
                  {{ prod.graphic_novel_name || prod.product_uid.graphic_novel_uid }}
                </div>
                <div class="text-gray-600 truncate">
                  {{ prod.name || prod.volume_name || prod.product_uid.volume_uid }}
                </div>
                <div class="text-gray-600 truncate">
                  {{ prod.title || prod.volume_title || prod.product_uid.volume_uid }}
                </div>
                <div class="text-gray-400 text-xs mt-1">
                  {{ prod.language ? prod.language.toUpperCase() : '' }}
                </div>
              </div>
            </NuxtLink>
            <div class="font-semibold text-lg min-w-[90px] ml-2 mt-0.5">
              {{ formatPriceCentsToEuro(prod.price) }}
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500">
          No products found in this order.
          <div v-if="order.items" class="flex items-center mt-2">
            {{ order.items }}
          </div>
        </div>
      </div>
      <div v-else-if="!loading && errorMessage" class="text-red-500">
        {{ errorMessage }}
      </div>
      <div class="mt-6">
        <NuxtLink to="/user/orders" class="text-blue-600 hover:underline">&larr; Back to orders</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStoreUser } from '@/stores/storeUser';

const route = useRoute();
const orderId = route.params.orderId;
const order = ref(null);
const loading = ref(true);
const errorMessage = ref('');
const authStore = useStoreAuth();

const userStore = useStoreUser();


const userId = authStore.authInfo?.uid || userStore.userSession.userId;

const formatPriceCentsToEuro = (cents) => 
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

const formatEuro = (amount) =>
  amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });


// const currencySymbol = (currency) => currency === 'EUR' ? '€' : currency;



const fetchOrderDetails = async () => {
  //console.log('Fetching order details for orderId:', orderId, 'and userId:', userId);
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await $fetch(`/api/orders/${orderId}?userId=${userId}`);
    if (response.success) {
        order.value = {
          ...response.order,
          checkoutItems: Array.isArray(response.order.checkoutItems) ? response.order.checkoutItems : [],
        };
      console.log(order.value );
    } else {
      throw new Error(response.message || 'Order not found.');
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load order details.';
    console.error('Error fetching order details:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getStatusClass = (status) => {
  if (!status) return 'text-gray-500';
  status = status.toLowerCase();
  if (status === 'paid' || status === 'completed') return 'text-green-500 font-semibold';
  if (status === 'pending') return 'text-yellow-500 font-semibold';
  if (status.includes('error') || status === 'failed' || status.includes('issue')) return 'text-red-500 font-semibold';
  return 'text-gray-500'; // Default for other statuses
};

onMounted(() => {
  fetchOrderDetails();
});
</script>