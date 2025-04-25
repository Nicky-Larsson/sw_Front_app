<template>
 <div class="text-amber-50 pt-10 text-4xl">

        <h1>Purchase Success Page</h1>
        <br>
        <p>Your purchase was successful!</p>
    </div> 
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { navigateTo } from '#app'; // Use navigateTo for redirection

let timeoutId; // Declare a variable to store the timeout ID

onMounted(() => {
  // Redirect to the main menu after 4 seconds
  timeoutId = setTimeout(() => {
    navigateTo('/'); // Replace '/' with your main menu route
  }, 4000);
});

onUnmounted(() => {
  // Clear the timeout if the component is destroyed
  if (timeoutId) {
    clearTimeout(timeoutId);
    console.log('Timeout cleared');
  }
}); 
</script>

<style scoped>
    h1 {
        text-align: center;
    }

    p {
        text-align: center;
    }
</style>