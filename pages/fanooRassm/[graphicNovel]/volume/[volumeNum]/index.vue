<template>
  <client-only>
    <div class="text-4xl text-white  text-center p-0">


        <div class="mt-4 max-w-[1000px] mx-auto px-0">
            <div class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="w-xl2 md:w-[35%]">
                    <img 
                        v-if="currentImage"
                        class="rounded-lg object-fit"
                        :src="currentImage"
                    >
                <div  class="flex items-center justify-center mt-0 p-2">
                      <div v-for="(image, index) in previewArray" :key="index">
                            <img 
                                @mouseover="updateCurrentImage(image, index)"
                                @click="updateCurrentImage(image, index)"
                                width="70"
                                class="rounded-md object-fit border-[3px] cursor-pointer"
                                :class="currentImage === image ? 'border-[#FF5353]' : ''"
                                :src="image"
                            >
                      </div>
                </div>   
                </div>
             
                
                <div class="md:w-[60%] bg-white p-3 rounded-lg text-amber-950">
                    <div class="relative group" v-if="volumePromoData.volume_uid && volumePromoData.volume_num">
                        <p class="mb-2">{{ volumePromoData.graphic_novel_title }}</p>
                        <p class="mb-2 text-2xl">
                          {{  volumePromoData.volume_name || '-' }} 
                        </p>                         
                        <p class="mb-2 text-xl">
                          {{ volumePromoData.volume_title || '-' }}
                        </p>                        
                        <!-- Description Text -->
                        <p 
                          class="font-light text-[22px] mb-2 max-h-32 overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 peer"
                        >
                          {{ volumePromoData.description }}
                        </p>

                        <!-- Fade Effect -->
                        <div 
                          class="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 opacity-100 peer-scroll:opacity-0"
                        ></div>

                        <!-- Scroll Down Indicator -->
                        <!-- <div 
                          class="absolute -bottom-6 left-0 w-full flex justify-center items-center text-gray-500 text-sm pointer-events-none"
                          v-if="volumePromoData.description && volumePromoData.description.length > 100"
                        >
                          <span class="animate-bounce">▼ Scroll Down</span>
                        </div> -->


                    </div>
                   
                    <div class="flex items-center justify-center gap-4 my-1">
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

                      <div class="text-xl font-bold">
                        {{ priceComputed }} €
                      </div>
                    </div>



<div class="overflow-hidden max-w-full text-center">
  <span class="block items-center text-2xl mb-4">Choose your language</span>
  <ul class="flex flex-wrap justify-center items-center gap-4">
    <li 
      v-for="item in items" 
      :key="item.id" 
      @click="chooseLanguage(item)" 
      class="hover:bg-gray-800 cursor-pointer px-3 py-2 flex items-center"
      :class="{ 'border-2 border-blue-500 rounded-md': selectedLanguage === item.id }"
    >
      <img :src="item.image" :alt="item.alt" class="w-6 h-5 inline-block">
      <span class="pl-2 text-xl">{{ item.text }}</span>
    </li>
  </ul>
</div>

                    <!-- New Buy Packages Button -->
                    <div v-if="isInCart" class="pt-1">

                        <span class='items-center text-2xl  font-bold'> Total : Package of all translations +   0.99 €    = 3.99 €  3.98 €</span>
                    
                      <div class="flex items-center justify-center gap-4 my-1">
                        <button 
                          @click="buyPackages()"
                          class="
                            px-6 
                            py-2 
                            rounded-lg 
                            text-white 
                            text-lg 
                            font-semibold 
                            bg-gradient-to-r 
                            from-[#1D4ED8] 
                            to-[#3B82F6]
                          "
                        >
                          Buy Packages  
                        </button>
                      
                        <div class="flex items-center justify-center gap-2 my-2">
                            <div class="text-xl font-bold"> 1 €</div>
                        </div>                     
                     
                      </div>


                    </div>
                      
                    <div class="pt-5" >
                      <button @click="goBack" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Go Back
                      </button>
                    </div>
                </div>


            </div>
          <!-- {{previewArray}} -->
          
          <br>
          <!-- {{volumePromoData}}-->          
          <br>
          
        </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useStoreUser } from '@/stores/storeUser';
import { useStoreProducts } from '@/stores/storeProducts'
import { storeToRefs } from 'pinia';

const route = useRoute()
const router = useRouter()
const userStore = useStoreUser()
const storeProducts = useStoreProducts()

// const volumeParams = route.query

const urlParams = route.params
const volumePromoData = ref(null)
const previewArray = ref([]);
const currentImage = ref(0);
const currentIndex = ref(0);

// const language = ref(userStore.userSession.defaultLanguage);
// const language = computed(() => userStore.userSession.defaultLanguage);  readonly

/* const descriptionContainer = ref(null);
const isAtBottom = ref(false);

const onScroll = () => {
  const container = descriptionContainer.value;
  if (container) {
    // Check if the user has scrolled to the bottom
    isAtBottom.value = container.scrollTop + container.clientHeight >= container.scrollHeight;
  }
} */


const language = computed({
  get: () => userStore.userSession.defaultLanguage,
  set: (value) => {
    userStore.userSession.defaultLanguage = value;
  },
});


let productInfosForCart = ref({
  graphic_novel_name: '',
  graphic_novel_uid: '',
  volume_uid: '',
  volume_name: '',
  volume_title: '',
  language: '',
  thumbnail: '',
  price: 0,
  product_uid: '',
});


const items = ref([
  { id: 'ar', image: '/flags/ar_flag.jpg', alt: 'Arabic',   text: 'Arabic' },
  { id: 'ma', image: '/flags/ma_flag.jpg', alt: 'Morrocan', text: 'Darija' },
  { id: 'en', image: '/flags/en_flag.jpg', alt: 'English',  text: 'English'},
  { id: 'fr', image: '/flags/fr_flag.jpg', alt: 'French',   text: 'French' },
])

const selectedLanguage = ref(userStore.userSession.defaultLanguage);

language.value = userStore.userSession.defaultLanguage

const chooseLanguage = (item) => {
   // storeProducts
   selectedLanguage.value = item.id; // Update the selected language
   // console.log(currentImage)
   // console.log(userStore.userSession.defaultLanguage)
   language.value = item.id  // Update the language in the store
   console.log('Selected language:', selectedLanguage.value);

   // volumePromoData.value =
   //   storeProducts.products[urlParams.graphicNovel][urlParams.volumeNum][item.id]
      // console.log(storeProducts.products[urlParams.graphicNovel][urlParams.volumeNum])
      // console.log(volumePromoData.value)

  watchEffect(() => {
    if (previewArray.value.length > 0 && currentIndex.value < previewArray.value.length) {
      currentImage.value = previewArray.value[currentIndex.value];
    } else {
      currentImage.value = previewArray.value[0] || null; // Fallback to the first image
    }
  });


}


const updateCurrentImage = (image, index) => {
  console.log(image)
  currentImage.value = image;
  currentIndex.value = index; // Update the current index
};


// console.log(storeProducts.products[urlParams.graphicNovel][urlParams.volumeNum])


// console.log(volumeParams);
// console.log(userStore.userSession.cart);
// let product = ref(null)


/* onBeforeMount( () => {
    storeProducts.getProducts()
}) */


/* const isInCart = computed(() => {
  if (
    !productInfosForCart.value ||
    !productInfosForCart.value.graphic_novel_uid
  ) {
    return false; /
  }

  console.log('productInfosForCart.value : ',productInfosForCart.value.graphic_novel_uid)
  console.log('userStore.userSession.cart : ', userStore.userSession.cart)
  return userStore.userSession.cart.some(prod => 
    productInfosForCart.value.graphic_novel_uid === prod.graphic_novel_uid &&
    productInfosForCart.value.volume_uid === prod.volume_uid &&
    productInfosForCart.value.product_uid === prod.product_uid
  );
  
}); */


const isInCart = computed(() => {
  for (const prod of userStore.userSession.cart) {
    if (
      productInfosForCart.value.graphic_novel_uid === prod.graphic_novel_uid &&
      productInfosForCart.value.volume_uid === prod.volume_uid &&
      productInfosForCart.value.product_uid === prod.product_uid
    ) {
      return true; // Product is in the cart
    }
  }
  return false; // Product is not in the cart
});


watchEffect(() => {
  console.log('Store Products:', storeProducts.products);
  console.log('Volume Promo Data:', volumePromoData.value);
  
  if (
    storeProducts.products[urlParams.graphicNovel] &&
    storeProducts.products[urlParams.graphicNovel][urlParams.volumeNum]
  ) {
    volumePromoData.value =
      storeProducts.products[urlParams.graphicNovel][urlParams.volumeNum][language.value]
  console.log(volumePromoData.value)
    productInfosForCart.value = {
        graphic_novel_name : volumePromoData.value.graphic_novel_title,
        graphic_novel_uid : volumePromoData.value.graphic_novel_uid,
        volume_uid : volumePromoData.value.volume_uid, 
        volume_name : volumePromoData.value.volume_name,
        volume_title : volumePromoData.value.volume_title,
        language: language.value,
        thumbnail: volumePromoData.value.thumbnail,
        price: volumePromoData.value.price,
        product_uid: volumePromoData.value.uid_product
    }  

    console.log('Updated Volume Promo Data:', volumePromoData.value);
    
    // previewArray = volumePromoData.value.preview
    previewArray.value = volumePromoData.value.preview || [];

    if (
      volumePromoData.value.cover &&
      !previewArray.value.includes(volumePromoData.value.cover)
    ) {
      previewArray.value.unshift(volumePromoData.value.cover);
    }

    currentImage.value = volumePromoData.value?.cover || null

    // userStore.isLoading = false

    console.log('Updated Product Infos for Cart:', productInfosForCart.value);


  } else {
    console.log('Data not loaded yet or invalid keys ');
    // storeProducts.getProducts().then(() => { 
  }
});

// currentImage.value = volumePromoData.cover

const priceComputed = computed(() => {
    if (productInfosForCart.value.price ) {
        return productInfosForCart.value.price / 100
    }
    return '0.00'
})

const addToCart = () => {
  console.log(productInfosForCart.value)
  console.log(userStore.userSession.cart)
  
  if (!isInCart.value) {
    userStore.userSession.cart.push(productInfosForCart.value);
    console.log('Product added to cart:', productInfosForCart.value);
  } else {
    console.log('Product is already in the cart');
  }
};


const buyPackages = () => {
  console.log('Buy Packages button clicked');
  // Add your logic for buying packages here
};


const goBack = () => {
  router.back();
};

</script>