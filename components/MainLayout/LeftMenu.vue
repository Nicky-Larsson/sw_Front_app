<template>
    <div>
      <transition name="slide-left">
        <div v-if="leftStarted" class="fixed inset-0 z-40 flex w-64  items-center justify-left">
          <div @click="toggleMenu" class="fixed inset-0 bg-red-300 opacity-50"></div>
          <div @click.stop class="bg-white pl-6 pt-4 w-65 h-[98%] rounded shadow-lg relative">
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-3 mr-4">X</button> -->
            <ul>
                
                <li class="flex">
                  <img src="/simowarch_logo.jpeg" alt="Logo Description" class="w-30 h-30 mr-4">
                  <nuxt-link  @click="toggleMenu" to="/authentication/signin" class="text-blue-500 hover:text-blue-700"></nuxt-link>
                </li>
                
                <!-- Langue -->
                <li class="text-2xl py-4">Langue</li>

                <li class="relative">
                    <button class="flex items-center gap-2 p-2"  @click="toggleVisibility">
                      <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5" />
                      <span> Darija</span>
                    </button>
                    <div class="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <ul class="py-2"  v-if="isVisible">
                        <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                          <img src="/flags/ar_flag.jpg" alt="Arabic" class="w-6 h-5 inline-block" />
                          <span> Arabic</span>
                        </li>
                        <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                          <img src="/flags/fr_flag.jpg" alt="French" class="w-6 h-5 inline-block" />
                          <span> French</span>
                        </li>
                        <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                          <img src="/flags/en_flag.jpg" alt="English" class="w-6 h-5 inline-block" />
                          <span> English</span>
                        </li>
                      </ul>
                    </div>
                </li>

                <li class="text-2xl py-4">
                  <button id="toggleButton" @click="toggleList">{{ selectedItem }}</button>
                  <ul id="myList" class="hidden" @click="selectItem">
                    <li>
                      <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5" />
                      <span> Darija</span>                      
                    </li>
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/ar_flag.jpg" alt="Arabic" class="w-6 h-5 inline-block" />
                      <span> Arabic</span>
                    </li>
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/fr_flag.jpg" alt="French" class="w-6 h-5 inline-block" />
                      <span> French</span>
                    </li>
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/en_flag.jpg" alt="English" class="w-6 h-5 inline-block" />
                      <span> English</span>
                    </li>
                  </ul>
                  <li id="selectedItem"></li>
                </li>



                <li class="text-2xl py-4">Bibliotheque</li>
                <li class="text-2xl py-4">Gallery Expo</li>
                <li class="text-2xl py-4">Installer App</li>
                <li class="text-2xl py-4">About Us</li>
                <li class="text-2xl py-4">Mentions Legales</li>
            </ul>
          </div>
        </div>
      </transition>
    </div>    
</template>

<script setup>
import { ref, defineProps } from 'vue'
///////////////

const selectedItem = ref('French')

const toggleList = () => {
  const list = document.getElementById('myList')
  list.classList.toggle('hidden')
}

const selectItem = (event) => {
  selectedItem.value = event.target.textContent
  const list = document.getElementById('myList')

  list.classList.toggle('hidden')
}


///////////////
const props = defineProps({
  leftStarted: Boolean
})

const emit = defineEmits(['update:leftStarted']);

const toggleMenu = () => {
  emit('update:leftStarted', !props.leftStarted);
}


</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>