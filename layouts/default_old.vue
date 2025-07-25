<template>

  <div class="bg-orange-950">
    
    <banner-v2 @orderLeftMenu="triggerLeftMenu" 
               @orderRightMenu="triggerRightMenu"
               @orderCloseMenu="triggerCloseMenu"/>

     

<!-- 
    <nuxt-link to="/"> Home </nuxt-link>

    
    <nuxt-link to="/ArtGallery"> Art Gallery </nuxt-link>
    <nuxt-link to="/Fanoorassm/3d-library"> Your Library </nuxt-link>


    
    
    <nuxt-link to="/TermsAndConditions"> Terms And Conditions </nuxt-link>
    <nuxt-link to="/loadingPage"> Loading Page </nuxt-link>
    <nuxt-link to="/aboutUs"> About Us </nuxt-link>
    
    
    <nuxt-link to="/checkout/shoppingCart"> Shopping Cart </nuxt-link>
    <nuxt-link to="/checkout/paymentMethod"> Payment </nuxt-link>
    <nuxt-link to="/checkout/PurchaseSuccess"> Purchase Success </nuxt-link>
    
    
    <nuxt-link to="/authentication/clientconfig"> Account </nuxt-link>
    <nuxt-link to="/authentication/signin"> Sign In </nuxt-link>
    <nuxt-link to="/authentication/signup"> Sign Up </nuxt-link>
    <nuxt-link to="/authentication/mailConfirm"> Mail Confirm  </nuxt-link>
 
 -->
    <slot @toggle-left-menu="triggerLeftMenu" @toggle-right-menu="triggerRightMenu" />



    <!-- Hide bottomNav2 on flipbook pages -->
    <bottomNav2 v-if="!isFlipbookPage" 
                @orderLeftMenu="triggerLeftMenu" 
                @orderRightMenu="triggerRightMenu"
                @orderCloseMenu="triggerCloseMenu"/>
    
    <LeftMenu :leftStarted="leftStarted" 
              @update:leftStarted="triggerLeftMenu"/>

    <RightMenu :rightStarted="rightStarted"
              @update:rightStarted="triggerRightMenu"/>
    <br><br><br>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreAuth } from '@/stores/storeAuth';

const route = useRoute()

// Computed property to check if we're on a flipbook page
const isFlipbookPage = computed(() => {
  // Use toLowerCase() to make the comparison case-insensitive
  return route.path.toLowerCase().startsWith('/flipbook')
})

onMounted(() => {
  const authStore = useStoreAuth();
  authStore.init();
});

const leftStarted = ref(false)
const rightStarted = ref(false)

// CORRECTED: This function now accepts an optional payload.
// If no payload is given (from FlipbookViewer), it toggles.
// If a payload is given (from LeftMenu), it sets the value directly.
const triggerLeftMenu = (value) => {
  if (typeof value === 'boolean') {
    leftStarted.value = value;
  } else {
    leftStarted.value = !leftStarted.value;
  }
  // If we are opening the left menu, ensure the right one is closed.
  if (leftStarted.value) {
    rightStarted.value = false;
  }
}

// CORRECTED: Same logic for the right menu.
const triggerRightMenu = (value) => {
  if (typeof value === 'boolean') {
    rightStarted.value = value;
  } else {
    rightStarted.value = !rightStarted.value;
  }
  // If we are opening the right menu, ensure the left one is closed.
  if (rightStarted.value) {
    leftStarted.value = false;
  }
}

const triggerCloseMenu = () => {
  rightStarted.value = false;
  leftStarted.value = false
}
</script>


<style scoped>
 
</style>