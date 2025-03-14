<template>
    <div>
      <transition name="slide-right">

        <div v-if="rightStarted" class="fixed z-40  top-0 right-0 h-full w-64 bg-gray-800  flex flex-col justify-center items-center transition-transform duration-300 ease-in-out">
          <div @click="toggleMenu" class="fixed inset-0 bg-red-300 opacity-50"></div>
          <div @click.stop class="bg-white pl-6 pt-4 w-65 h-[98%] rounded shadow-lg relative">
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-4 mr-4">X</button> -->
            <ul>
                <li class="text-4xl py-4 flex items-center">
                  <img src="/tumblr.svg" alt="Logo Description" class="w-10 h-10 mr-4">
                  <nuxt-link  @click="toggleMenu" to="/authentication/signup" class="text-blue-500 hover:text-blue-700">Login</nuxt-link>
                </li>
                <li class="text-2xl py-4">Historiques Achats</li>
                <li class="text-2xl py-4">Mon Panier</li>
                <li class="text-2xl py-4">Cadeaux </li>
                <li class="text-2xl py-4">Favoris </li>
                <li class="text-2xl py-4">Configuration Profil</li>
                <li class="text-2xl py-4">Aide</li>
                <li class="text-2xl py-4">Déconnection</li>
            </ul>  
          </div>
        </div>
      </transition>



    </div>

    
        
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  rightStarted: Boolean
})

const emit = defineEmits(['update:rightStarted']);

const toggleMenu = () => {
  emit('update:rightStarted', !props.rightStarted);
}
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>