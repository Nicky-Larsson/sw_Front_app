<template>
  <div class="bg-orange-950">
    <banner-v2 v-if="!isFlipbookPage" 
               @orderLeftMenu="triggerLeftMenu" 
               @orderRightMenu="triggerRightMenu"
               @orderCloseMenu="triggerCloseMenu"/>

    <slot /> 

    <!-- Hide bottomNav2 on flipbook pages -->
    <bottomNav2 v-if="!isFlipbookPage" 
                @orderLeftMenu="triggerLeftMenu" 
                @orderRightMenu="triggerRightMenu"
                @orderCloseMenu="triggerCloseMenu"/>
    
    <LeftMenu :leftStarted="leftStarted" 
              @update:leftStarted="leftStarted = $event"/>

    <RightMenu :rightStarted="rightStarted"
              @update:rightStarted="rightStarted = $event"/>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStoreAuth } from '@/stores/storeAuth';
import { provideMenuActions } from '@/composables/useMenuState';


const route = useRoute();

// RESTORE THE ORIGINAL STATE
const leftStarted = ref(false);
const rightStarted = ref(false);




// RESTORE THE ORIGINAL FUNCTIONS
const triggerLeftMenu = () => {
  if (rightStarted.value) {
    rightStarted.value = false;
  }
  leftStarted.value = !leftStarted.value;
};

const triggerRightMenu = () => {
  if (leftStarted.value) {
    leftStarted.value = false;
  }
  rightStarted.value = !rightStarted.value;
};

const triggerCloseMenu = () => {
  leftStarted.value = false;
  rightStarted.value = false;
};

// Computed property to check if we're on a flipbook page
const isFlipbookPage = computed(() => {
  return route.path.toLowerCase().startsWith('/flipbook');
});


// Then add this after your triggerCloseMenu function:
provideMenuActions({
  toggleLeftMenu: triggerLeftMenu,
  toggleRightMenu: triggerRightMenu,
  closeMenus: triggerCloseMenu
});


onMounted(() => {
  const authStore = useStoreAuth();
  authStore.init();
});
</script>

<style scoped>
 
</style>