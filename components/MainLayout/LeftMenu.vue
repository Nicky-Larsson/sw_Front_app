<template>
    <div>
      <div>{{ leftStarted ? 'Starting...' : 'Not Starting..' }}</div>
      <button @click="toggleMenu" class="bg-blue-500 text-white px-4 py-2 rounded">Open Menu</button>
      <transition name="slide-left">
        <div v-if="leftStarted" class="fixed inset-0 z-40 flex w-64  items-center justify-left">
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
import { ref, defineProps } from 'vue'

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