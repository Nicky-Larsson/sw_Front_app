<template>

  <div class="container mx-auto pt-3">
    <section class="bg-green-700  container relative w-full h-110 overflow-hidden">
        <HeadlineSwip/>
    </section>
    
    <section class="bg-red-700 h-138  container ">
      <ScrollAnimation :imageName="'sunset_CL'"/>
    </section>

    <section class="bg-red-700 h-135  container ">
      <ScrollAnimation :imageName="'land_illusion'"/>
    </section>

    <br>
  </div>





</template>

<script setup>

// const  imageName = ref("sunset_BW")


import { ref } from 'vue';
import { onMounted } from 'vue';
import { useFlowbite } from '~/composables/useFlowbite';

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  })
})



</script>

<style>

</style>
