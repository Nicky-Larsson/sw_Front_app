<template>
    <div class="text-4xl text-white  text-center p-0">


        <div class="mt-4 max-w-[1000px] mx-auto px-2">
            <div class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="md:w-[40%]">
                    <img 
                        v-if="currentImage"
                        class="rounded-lg object-fit"
                        :src="currentImage"
                    >

                </div>
                <div class="md:w-[60%] bg-white p-3 rounded-lg text-amber-950">
                    <div v-if="volumeParams.id && volumeParams.name">
                        <p class="mb-2">{{ volumeParams.name }}</p>
                        <p class="mb-2 text-2xl">{{ volumeParams.title }}</p>
                        <p class="font-light text-[20px] mb-2">{{ volumeParams.description }}</p>
                    </div>

                    <div class="border-b" />
                        <div class="flex items-center justify-center gap-2 my-2">
                            <div class="text-xl font-bold">$ {{ priceComputed }}</div>
                        </div>
                    <div />
                    
                    <button 
                        @click="addToCart()"
                        :disabled="isInCart"
                        class="
                            px-6 
                            py-2 
                            rounded-lg 
                            text-white 
                            text-lg 
                            font-semibold 
                            bg-gradient-to-r 
                            from-[#FF851A] 
                            to-[#FFAC2C]
                        "
                    >
                        <div v-if="isInCart">Is Added</div>
                        <div v-else>Add to Cart</div>
                    </button>
                    <div v-if="images[0] !== ''" class="flex items-center justify-center mt-0 p-5">
                        <div v-for="(image, index) in images" :key="index">
                            <img 
                                @mouseover="currentImage = image"
                                @click="currentImage = image"
                                width="70"
                                class="rounded-md object-fit border-[3px] cursor-pointer"
                                :class="currentImage === image ? 'border-[#FF5353]' : ''"
                                :src="image"
                            >
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <button @click="goBack" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go Back
        </button>
     
    </div>
</template>

<script setup>

import { useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user';
import { useSessionStore } from '~/stores/session';


const route = useRoute()
const infos = route.params
const volumeParams = route.query
const router = useRouter()
const userStore = useUserStore()
const sessionStore = useSessionStore()


import { storeToRefs } from 'pinia';

const goBack = () => {
  router.back()
}

// console.log(volumeParams);
// console.log(userStore.cart);

let product = ref(null)
let currentImage = ref(null)

currentImage.value = volumeParams.cover



 onBeforeMount(async () => {
   // product.value = await useFetch(`/api/prisma/get-product-by-id/${route.params.id}`)
})


watchEffect(() => {
    if (volumeParams) {
        currentImage.value = volumeParams.cover
        // images.value[0] = product.value.data.url
        userStore.isLoading = false
    }
}) 

const isInCart = computed(() => {
 let res = false
    userStore.cart.forEach(prod => {
        // console.log(prod);
        // console.log(volumeParams);
        if (volumeParams.id == prod.id) {
            res = true
        }
    })
    return res
})


const priceComputed = computed(() => {
    if (volumeParams.price ) {
        return volumeParams.price / 100
    }
    return '0.00'
})

const addToCart = () => {
    userStore.cart.push(volumeParams)
    sessionStore.cart.push(volumeParams)
    console.log(userStore.cart);
}



const images = ref([
    '',
    'https://picsum.photos/id/212/800/800',
    'https://picsum.photos/id/233/800/800',
    'https://picsum.photos/id/165/800/800',
    'https://picsum.photos/id/99/800/800',
    'https://picsum.photos/id/144/800/800',
])

images.value[0] = volumeParams.cover;

// console.log(userStore);

</script>