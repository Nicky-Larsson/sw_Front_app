<template>
  <div>
    <headline-swip/>

    <p class="text-lg">
      Welcome to the home page of our website. Here you can find all the information you need about our website.
    </p>

    <br>
    <p class="text-lg">
      You can find all the ad banners that we have in our gallery by clicking on the "Ad Banner" link in the navigation bar.
    </p>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useFlowbite } from '~/composables/useFlowbite';

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  })
})
</script>