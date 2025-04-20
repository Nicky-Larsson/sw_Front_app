<template>
    <div class="flex justify-start my-2">
        <img 
            class="rounded-md md:w-[150px] w-[90px]" 
            :src="product.thumbnail"
        >

        <div class="overflow-hidden pl-2">

            <div class="text-lg font-semibold mt-2">
                <span class="font-bold">{{ product.graphic_novel_name }}</span>  
            </div>
            
            <div class="flex items-center">
                <div class="truncate text-xl pl-2">{{ product.volume_name }} </div>
            </div>

            <div class="flex items-center">
                <div class="truncate text-xl pl-2">{{ product.volume_title }} </div>
            </div>

            <div class="flex items-center">
                <!-- Display the language image -->
                <div class="truncate text-xl pl-2">{{ languageImage?.text || product.language }}</div>
                <img 
                    v-if="languageImage" 
                    :src="languageImage.image" 
                    :alt="languageImage.alt" 
                    class="h-6 w-6 rounded-full ml-2"
                >

            </div>

            <div class="text-lg font-semibold mt-2">
                <span class="font-bold">{{ product.price / 100 }}</span>  €
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['product'])
const { product } = toRefs(props)

const languages = ref([
  { id: 'ar', image: '/flags/ar_flag.jpg', alt: 'Arabic',   text: 'Arabic' },
  { id: 'ma', image: '/flags/ma_flag.jpg', alt: 'Morrocan', text: 'Darija' },
  { id: 'en', image: '/flags/en_flag.jpg', alt: 'English',  text: 'English'},
  { id: 'fr', image: '/flags/fr_flag.jpg', alt: 'French',   text: 'French' }
])

// Computed property to find the corresponding language object
const languageImage = computed(() => {
  return languages.value.find((lang) => lang.id === product.value.language) || null;
})

</script>
