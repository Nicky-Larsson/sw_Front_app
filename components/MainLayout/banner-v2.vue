<template>
    
    <section
      class="bg-blue-700 h-20 "
    >
      <nav class="hidden flex  mx-auto relative md:flex items-center justify-center">
        <div class=" md:left-0 md:inline md:absolute">
          <a href="#accueil">
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
              href="#accueil"
              class=" font-medium text-lg text-black-500 hover:text-gray-900"
              >Accueil</a
            >
          </li>

          <li>
            <a
              href="#services"
              class="font-medium text-lg text-black-500 hover:text-gray-900"
              >Services</a
            >
          </li>

          <li>
            <a
              href="#tarifs"
              class="font-medium text-lg text-black-500 hover:text-gray-900"
              >Nos tarifs</a
            >
          </li>

          <li>
            <a
              href="#contact"
              class="font-medium text-lg text-black-500 hover:text-gray-900"
              >Contact</a
            >
          </li>
        </ul>
        
        <button
          href="#"
          class=" mr-6 mt-6  shadow-md px-8 py-2 border font-medium rounded-md 
                 text-indigo-600 bg-white hover:bg-gray-50 md:block md:absolute md:right-0"
        >
          Log in
        </button>
      </nav>
 
      <!-- Navigation mobile -->
      <nav class="absolute top-2 w-12/12 left-1/2 transform -translate-x-1/2 shadow-md ring-1 ring-black ring-opacity-5  md:hidden rounded-lg bg-white">
      
          <div class="bg-black  p-1 h-22 flex items-center justify-between">

              <a href="#accueil">
                <img src="/simowarch_logo.jpeg" alt="logo fusée" class="h-22 w-auto  object-contain">
              </a>

              <led-pannel/>

              <div class="mr-2 object-contain">
                <button class="icone-toggle bg-orange-900 rounded-md p-2 w-auto pb-3 h-16 sm:h-17  inline-flex items-center justify-center ring-1 ring-black ring-opacity-20 ">
                  <img src="/menu.svg" alt="icône de menu" class="h-15 w-15 object-contain">
                </button>
              </div>

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