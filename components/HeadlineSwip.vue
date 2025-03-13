<template>
<!-- sm : 640px, md à 768px, lg à 1024px, xl à 1280px, et 2xl à 1536px. -->
  <Carousel v-bind="config" class="bg-blue-700" :components="{ Slide, Navigation }">
    <Slide v-for="image in images" :key="image.id" >
      <img :src="image" alt="image"/>
    </Slide>

    <template #addons>
      <Navigation />
    </template>
  </Carousel>
</template>

<script setup>
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Navigation } from 'vue3-carousel';

const images = [ '/dragon_quest_1.jpg',
                 '/dragon_quest_2.jpg',
                 '/dragon_quest_3.jpg']


const config = {
  height: '480',
  itemsToShow: 'auto',
  gap: 20,
  autoplay: 6000,
  breakpointMode: 'viewport',
  dir:'rtl',
  transition: 1400,
  wrapAround: true,
  pauseAutoplayOnHover: false,
  preventExcessiveDragging: false,
  snapAlign: 'center-odd',
  threshold: 1,
  enable: true,
  mouseDrag: true,
  touchDrag: true,
};
</script>


