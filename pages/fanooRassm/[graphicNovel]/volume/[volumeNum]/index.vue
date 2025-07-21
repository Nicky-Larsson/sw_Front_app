<template>
  <client-only>
    <div class="text-4xl text-white  text-center p-0">

        <div class="mt-4 max-w-[1000px] mx-auto px-0">
            <div class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="w-xl2 md:w-[35%]">
                  <img 
                    v-if="currentImage"
                    class="rounded-lg object-cover w-full h-[86%]" 
                    :src="currentImage"
                  >
                  <div class="flex items-center justify-center mt-0 p-2 gap-1">
                    <div v-for="(image, index) in previewArray" :key="index">
                      <img 
                        @mouseover="updateCurrentImage(image, index)"
                        class="rounded-md object-cover border-[3px] cursor-pointer w-[70px] h-[70px]"
                        :class="currentImage === image ? 'border-[#FF5353]' : ''"
                        :src="image"
                      >
                    </div>
                  </div>   
                </div>
             
                <div class="md:w-[60%] bg-white p-3 rounded-lg text-amber-950">
                    <div class="relative group" v-if="volumePromoData.volume_uid && volumePromoData.volume_num">
                        <p class="mb-2">{{ volumePromoData.product_uid.graphic_novel_uid }}</p>
                        <p class="mb-2 text-2xl">
                          {{ volumePromoData.volume_name || '-' }}
                        </p>
                        <p class="mb-2 text-xl">
                          {{ volumePromoData.volume_title || '-' }}
                        </p>
                        <p class="mb-2 text-xl">
                          Language: {{ volumePromoData.langage || 'Unknown' }}
                        </p>                
                        <!-- Description Text -->
                        <p 
                          class="font-light text-[22px] mb-2 h-[180px] overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                        >
                          {{ volumePromoData.description }}
                        </p>

                        <!-- Fade Effect -->
                        <div 
                          class="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 opacity-100 peer-scroll:opacity-0"
                        ></div>

                    </div>
                   
                    <div class="flex items-center justify-center gap-4 my-1">
                      <!-- Show the Read button when user has access -->
                      <NuxtLink
                        v-if="hasAccess"
                        :to="{
                          path: `/Flipbook/${route.params.graphicNovel}/volume/${route.params.volumeNum}`,
                          query: { lang: selectedLanguage }
                        }"
                        class="px-6 py-2 rounded-lg text-white text-lg font-semibold bg-green-600 flex items-center justify-center"
                      >
                        <Icon name="streamline:book-reading" size="120%" />
                        <span class="ml-2">Read</span>
                      </NuxtLink>

                      <!-- Existing Add to Cart button (only show if no access) -->
                      <button 
                        v-if="!hasAccess"
                        @click="addToCart()"
                        :disabled="isInCart"
                        class="px-6 py-2 rounded-lg text-white text-lg font-semibold bg-gradient-to-r from-[#FF851A] to-[#FFAC2C]"
                      >
                        <div v-if="isInCart">Is Added</div>
                        <div v-else>Add to Cart</div>
                      </button>

                      <div v-if="!hasAccess" class="text-xl font-bold">
                        {{ priceComputed }} €
                      </div>
                    </div>


                    <div class="overflow-hidden max-w-full text-center">
                      <span class="block items-center text-2xl mb-4">Choose your language</span>
                      <ul class="flex flex-wrap justify-center items-center gap-4">
                        <li 
                          v-for="lang in languages" 
                          :key="lang.id" 
                          @click="chooseLanguage(lang)" 
                          class="hover:bg-blue-200 cursor-pointer px-3 py-2 flex items-center"
                          :class="{ 'border-2 border-blue-500 rounded-md': selectedLanguage === lang.id }"
                        >
                          <img :src="lang.image" :alt="lang.alt" class="w-6 h-5 inline-block">
                          <span class="pl-2 text-xl">{{ lang.text }}</span>
                        </li>
                      </ul>
                    </div>

                    <!-- New Buy Packages Button -->
                    <div v-if="isInCart" class="pt-1">

                        <span class='items-center text-2xl  font-bold'> Total : Package of all translations +   0.99 €    = 3.99 €  3.98 €</span>
                    
                      <div class="flex items-center justify-center gap-4 my-1">
                        <button 
                          @click="buyPackages()"
                          class=" px-6  py-2  rounded-lg  text-white  text-lg  font-semibold  bg-gradient-to-r  from-[#1D4ED8]  to-[#3B82F6]"
                        >
                          Buy Packages  
                        </button>
                      
                        <div class="flex items-center justify-center gap-2 my-2">
                            <div class="text-xl font-bold"> 1 €</div>
                        </div>                     
                     
                      </div>

                    </div>
                      
                    <div class="pt-5" >
                      <button @click="goBack" class="bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold py-2 px-4 rounded">
                          Back to list
                      </button>
                    </div>
                </div>
            </div>
          
          <br>
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
import debounce from 'lodash/debounce';


const route = useRoute()
const router = useRouter()
const userStore = useStoreUser()
const storeProducts = useStoreProducts()

const urlParams = route.params

const previewArray = ref([]);
const currentImage = ref(0);
const currentIndex = ref(0);

const graphicNovelUid = route.params.graphicNovel
const volumePromoData = ref(null)


const language = computed({
  get: () => userStore.userSession.choosedLanguage,
  set: (value) => {
    userStore.userSession.choosedLanguage = value;
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


const languages = ref([
  { id: 'ar', image: '/flags/ar_flag.jpg', alt: 'Arabic',   text: 'Arabic' },
  { id: 'ma', image: '/flags/ma_flag.jpg', alt: 'Morrocan', text: 'Darija' },
  { id: 'en', image: '/flags/en_flag.jpg', alt: 'English',  text: 'English'},
  { id: 'fr', image: '/flags/fr_flag.jpg', alt: 'French',   text: 'French' },
])

const selectedLanguage = ref(userStore.userSession.choosedLanguage);

language.value = userStore.userSession.choosedLanguage

const chooseLanguage = (lang) => {

   selectedLanguage.value = lang.id; // Update the selected language
   language.value = lang.id  // Update the language in the store
   console.log('Selected language:', selectedLanguage.value);

  watchEffect(() => {
    if (previewArray.value.length > 0 && currentIndex.value < previewArray.value.length) {
      currentImage.value = previewArray.value[currentIndex.value];
    } else {
      currentImage.value = previewArray.value[0] || null; // Fallback to the first image
    }
  });
}


const readContent = () => {
  // Add any logic here that you need when the Read button is clicked
  console.log('Reading content for volume:', toRaw(productInfosForCart.value) );
  // If you need to navigate to a specific reading page, add that code here
  // For example:
  // router.push(`/read/${urlParams.graphicNovel}/${urlParams.volumeNum}`);
};


const updateCurrentImage = (image, index) => {
  console.log(image)
  currentImage.value = image;
  currentIndex.value = index; // Update the current index
};



const hasAccess = computed(() => {
  const accessRights = userStore.userSession.access_rights;
  const graphicNovelAccess = accessRights?.[urlParams.graphicNovel];
  const volumeAccess = graphicNovelAccess?.[urlParams.volumeNum];

  if (!volumeAccess) return false; // No access to this volume

  // Check if the selected language exists as a key in the access rights
  return selectedLanguage.value in volumeAccess;
});




onMounted(async () => {
  // Ensure access rights are loaded
  console.log(userStore.userSession.access_rights[urlParams.graphicNovel][urlParams.volumeNum])
  try {
    //if (!userStore.userSession.access_rights[urlParams.graphicNovel]) {
    await userStore.fetchNovelAccessRight(graphicNovelUid, true);
    //}
  } catch (err) {
    console.warn('Could not fetch access rights:', err);
  }

  console.log('Access Rights:', userStore.userSession.access_rights);

  const accessRights = userStore.userSession.access_rights;
  const graphicNovelAccess = accessRights?.[urlParams.graphicNovel];
  const volumeAccess = graphicNovelAccess?.[urlParams.volumeNum];

  if (volumeAccess) {
    const defaultLanguage = userStore.userSession.defaultLanguage;
    if (defaultLanguage in volumeAccess) {
      selectedLanguage.value = defaultLanguage;
      language.value = defaultLanguage; // Update the store
      console.log(`Automatically selected default language: ${defaultLanguage}`);
    } else {
      // Fallback to the first accessible language
      const accessibleLanguage = Object.keys(volumeAccess)[0];
      selectedLanguage.value = accessibleLanguage;
      language.value = accessibleLanguage; // Update the store
      console.log(`Automatically selected fallback language: ${accessibleLanguage}`);
    }
  }
});


const isInCart = computed(() => {
  return userStore.userSession.cart.some(
    (prod) =>
      productInfosForCart.value.graphic_novel_uid === prod.graphic_novel_uid &&
      productInfosForCart.value.volume_uid === prod.volume_uid 
      // &&
      // productInfosForCart.value.language === prod.language
  );
});

const priceComputed = computed(() => {
    if (productInfosForCart.value.price ) {
        return productInfosForCart.value.price / 100
    }
    return '0.00'
})


const debouncedSaveCart = debounce(function() {
  // Debug: Check for undefineds before saving
  if (userStore.userSession.cart.some(item => item === undefined)) {
    console.warn('Undefined detected in cart before save:', userStore.userSession.cart);
  }
  if (userStore.userSession.selectedArray.some(item => item === undefined)) {
    console.warn('Undefined detected in selectedArray before save:', userStore.userSession.selectedArray);
  }
  userStore.setCartInfoDb();
}, 2000);




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
        product_uid: volumePromoData.value.product_uid,
        new_in_cart : true
    }  

    console.log('Updated Volume Promo Data:', volumePromoData.value);
    
    previewArray.value = volumePromoData.value.preview || [];

    if (
      volumePromoData.value.cover &&
      !previewArray.value.includes(volumePromoData.value.cover)
    ) {
      previewArray.value.unshift(volumePromoData.value.cover);
    }

    currentImage.value = volumePromoData.value?.cover || null

    // userStore.isLoading = false



  } else {
    console.log('Data not loaded yet or invalid keys ');
    // storeProducts.getProducts().then(() => { 
  }
});


const addToCart = () => {
  const product = productInfosForCart.value;
  userStore.addToCart(product);
  debouncedSaveCart.call(this);
};


const buyPackages = () => {
  console.log('Buy Packages button clicked');
  // Add your logic for buying packages here
};


const goBack = () => {
  router.back();
};

watch(
  () => selectedLanguage.value,
  (newLanguage) => {
    console.log(`Language changed to: ${newLanguage}`);
    console.log(`Has Access: ${hasAccess.value}`);
  }
);


watch(
  () => userStore.userSession.cart,
  (newCart) => {
    if (newCart.some(item => item === undefined)) {
      console.warn('Watcher: Undefined detected in cart:', newCart);
    }
  },
  { deep: true }
);

watch(
  () => userStore.userSession.selectedArray,
  (newSelectedArray) => {
    if (newSelectedArray.some(item => item === undefined)) {
      console.warn('Watcher: Undefined detected in selectedArray:', newSelectedArray);
    }
  },
  { deep: true }
);


</script>