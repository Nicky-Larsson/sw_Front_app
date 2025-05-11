<template>
    
    <div class="container mx-auto pt-2 pb-2">
        <div v-if="bookPromoName">
          <!-- <nuxt-link
            :to="`/Fanoorassm/${bookPromoName.product_uid.graphic_novel_uid}/volume/${bookPromoName.product_uid.volume_uid}`"
          > -->
          <nuxt-link :to="bookList[props.bookPromoName][1]">
            <img
              :src="bookList[bookPromoName][0]"
              class="w-full object-cover"
              alt="image"
              fit="contain"
            />
          </nuxt-link>
        </div>
        <div v-else>
          <p>Invalid book promo data</p>
        </div>
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