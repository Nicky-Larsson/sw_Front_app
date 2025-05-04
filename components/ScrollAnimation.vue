<template>
    <div class="container mx-auto pt-1">
      <nuxt-link :to="imageList[props.imageName][1]">
        <img :src="imageList[props.imageName][0]" alt="image" class="w-full" />
      </nuxt-link>
    
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageName: String
})


const imageList = {
    sunset_CL: ['/sunset_CL_lowRes.jpg', '' ],
    sunset_BW: ['/sunset_BL_lowRes.jpg', ''],
    land_illusion: ['/land_of_illusion.jpg', ''],
    book_promo: ['/bookPromo.jpg', '/Fanoorassm/3d-library'],
    SN_T2_Promo: ['/Promo_Tome-3_SunsetLand.jpg', '/Fanoorassm/3d-library' ],
    expo_Promo: ['/expo_promo.jpg', '/ArtGallery'],
    Tbourida_arrrival: ['/tbourida_arrival.jpg', '']
}


</script>