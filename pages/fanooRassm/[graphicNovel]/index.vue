<template>
   <client-only>
    <div class="bg-amber-600 container mx-auto pt-2 md:w-[85%]">
      <div class="flex flex-col text-amber-50 p-0 text-4xl block">
         <!-- {{storeProducts.products[0].name}} -->

         <h1 v-if="storeProducts.products.length > 0" class="text-8xl "> </h1>
          <div class="mt-2 max-w-[1200px] mx-auto px-1 leading-tight">
            <div v-if="storeProducts.products[graphicNovelUid]" class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-y-15 gap-x-20">
              <div v-for="volume in novelVolumes" :key="volume.fr.product_uid.volume_uid" class="mb-2">
                <productList
                  :volume="volume.fr"
                  :hasAccess="checkAccess(volume.fr)"
                  :isInCart="isVolumeInCart(volume.fr)"
                  @add-to-cart="addToCart"
                />
              </div>
            </div>
          </div>
        
        <!-- {{storeProducts.products[graphicNovelUid]}} -->
        
        <br>
        <button class="flex items-center gap-2 p-0" @click="storeAdminProducts.addProducts()">
          <div class="flex justify-center items-center">
            <Icon name="ri:poker-hearts-line" size="150%" />
          </div>
          <span class="pl-2">add Products</span>
        </button>    

        <button class="flex items-center gap-2 p-0" @click="storeProducts.getProducts()">
        <div class="flex justify-center items-center">
            <Icon name="ri:account-box-2-fill" size="150%" />
        </div>
        <span class="pl-2">gets Products to add</span>
        </button>
       
      <br>
      <button class="flex items-center gap-2 p-0" @click="storeAdminProducts.addProductToSalesFirestore({
          importPath: '/products/tomes/tome_01.js',
          docPath: [
            'graphic_nov2',
            'sunset_land',
            'volumes',
            'volume_01',
            'product',
            'fr_version'
          ]
        })">
        <div class="flex justify-center items-center">
          <Icon name="ri:database-2-line" size="150%" />
        </div>
        <span class="pl-2">Add Product from tome.js</span>
      </button>


      <button class="flex items-center gap-2 p-0" @click="storeAdminProducts.addProductToSalesFirestore({
          importPath: '/products/chapters/chapter_01.js',
          docPath: [
            'graphic_nov2',
            'sunset_land',
            'free_content',
            'volumes',
            'volume_01_chapter_01',
            'fr_version'
          ]
        })">
        <div class="flex justify-center items-center">
          <Icon name="ri:database-2-line" size="150%" />
        </div>
        <span class="pl-2">Add free content from chapter.js</span>
      </button>


        <!-- {{storeProducts.products.sunset_land}} -->

       <div> 
            <h2 class="text-4xl">  Simo Warch App  </h2>
            <br>   
            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}`">
                Présentation Oeuvre
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/volume/${librarySet_1.volume_num}`">
                Tome
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/volume/${librarySet_1.volume_num}
                                                                   /chapter/${librarySet_1.chapter_num}`">
                Chapiter
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/artworks/arc/${librarySet_1.arc_name}
                                                                   /figurine/${librarySet_1.figurine_name}`">
                Figurine
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/${librarySet_1.grapicNovel}/artworks/arc/${librarySet_1.grapicNovel}
                                                                   /illustration/${librarySet_1.illustration_name}`">
                Illustration
            </NuxtLink>

            <NuxtLink :to="`/Fanoorassm/magazine/${librarySet_1.magazine_num}`">
                Magazine
            </NuxtLink>
        </div>


      </div>
    </div>
    </client-only>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreProducts } from '@/stores/storeProducts'
import { useStoreAdminProducts } from '@/stores/storeAdminProducts'
import { useStoreUser } from '@/stores/storeUser'
import { toRaw } from 'vue';


const route = useRoute()
const userStore = useStoreUser()
const storeProducts = useStoreProducts()
const storeAdminProducts = useStoreAdminProducts()


console.log('user session : ', userStore.userSession)

// Add this near your other reactive variables
const graphicNovelUid = ref(route.params.graphicNovel)
const accessMap = reactive({});

let debounceTimerSaveCart;
const debouncedSaveCart = () => {
  clearTimeout(debounceTimerSaveCart);
  debounceTimerSaveCart = setTimeout(() => {
    console.log('Debounced: Saving cart to DB...');
    userStore.setCartInfoDb(); // Ensure this Pinia action exists and correctly saves the cart
  }, 1500); // Adjust debounce time (e.g., 1.5 seconds)
};


const isVolumeInCart = (volume) => {
  for (const prod of userStore.userSession.cart) {
    if (
      volume.product_uid.graphic_novel_uid === prod.graphic_novel_uid &&
      volume.product_uid.volume_uid === prod.volume_uid 
      // && userStore.userSession.choosedLanguage === prod.language
    ) {
      return true;
    }
  }
  return false;
};


/* const addToCart = (product) => {
  if (
    !product ||
    !product.graphic_novel_uid ||
    !product.volume_uid ||
    !product.product_uid
  ) {
    console.warn('Attempted to add invalid product to cart:', product);
    return;
  }
  console.log('Adding product to cart:', product);
  // userStore.userSession.cart.push(product);
  // debouncedSaveCart();
}; */

const addToCart = (volumeData) => {
  // Validate the incoming volumeData
  if (
    !volumeData ||
    !volumeData.product_uid ||
    !volumeData.product_uid.graphic_novel_uid ||
    !volumeData.product_uid.volume_uid
  ) {
    console.warn('addToCart on list page: Invalid volumeData received:', volumeData);
    return;
  }

  const cartProduct = {
    graphic_novel_name: volumeData.graphic_novel_title || '',
    graphic_novel_uid: volumeData.product_uid.graphic_novel_uid,
    volume_uid: volumeData.product_uid.volume_uid,
    volume_name: volumeData.volume_name,
    volume_title: volumeData.volume_title || '',
    language: userStore.userSession.choosedLanguage,
    thumbnail: volumeData.thumbnail,
    price: volumeData.price,
    product_uid: volumeData.product_uid,
    new_in_cart: true
  };

  // Check if the product is already in the cart (including language for uniqueness)
  const existingCartItem = userStore.userSession.cart.find(
    item =>
      item.graphic_novel_uid === cartProduct.graphic_novel_uid &&
      item.volume_uid === cartProduct.volume_uid &&
      item.language === cartProduct.language // language is important for uniqueness!
  );

  if (existingCartItem) {
    console.log('Product is already in the cart (from list page):', cartProduct);
    // Optionally, handle quantity updates or other logic for existing items
  } else {
    userStore.userSession.cart.push(cartProduct);
    console.log('Product added to cart (from list page): ', cartProduct);
    debouncedSaveCart();
  }
};



const isProductInCart = (product) => {
  for (const prod of userStore.userSession.cart) {
    if (
      product.product_uid.graphic_novel_uid === prod.product_uid.graphic_novel_uid &&
      product.product_uid.volume_uid === prod.product_uid.volume_uid &&
      product.language === prod.language
    ) {
      return true;
    }
  }
  return false;
};



// console.log('storeProducts.products :  ')
// console.log(storeProducts.products)

// storeProducts.getProducts()

// Replace your checkAccess function with this
const checkAccess = (volume) => {
  const volumeUid = volume.product_uid.volume_uid;
  const graphicNovelUid = volume.product_uid.graphic_novel_uid;

  // Check access rights
  return userStore.userSession.access_rights?.[graphicNovelUid]?.[volumeUid] || false;
};

const novelVolumes = computed(() => {
  const products = storeProducts.products[graphicNovelUid.value];
  if (!products || typeof products !== 'object') {
    console.warn(`Invalid products for graphicNovelUid: ${graphicNovelUid.value}`, products);
    return [];
  }

  // Convert to array and sort by volume_uid
  return Object.values(products).sort((a, b) => {
    const uidA = a.fr.product_uid.volume_uid.toLowerCase();
    const uidB = b.fr.product_uid.volume_uid.toLowerCase();
    return uidA.localeCompare(uidB); // Sort alphabetically
  });
});









onMounted(async () => {
  await storeProducts.getProducts()
  
  
  console.log(`Checking access for novel: ${graphicNovelUid}`)
  // console.log(userStore.userSession)

  console.log("Data structure:", storeProducts.products)
  console.log("Looking for:", graphicNovelUid.value)
  console.log('storeProducts.products:', storeProducts.products[graphicNovelUid.value]);

  
  const now = Date.now();
  const lastUpdate = userStore.userSession.access_rights.lastUpdate || 0;
  const oneMinute =  60 * 1000;

  if (now - lastUpdate > oneMinute || !userStore.userSession.access_rights[graphicNovelUid.value]) {
    await userStore.fetchNovelAccessRight(graphicNovelUid.value, true);
  }


  const accessRights = await userStore.fetchNovelAccessRight(graphicNovelUid.value, true);
  console.log("Fetched access rights:", accessRights);



  // Check if the user is logged in
  if (!userStore.userSession.email || !userStore.userSession.alias) {
    console.log('for visitors Skipping access rights check.')
    return
  }
  // fetchAccessRights() 
  // const hasAccess = await userStore.hasAccessTo(graphicNovelUid, 'volume_05')
  

  // Third fix - use the dynamic graphicNovelUid.value instead of hardcoded "sunset_land"
  if (storeProducts.products[graphicNovelUid.value]) {

    const products = storeProducts.products[graphicNovelUid.value]
    const volumes = Object.values(products)

    for (const volume of volumes) {
      const volUid = volume.fr.product_uid.volume_uid;
      const hasAccess = await userStore.hasAccessTo(graphicNovelUid.value, volUid);
      console.log(`Access for volume ${volUid}: ${hasAccess}`);
      accessMap[volUid] = hasAccess;
    }
    console.log('accessMap:', accessMap)
  }


    console.log('accessRights : ', accessRights)
    console.log('has access : ', userStore.hasAccessTo(graphicNovelUid, 'volume_05'))
  
  // console.log('cart',toRaw(userStore.userSession.cart.product_uid));
  if (userStore.userSession.cart && userStore.userSession.cart.length > 0) 
  {
    console.log('userStore.userSession Cart : ', toRaw(userStore.userSession.cart[0].product_uid) )
  }

  // console.log(`User has access to ${graphicNovelUid}: ${hasAccess}`)
  
  // console.log('Products and access rights loaded')

})

// console.log("storeProducts", storeProducts.products.sunset_land);

const librarySet_1 = reactive({
                                    grapicNovel: "sunset_land",
                                    volume_num: 3,
                                    chapter_num: 4,
                                    figurine_name: "tbourida",
                                    arc_name: "Lghoula",
                                    illustration_name: "Entrer to Fes Jdid",
                                    magazine_num: 1
                                })




/* const graphicNovelStore = ref(
        chapters: [
                    {
                    id:144, 
                    volume_num: 1,
                    title: "volume 1",
                    description: "this is a description",
                    volume_thumbnail: "https://picsum.photos/200/300",
                    volume_cover: "https://picsum.photos/200/300",
                    chapters: [
                                { id:1, 
                                chapter_num: 1,
                                chapter_title: "volume 2",
                                description: "this is a description",
                                chapter_thumbnail: "https://picsum.photos/200/500",
                                chapter_cover: "https://picsum.photos/200/500",
                                chapter_preview: [ "https://", "https://", "https://" ]
                                },
                                {
                                id:2,
                                chapter_num: 2,
                                chapter_title: "volume 2",
                                description: "this is a description",
                                chapter_thumbnail: "https://picsum.photos/200/600",
                                chapter_cover: "https://picsum.photos/200/600",
                                chapter_preview: [ "https://", "https://", "https://" ] 
                                },
                                {
                                id:3,
                                chapter_num: 3,
                                chapter_title: "volume 2",
                                description: "this is a description",
                                chapter_thumbnail: "https://picsum.photos/200/270",
                                chapter_cover: "https://picsum.photos/200/700",
                                chapter_preview: [ "https://", "https://", "https://" ]
                                }
                             ]
                    }
                  ],
        artworks: [
                   { id:1145416, 
                     arcName: "ghoula",
                        figurines: [
                                { 
                                    id:1, 
                                    figurineName: "tbourida",
                                    description: "this is a description",
                                    figurine_thumbnail: "https://picsum.photos/200/270",
                                    figurine_cover: "https://picsum.photos/200/700"
                                },
                                { 
                                    id:2, 
                                    figurineName: "tbourida",
                                    description: "this is a description",
                                    figurine_thumbnail: "https://picsum.photos/300/370",
                                    figurine_cover: "https://picsum.photos/200/700"
                                },
                                { 
                                    id:3, 
                                    figurineName: "tbourida",
                                    description: "this is a description",
                                    figurine_thumbnail: "https://picsum.photos/400/470",
                                    figurine_cover: "https://picsum.photos/400/470"
                                }
                            ],
                        illustrations: [
                                { id:1,
                                    illustrationName: "bab merinide",
                                    description: "this is a description",
                                    illustration_thumbnail: "https://picsum.photos/400/470",
                                    illustration_cover: "https://picsum.photos/300/500"                                },
                                { id:2,
                                     illustrationName: "tbourida",
                                    description: "this is a description",
                                    illustration_thumbnail: "https://picsum.photos/400/470",
                                    illustration_cover: "https://picsum.photos/300/500"   
                                },
                                { id:3,
                                    illustrationName: "Entrer to Fes Jdid",
                                    description: "this is a description",
                                    illustration_thumbnail: "https://picsum.photos/400/470",
                                    illustration_cover: "https://picsum.photos/300/500"   
                                }
                            ]
                    }]
     }]
);

 */

const magazineStore = ref(
    {
      id:1,
      magazine_num: 1,
      magazineName: "AlMajala",
      articles: [
                    { id:1,
                    articleTitle: "title 1",
                    articleContent: "this is a description"
                    },
                    { id:2,
                    articleTitle: "title 2",
                    articleContent: "this is a description"
                    },
                    { id:3,
                    articleTitle: "title 3",
                    articleContent: "this is a description"
                    }
               ]
    }
);


const illustrations = ref();

 
</script>

<style lang="scss" scoped>

</style>