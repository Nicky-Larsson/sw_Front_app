<template>
  <div class="text-amber-50 pt-10 text-2xl">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <div class="flex-1 flex flex-col justify-center py-1 px-4 sm:px-6 lg:px-20 lg:flex-none xl:px-24">
      <div class="mx-auto">
        <h2 class="mt-6 text-2xl font-extrabold text-gray-300 md:text-3xl">Thank you!</h2>
        <nuxt-link to="/authentication/signin" class="mt-2 text-sm font-medium text-green-600 hover:text-gren-500">
          Already have an account? Sign in
        </nuxt-link>
      </div>
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div class="mt-2">
          <p class="px-2 mb-2 mt-4 text-center text-gray-100">You are disconnected</p>
        </div>
      </div>
    </div>

    <div class="hidden relative flex-1 sm:block">
      <img src="/dragon_quest_1.jpg" alt="nature" class="h-full w-full object-cover">
    </div>
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
  }, 3500);
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
    form {
        display: flex;
        flex-direction: column;
        width: 50%;
        margin: 0 auto;
    }

    label {
        margin-bottom: 5px;
    }

    input {
        margin-bottom: 10px;
        padding: 5px;
    }

    button {
        padding: 5px;
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }
</style>