<template>

  <Carousel v-bind="config"  :components="{ Slide, Navigation }">
    <Slide v-for="image in images" :key="image.id">
      <img :src="image" alt="image" />
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
  height: 430,
  itemsToShow: 1,
  gap: 2,
  autoplay: 6000,
  transition: 3000,
  wrapAround: true,
  pauseAutoplayOnHover: true,
  enable: true,
  mouseDrag: true,
  touchDrag: true,
};
</script>


