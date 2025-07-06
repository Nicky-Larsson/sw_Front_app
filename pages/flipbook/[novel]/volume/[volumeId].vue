<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div v-if="loading" class="text-xl text-gray-500">Loading flipbook...</div>
    <div v-else-if="error" class="text-xl text-red-500">{{ error }}</div>
    <div v-else-if="!hasAccess" class="text-xl text-yellow-600">
      You do not have access to this volume.<br>
      <NuxtLink :to="`/Fanoorassm/${novel}`" class="text-blue-600 underline">Go back</NuxtLink>
    </div>
    <div v-else>
      <!-- Your Flipbook component goes here -->
      <FlipbookViewer :product="product" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStoreUser } from '@/stores/storeUser';
import { useStoreProducts } from '@/stores/storeProducts';

// 1. Get route params
const route = useRoute();
const router = useRouter();
const novel = route.params.novel;
const volumeId = route.params.volumeId;

// 2. State
const loading = ref(true);
const error = ref('');
const product = ref(null);
const hasAccess = ref(false);

const userStore = useStoreUser();
const storeProducts = useStoreProducts();

// 3. Fetch product and check access
onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    // Ensure products are loaded
    if (!storeProducts.productsLoaded) {
      await storeProducts.getProducts();
    }

    // Find the product in the store
    const productData = storeProducts.products?.[novel]?.[volumeId]?.[userStore.userSession.choosedLanguage];
    if (!productData) {
      error.value = 'Volume not found.';
      return;
    }
    product.value = productData;

    // Check access rights (assuming you store access in userSession.access_rights)
    const accessList = userStore.userSession.access_rights || [];
    hasAccess.value = accessList.some(
      (item) =>
        item.graphic_novel_uid === novel &&
        item.volume_uid === volumeId
    );

    // Optionally: If not, you could fetch from server for more secure check

  } catch (err) {
    error.value = 'Failed to load flipbook data.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>