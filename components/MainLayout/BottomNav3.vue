<template>
    <div class="fixed bottom-0 left-0 right-0 w-full h-18 bg-yellow-300 border-t border-cyan-400 ">
        <div class="flex mx-auto relative justify-center items-center w-full h-full bg-gray-800 text-white border-b border-pink-700">
            <nuxt-link to="/checkout/shoppingCart" class="px-3 py-2 rounded hover:bg-gray-900 hover:text-white border-r border-gray-200 mx-auto"> Menu </nuxt-link>
            <nuxt-link to="/" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200 mx-auto"> 
              Accueil

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>            
            </nuxt-link>
        
            <button type="button"  class="inline-flex flex-col items-center justify-center px-5 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 group border-x dark:border-gray-600">

                <nuxt-link to="/Fanoorassm/3d-library" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200 mx-auto
                group-hover:text-blue-600 dark:group-hover:text-blue-500">
                    <svg class="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                    </svg>
                Profile </nuxt-link>
                <span class="text-sm text-gray-500 dark:text-gray-400 "></span>

            </button>    
    
            <nuxt-link to="/ArtGallery" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200 mx-auto"> Gallerie </nuxt-link>
            <nuxt-link to="/Fanoorassm/3d-library" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white border-r border-gray-200 mx-auto"> Lecture </nuxt-link>
            <nuxt-link to="/authentication/clientconfig" class="px-2 py-2 rounded hover:bg-gray-700 hover:text-white mx-auto"> Compte </nuxt-link>
    
        </div>
    </div>



</template>

<script setup>
import { ref } from 'vue'

</script>


<style scoped>

</style>