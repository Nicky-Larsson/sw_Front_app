<template>

    <div class="pt-1 pb-1">
      <!-- <img :src="bookList[props.bookName]" alt="image" class="w-full h-50 object-contain"/> -->
    <NuxtImg
        :src="bookList[props.bookName]"
        class="w-900 h-45  md:h-80 object-cover "
        alt="image"
        fit="contain"/>
    </div>
</template>

<script setup>

import { ref } from 'vue'

const props = defineProps({
  bookName: String
})


const bookList = {
    Sunset_Land_Tomes: '/Sunset_Land_Tomes.jpg'
}



</script>
