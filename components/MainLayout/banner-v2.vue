<template>
    
    <section
      class="bg-blue-800 h-15 "
    >
      <nav class="hidden flex  mx-auto relative md:flex items-center justify-center">
        <div class=" md:left-0 md:inline md:absolute">
          <a href="/">
            <img
              class="pl-4 pt-7 pb-2 w-auto h-24"
              src="/simowarch_logo.jpeg"
              alt=""
            />
          </a>
        </div>

        <ul class="text-white md:flex md:space-x-25 md:pt-3 ">
          <li  >
            <div class="flex items-center   text-white shadow-md rounded-md  
                           hover:text-yellow-400">
              <nuxt-link tag="button" @click="clickLeftMenu" class="font-medium text-lg text-black-500 hover:text-orange-300">
                  Menu
              </nuxt-link>
            </div>
          </li>

          <li>
            <div class="flex items-center   text-white shadow-md rounded-md  
                           hover:text-yellow-400">
              <nuxt-link tag="button" to="/" class="font-medium text-lg text-black-500 hover:text-orange-300">
                  Accueil
              </nuxt-link>
            </div>
          </li>

          <li>
            <a
              href="/Fanoorassm/3d-library"
              class="font-medium text-lg text-black-500 hover:text-orange-300"
              >Bibliotheque</a
            >
          </li>

          <li>
            <a
              href="/ArtGallery"
              class="font-medium text-lg text-black-500 hover:text-orange-300"
              >Gallery 3D</a
            >
          </li>

          <li @click="clickRightMenu">
            <div class="flex items-center   text-white shadow-md rounded-md  
                           hover:text-yellow-400">
              <nuxt-link tag="button"  class="font-medium text-lg text-black-500 hover:text-orange-300">
                  identifiez vous
              </nuxt-link>
            </div>
          </li>
        </ul>


        
        <nuxt-link class="flex items-center gap-2 p-0 text-white mr-6 mt-6  shadow-md px-4 py-2
                  rounded-md  hover:bg-blue-900 md:block md:absolute md:right-0 hover:text-yellow-400"  
                    tag="button"  to="/checkout/shoppingCart">
          <div class="flex justify-center items-center pb-3">
            <Icon name="ri:shopping-basket-2-line"  size="300%" />
            <span class="pl-5 pt-3 text-2xl">  Panier </span>
          </div>
        </nuxt-link> 

      </nav>
 
      <!-- Navigation mobile -->
      <nav class="absolute top-0 w-12/12 left-1/2 transform -translate-x-1/2 shadow-md ring-1 ring-black ring-opacity-5  lg:hidden rounded-lg bg-red-600">
      
          <div class="bg-black  p-1 h-22 flex items-center justify-between">

              <a href="/">
                 <img src="/simowarch_logo.jpeg" alt="logo fusée" class="h-22 w-auto  object-contain">
              </a>

              <led-pannel/>

              <div class="mr-0 object-contain pt-2" >
                  <nuxt-link class="bg-gray-900 rounded-md p-0 h-15 sm:h-18  inline-flex items-center justify-center 
                                text-white  " tag="button"  to="/checkout/shoppingCart">
                      <Icon name="mdi:cart-variant"  size="380%" />
                  </nuxt-link>
              </div>
             <!--  iconoir:cart-alt    solar:cart-5-linear  mage:basket -->

          </div>


      
      </nav>

    </section>

</template>

<script setup>

import { ref } from 'vue'

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