<template>
    <div class="fixed bottom-0 right-0 z-50 w-full h-18  md:h-13   bg-black border-t text-gray-400 
                border-gray-200  dark:border-gray-600 ">
        <div class="grid h-full max-w-5xl grid-cols-5  mx-auto font-medium">

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


import { ref } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['orderLeftMenu','orderRightMenu','orderCloseMenu'])

const clickLeftMenu = () => {
  emit('orderLeftMenu')
}

const clickCloseMenu = () => {
  emit('orderCloseMenu')
}

const clickRightMenu = () => {
  emit('orderRightMenu')
}


</script>

<style scoped>

</style>