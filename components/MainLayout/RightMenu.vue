<template>
    <div>
      <button @click="toggleMenu" class="bg-blue-500 text-white px-4 py-2 rounded">Open Menu</button>
      <transition name="slide-right">

        <div v-if="showMenu" class="fixed z-40  top-0 right-0 h-full w-64 bg-gray-800  flex flex-col justify-center items-center transition-transform duration-300 ease-in-out">
          <div @click="toggleMenu" class="fixed inset-0 bg-red-300 opacity-50"></div>
          <div @click.stop class="bg-white pl-10 pt-10 w-60 h-[90%] rounded shadow-lg relative">
            <button @click="toggleMenu" class="absolute top-0 right-0 mt-4 mr-4">X</button>
            <ul>
                <li class="text-2xl py-5">Menu Item 1</li>
                <li class="text-2xl py-5">Menu Item 2</li>
                <li class="text-2xl py-5">Menu Item 3</li>
            </ul>  
          </div>
        </div>
      </transition>



    </div>

    
        
</template>

<script setup>
import { ref } from 'vue'

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
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