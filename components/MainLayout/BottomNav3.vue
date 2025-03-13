<template>
    <div class="fixed bottom-0 left-0 right-0 w-full h-18 bg-yellow-300 border-t border-cyan-400 ">
        <div class="flex mx-auto relative justify-center items-center w-full h-full bg-gray-800 text-white border-b border-pink-700">
            <nuxt-link to="/checkout/shoppingCart" class="px-3 py-2 rounded hover:bg-gray-900 hover:text-white border-r border-gray-200"> Menu </nuxt-link>
            <nuxt-link to="/" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200"> Accueil </nuxt-link>
            <nuxt-link to="/ArtGallery" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200"> Gallerie </nuxt-link>
            <nuxt-link to="/Fanossoura" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200"> Lecture </nuxt-link>
            <nuxt-link to="/authentication/clientconfig" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white "> Compte </nuxt-link>
        </div>
    </div>



</template>

<script setup>
import { ref } from 'vue'

</script>


<style scoped>

</style>