<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">{{ product.volume_title || product.volume_name }}</h2>
    <!-- Your flipbook logic here, e.g. PDF viewer, images, etc. -->
    <div>
      <img :src="product.cover" alt="Cover" class="mb-4 max-w-xs" />
      <p>{{ product.description }}</p>
      <!-- Add your flipbook logic here -->
    </div>
  </div>
</template>

<script setup>
defineProps({ product: Object });
</script>