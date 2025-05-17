<template>
   <client-only>
    <div class="container mx-auto pt-2 md:w-[35%]">
      <nuxt-link to="">
        <img src="/library.jpg" alt="image" class="w-350 h-140  object-fill" />
      </nuxt-link>
      <div class="flex flex-col text-amber-50 text-center text-4xl block"> 

        <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapic_novel_id}` " no-prefetch>
          {{ librarySet_1.grapic_novel_name }}
        </NuxtLink>
      </div>
    </div>
   </client-only> 
</template>

<script setup>
import { ref } from 'vue'

const librarySet_1 = reactive({
    grapic_novel_id: "sunset_land",
    grapic_novel_name: "Sunset Land",
    volume_num: 3,
    chapter_num: 4,
    figurine_name: "tbourida",
    illustration_name: "Entrer to Fes Jdid",
    magazine_num: 1
   })

</script>

