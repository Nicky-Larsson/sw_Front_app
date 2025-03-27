<template>
 <div class="text-amber-50 pt-10 text-4xl">

        <h1>Purchase Success Page</h1>
        <br>
        <p>Your purchase was successful!</p>
    </div> 
</template>

<script setup>
import { ref } from 'vue'

const purchaseSuccess = ref('')     
</script>

<style scoped>
    h1 {
        text-align: center;
    }

    p {
        text-align: center;
    }
</style>