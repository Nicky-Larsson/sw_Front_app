<template>
    <div class="text-4xl text-white  text-center p-10">
        <h3  > chapter numero {{infos.chapterNum}} </h3>

        <div> {{infos}} </div>
     
    </div>
</template>

<script setup>
    import { useRoute } from 'vue-router'
    const route = useRoute()
    const infos = route.params
</script>