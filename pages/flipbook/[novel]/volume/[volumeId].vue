<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div v-if="loading" class="text-xl text-gray-500">Loading flipbook...</div>
    <div v-else-if="error" class="text-xl text-red-500">{{ error }}</div>
    <!-- <div v-else-if="!hasAccess" class="text-xl text-yellow-600">
      You do not have access to this volume.<br>
      <NuxtLink :to="`/Fanoorassm/${novel}`" class="text-blue-600 underline">Go back</NuxtLink>
    </div>
    <div v-else> -->
      <!-- Your Flipbook component goes here -->
      <!-- <FlipbookViewer :product="product" /> -->
    <!-- </div> -->

    <FlipbookViewer 
      v-if="!loading && !error && product" 
      :product="product" 
    />


    <!-- {{language}}
    {{product}} -->
    
    <!-- <br>
  <div v-if="product && product.pages">
    <div v-for="(page, key) in product.pages" :key="key" class="mb-1">
      <img
        :src="page.image_url"
        :alt="`Page ${key + 1}`"
        class="w-full max-w-md mx-auto rounded shadow"
        v-if="page.image_url"
      /> -->
      <!-- <div class="text-sm text-gray-700 mt-2">
        <div>Position: {{ page.position }}</div>
        <div>Type: {{ page.type }}</div>
        <div>Visible If: {{ page.visible_if }}</div>
        <div>Volume Num: {{ page.volume_num }}</div>
      </div> -->
    <!-- </div>
  </div> -->


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStoreUser } from '@/stores/storeUser';
import { useStoreProducts } from '@/stores/storeProducts';

// 1. Get route params and query
const route = useRoute();
const novel = route.params.novel;
const volumeId = route.params.volumeId;
const language = ref(route.query.lang || 'en'); // Default to 'en' if not set

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
    /* // 1. Check access rights first
    const accessList = userStore.userSession.access_rights || [];
    hasAccess.value = accessList.some(
      (item) =>
        item.graphic_novel_uid === novel &&
        item.volume_uid === volumeId
    );

    if (!hasAccess.value) {
      error.value = 'You do not have access to this volume.';
      return;
    } */

    // 2. Fetch product data using the store's getProduct method
    const productData = await storeProducts.getProduct(
      novel,
      volumeId,
      language.value
    );
    if (!productData) {
      error.value = 'Volume not found.';
      return;
    }
    product.value = productData;
    console.log('Product data:', product.value);

  } catch (err) {
    error.value = 'Failed to load flipbook data.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>