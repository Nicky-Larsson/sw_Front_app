<template>

  <div class="container mx-auto pt-15 md:w-[60%] ">
    <section class="bg-green-700  container relative w-full h-110 overflow-hidden">
        <HeadlineSwip/>
    </section>
    
    <div class="bg-red-700 h-full  ">
      <ScrollAnimation :imageName="'sunset_CL'"/>
      <ScrollAnimation :imageName="'land_illusion'"/>
      <ScrollAnimation :imageName="'book_promo'"/>
      <BooksSwipe :bookName="'Sunset_Land_Tomes'" />
      <ScrollAnimation :imageName="'SN_T2_Promo'"/>
      <BookPromo :bookPromoName="'bookDesc'"/>
      <ScrollAnimation :imageName="'expo_Promo'"/>
      <div class="pb-[20%]"></div>
      <ScrollAnimation :imageName="'Tbourida_arrrival'"/>
      <footerMain/>

    </div>

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
