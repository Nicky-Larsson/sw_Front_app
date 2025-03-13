<template>
  <div>

    <div class="container mx-auto pt-5  ">
      <div class="bg-green-700  container relative w-full h-122 overflow-hidden">
         <headline-swip/> 
      </div>
      
     <div class="bg-red-700 h-150  container ">  
      <p class="text-lg">
        Welcome to the home page of our website. Here you can find all the information you need about our website.
      </p>
     </div>

      <br>
    </div>
    




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

<style>

</style>
