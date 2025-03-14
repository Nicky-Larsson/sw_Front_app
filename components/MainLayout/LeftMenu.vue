<template>
    <div>
      <transition name="slide-left">
        <div v-if="leftStarted" class="fixed inset-0 z-40 flex w-64  items-center justify-left">
          <div @click="toggleMenu" class="fixed inset-0 bg-red-300 opacity-50"></div>
          <div @click.stop class="bg-white pl-6 pt-4 w-65 h-[98%] rounded shadow-lg relative">
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-3 mr-4">X</button> -->
            <ul>
                
                <!--  <li class="flex">
                  <VDropdown right>
                    <VDropdownItem icon="flag-usa">Anglais</VDropdownItem>
                    <VDropdownItem icon="flag-france">Français</VDropdownItem>
                    <VDropdownItem icon="flag-saudi-arabia">Arabe</VDropdownItem>
                  </VDropdown>
                </li> -->
                
                <!-- Selection Langue -->
                <li class="text-2xl py-4">Langue</li>


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
import { VDropdown, VDropdownItem } from 'nuxt-tailwind-kit'


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