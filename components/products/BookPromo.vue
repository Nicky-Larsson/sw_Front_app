<template>
    
    <div class="container mx-auto pt-2 pb-2">
      <!-- <img :src="bookList[props.bookName]" alt="image" class="w-full h-50 object-contain"/> -->
      <nuxt-link :to="bookList[props.bookPromoName][1]">
        <NuxtImg
            :src="bookList[props.bookPromoName][0]"
            class="w-full object-cover "
            alt="image"
            fit="contain"/>
      </nuxt-link>
    </div>

</template>

<script setup>
 import { ref} from 'vue'

const props = defineProps({
  bookPromoName: String
})


const bookList = {
    bookDesc: ['/book_Desc.jpg', '/Fanoorassm/3d-library' ]
}


</script>

<style scoped>

</style>