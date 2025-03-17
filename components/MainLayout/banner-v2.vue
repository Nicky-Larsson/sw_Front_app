<template>
    
    <section
      class="bg-blue-700 h-20 "
    >
      <nav class="hidden flex  mx-auto relative md:flex items-center justify-center">
        <div class=" md:left-0 md:inline md:absolute">
          <a href="/">
            <img
              class="pl-4 pt-8 pb-2 w-auto h-26"
              src="/simowarch_logo.jpeg"
              alt=""
            />
          </a>
        </div>

        <ul class="text-white md:flex md:space-x-25 md:pt-6 ">
          <li>
            <a
              href="/"
              class=" font-medium text-lg text-black-500 hover:text-gray-900"
              >Accueil</a
            >
          </li>

          <li>
            <a
              href="/s"
              class="font-medium text-lg text-black-500 hover:text-gray-900"
              >Services</a
            >
          </li>

          <li>
            <a
              href="/"
              class="font-medium text-lg text-black-500 hover:text-gray-900"
              >Nos tarifs</a
            >
          </li>

          <li>
            <a
              href="/"
              class="font-medium text-lg text-black-500 hover:text-gray-900"
              >Contact</a
            >
          </li>
        </ul>
        
        <nuxt-link class="flex items-center gap-2 p-0 text-white mr-6 mt-6  shadow-md px-6 py-2
                  rounded-md  hover:bg-blue-900 md:block md:absolute md:right-0"  
                    tag="button"  to="/checkout/shoppingCart">
          <div class="flex justify-center items-center pb-2">
            <Icon name="ri:shopping-basket-2-line"  size="300%" />
            <span class="pl-5 pt-3 text-2xl">  Panier </span>
          </div>
        </nuxt-link> 

      </nav>
 
      <!-- Navigation mobile -->
      <nav class="absolute top-0 w-12/12 left-1/2 transform -translate-x-1/2 shadow-md ring-1 ring-black ring-opacity-5  md:hidden rounded-lg bg-white">
      
          <div class="bg-black  p-1 h-22 flex items-center justify-between">

              <a href="/">
                <img src="/simowarch_logo.jpeg" alt="logo fusée" class="h-22 w-auto  object-contain">
              </a>

              <led-pannel/>

              <div class="mr-0 object-contain pt-2" >
                <nuxt-link class="icone-toggle bg-gray-900 rounded-md p-1 h-15 sm:h-17  inline-flex items-center justify-center 
                               text-white  " tag="button"  to="/checkout/shoppingCart">
                    <Icon name="clarity:shopping-cart-line"  size="380%" />
                </nuxt-link>
              </div>
             <!--  iconoir:cart-alt    solar:cart-5-linear  mage:basket -->

          </div>

          <ul class="toggle-menu hidden p-20">

            <li>
              <a href="#accueil" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Accueil
              </a>
            </li>

            <li>
              <a href="#services" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Services
              </a>
            </li>

            <li>
              <a href="#tarifs" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Nos tarifs
              </a>
            </li>

            <li>
              <a href="#contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Contact
              </a>
            </li>

          </ul>
      
      </nav>

    </section>

</template>

<script setup>
import { ref, onMounted } from 'vue';

const menuResponsive = ref(null);
const iconeToggle = ref(null);

onMounted(() => {
  menuResponsive.value = document.querySelector('.toggle-menu');
  iconeToggle.value = document.querySelector('.icone-toggle');
  iconeToggle.value.addEventListener('click', () => {
    menuResponsive.value.classList.toggle('hidden');
  });
});
</script>