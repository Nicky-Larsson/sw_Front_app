<template>
    
    <div class="container mx-auto pt-2 pb-2">
      <!-- <img :src="bookList[props.bookName]" alt="image" class="w-full h-50 object-contain"/> -->
    <NuxtImg
        :src="bookList[props.bookPromoName]"
        class="w-full object-cover "
        alt="image"
        fit="contain"/>
    </div>

</template>

<script setup>
 import { ref, defineProps } from 'vue'

const props = defineProps({
  bookPromoName: String
})


const bookList = {
    bookDesc: '/book_Desc.jpg'
}


</script>

<style scoped>

</style>