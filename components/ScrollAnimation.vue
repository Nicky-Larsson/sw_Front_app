<template>
    <div class="container mx-auto pt-1">
    
      <img :src="imageList[props.imageName]" alt="image" class="w-full"/>
    
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  imageName: String
})


const imageList = {
    sunset_CL: '/sunset_CL_lowRes.jpg',
    sunset_BW: '/sunset_BL_lowRes.jpg',
    land_illusion: '/land_of_illusion.jpg'
}

    console.log(props.imageName);
    console.log(imageList[props.imageName]);

</script>