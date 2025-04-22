<template>
    <div class="fixed bottom-0 right-0 z-50 w-full h-18  md:h-13   bg-black border-t text-gray-400 
                border-gray-200  dark:border-gray-600 ">
            <div :class="gridClass" class="h-full max-w-5xl mx-auto font-medium grid">

        <!-- Go Forward Button -->
            <!-- <button
                v-if="isWideScreen"
                @click.prevent="goForward"
                type="button"
                class="inline-flex flex-col items-center justify-center border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600"
            >
                <div class="flex justify-center items-center pt-1 dark:group-hover:text-blue-500">
                <Icon name="flowbite:redo-outline" size="200%" />
                </div>
                <span class="text-l text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 md:invisible">
                Avancer
                </span>
            </button> -->


            <button @click="clickLeftMenu" type="button" class="inline-flex flex-col items-center justify-center  border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600">
                <nuxt-link  class="mx-auto">
                    <div class="flex justify-center items-center dark:group-hover:text-blue-500">
                    <Icon name= "uil:align-justify"  size="200%" />
                    </div>
                    <span class="text-l text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 md:invisible">Menu</span>
                </nuxt-link>
            </button>



            <button @click="clickCloseMenu" type="button" class="inline-flex flex-col items-center justify-center  border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600">
            <nuxt-link to="/" class="w-full">
                <!-- <HomeIcon class="w-10 h-10 mx-auto fill-gray-500  " /> -->
                    <div class="flex justify-center items-center dark:group-hover:text-blue-500">
                    <Icon name= "flowbite:home-solid"  size="200%" />
                    </div>
                <span class="text-l text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 md:invisible">Accueil</span>
            </nuxt-link>
            </button>



            
            <button @click="clickCloseMenu" type="button" class="inline-flex flex-col items-center justify-center  border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600">
            <nuxt-link  to="/Fanoorassm/3d-library" class="w-full">
                <div class="flex justify-center items-center pt-1 dark:group-hover:text-blue-500">
                <Icon name="flowbite:book-open-outline"  size="200%" />
                </div>
                <span class="text-l text-gray-500 dark:text-gray-400 dark:group-hover:text-blue-500 md:invisible">
                    Librairie
                </span>
            </nuxt-link>
            </button>



            <button @click="clickCloseMenu" type="button" class="inline-flex flex-col items-center justify-center  border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600">
            <nuxt-link to="/ArtGallery" class="w-full">
                <div class="flex justify-center items-center pt-1 dark:group-hover:text-blue-500">
                <Icon name="streamline:travel-places-painting-painting-entertainment-display-museum-event-hobby-exhibit"  size="200%" />
                </div>
                <span class="text-l text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 md:invisible">Gallerie</span>
            </nuxt-link>
            </button>




            <button @click="clickRightMenu" type="button" class="inline-flex flex-col items-center justify-center  border-gray-200 border-x hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600">
            <nuxt-link  class="mx-auto">
                <div class="flex justify-center items-center pt-1 dark:group-hover:text-blue-500">
                <Icon name="flowbite:user-circle-outline"  size="200%" />
                </div>

                <span class="text-l text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 md:invisible">Compte</span>
            </nuxt-link>
            </button>

            <button
            v-if="isWideScreen"
            @click.prevent="goBack"
            type="button"
            class="absolute right-0 bottom-0 mb-1 mr-6 p-3 rounded-full bg-gray-700 text-white hover:bg-gray-500 shadow-lg flex justify-center items-center"
            >
            <Icon name="flowbite:redo-outline" size="160%" />
            </button>

        </div>
    </div>



</template>

<script setup>

// import { HomeIcon }  from "@vue-hero-icons/outline"

// , PhotographIcon, BookOpenIcon ,  UserCircleIcon, UserIcon

// TranslateIcon SupportIcon ShoppingCartIcon  InformationCircleIcon   GlobeAltIcon GiftIcon FlagIcon DownloadIcon
// DeviceMobileIcon CreditCardIcon  CogIcon ClipboardListIcon  BookmarkIcon AdjustmentsIcon 

// import { ArrowCircleDownIcon } from "@vue-hero-icons/outline"    CogIcon  DeviceMobileIcon  FlagIcon GiftIcon GlobeIcon
// InformationCircleIcon  LogoutIcon PhotographIcon  PhotographIcon, ViewListIcon 

// npm i -D @iconify-json/guidance
//  uil

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { useStoreAuth } from '@/stores/storeAuth'
import { useStoreUser } from '@/stores/storeUser';

const authStore = useStoreAuth()
const userStore = useStoreUser();



const emit = defineEmits(['orderLeftMenu', 'orderCloseMenu', 'orderRightMenu']);

const router = useRouter();
const isWideScreen = ref(false); // Default to false
const gridClass = computed(() => (isWideScreen.value ? 'grid-cols-5' : 'grid-cols-5')); // Adjust grid columns



const updateScreenWidth = () => {
  if (process.client) {
    isWideScreen.value = window.innerWidth >= 1108; // Update screen width condition
  }
};

onMounted(() => {
  if (process.client) {
    isWideScreen.value = window.innerWidth >= 768; // Initialize screen width on mount
    window.addEventListener('resize', updateScreenWidth); // Listen for screen resize
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', updateScreenWidth); // Clean up event listener
  }
});

const goBack = () => {
    console.log('Go back');
  if (window.history.length > 1) {
    router.back(); // Go back to the previous page
  } else {
    router.push('/'); // If no history, redirect to the home page
  }
  clickCloseMenu()
};

const goForward = () => {
  if (window.history.length > 1) {
    window.history.forward(); // Go forward in the browser history
  } else {
    console.log('No forward history available');
  }
  clickCloseMenu()
};



const clickLeftMenu = () => {
  emit('orderLeftMenu')
}

const clickCloseMenu = () => {
  emit('orderCloseMenu')
}

const clickRightMenu = () => {
  emit('orderRightMenu')

  // Validate userSession only once
  /* if (!userStore.userSession || !userStore.userSession.alias) {
    if (!userStore.userSession._cleared) { // Check if the session has already been cleared
      console.warn('Invalid user session detected. Clearing session and redirecting to login.');
      userStore.clearSession(); // Clear the session
      authStore.clearSession(); // Clear auth info if needed
      userStore.userSession._cleared = true; // Mark the session as cleared
    }
      console.log('userStore', userStore.userSession.alias)
      console.log('authStore', authStore.authInfo.email)
    return;
  } */

  console.log('userStore', userStore.userSession.alias)
  console.log('authStore', authStore.authInfo.email)
}


</script>

<style scoped>

</style>