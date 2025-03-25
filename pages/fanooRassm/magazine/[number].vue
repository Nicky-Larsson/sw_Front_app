<template>
    <div class="text-4xl text-white  text-center p-10">
        <h3  > numero Magazine </h3>

        <div> {{numero}} </div>
     
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const numero = route.params


</script>
