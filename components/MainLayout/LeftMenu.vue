<template>
    <div>
      <transition name="slide-left">
        <div v-if="leftStarted" class="fixed inset-0 z-40 flex w-64  items-center justify-left">
          <div @click="toggleMenu" class="fixed inset-0 bg-gray-700 opacity-40 "></div>

          <div @click.stop class="bg-gray-800 text-gray-300  pl-2 pt-4 w-58 h-[100%] rounded shadow-lg relative" >
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-3 mr-4">X</button> -->
            <ul>
                
                <li class="flex justify-center items-center" @click="toggleMenu">
                  <nuxt-link   tag="button" to="/">
                  <img src="/simowarch_logo.jpeg" alt="Logo Description" class="w-30 h-30 mr-20" >
                  </nuxt-link>
                </li>
                <li class="p-1">  </li>

                
                <li class="text-xl py-5 inline-block w-full  hover:bg-gray-800 hover:text-blue-500  pl-2"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0 "  tag="button"  to="/">
                    <div class="flex justify-center items-center ">
                    <Icon name="flowbite:home-solid"  size="150%" />
                    </div>
                    <span class="pl-2 "> Accueil </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-5 border-b-1 border-t-1 border-black-500 pt-3 hover:bg-gray-800  pl-2">
                  <!-- <button id="toggleButton" @click="toggleList">{{ selectedItem }}</button> -->
                  <div class="w-full hover:text-blue-500 ">
                    <div class="flex w-full  hover:text-blue-500" @click="toggleList">
                      <Icon name="ri:earth-line"  size="150%" /> 
                      <span class="pb-2 pl-4 "> Language :</span>
                    </div>
                      
                    <nuxt-link class="flex items-center gap-2 pl-12 "  @click="toggleList">
                      <img :src="selectedItem.image" :alt="selectedItem.alt" class="w-6.5 h-5 " />
                      <span> {{ selectedItem.text }}</span>
                    </nuxt-link>
                  </div> 

                  <ul ref="list" id="myList" :class="{'hidden': isHidden}" @click="selectItem">
                    <!-- <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5 inline-block" />
                      <span> Darija</span>                      
                    </li> -->
                    <li v-for="item in filteredItems" :key="item.id" @click="handleClick(item)" 
                                               class="hover:bg-gray-800 cursor-pointer px-4 py-2 pl-15">
                      <img :src="item.image" :alt="item.alt" class="w-6.5 h-5 inline-block">
                      <span class="pl-2"> {{ item.text }}</span>
                    </li>
                  </ul>
                </li>


                <li class="text-xl py-4 inline-block w-full  hover:bg-gray-700 hover:text-blue-500  pl-2" @click="toggleMenu">
                  <nuxt-link class="flex items-center gap-2 p-0" tag="button" to="/Fanoorassm/3d-library"  >
                    <div class="flex justify-center items-center">
                    <Icon name="flowbite:book-open-outline"  size="155%" />
                    </div>
                    <span class="pl-2"> Bibliotheque</span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-3 inline-block pb-3 w-full  hover:bg-gray-700 hover:text-blue-500 pl-2" @click="toggleMenu">
                  <nuxt-link class="flex items-center gap-2 p-0" tag="button" to="/ArtGallery" >
                    <div class="flex justify-center items-center pt-1 ">
                      <Icon name="guidance:gallery"  size="140%" class="scale-120" />
                    </div>
                    <span class="pl-3"> Gallery Expo</span>
                  </nuxt-link>               
                </li>



                <li class="text-xl py-3 -mx-2 w-full  hover:bg-gray-700 hover:text-blue-500 pl-2" @click="toggleMenu">
                  <nuxt-link class="flex items-center gap-2 p-0" tag="button" to="/appPromo"  >
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="material-symbols-light:install-mobile-outline"  size="200%" class="text-red-700"  />
                    </div>
                    <span class="pl-2"> Try App</span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-3 w-full  hover:bg-gray-700 hover:text-blue-500 pl-2" @click="toggleMenu">
                  <nuxt-link class="flex items-center gap-2 p-0" tag="button" to="/aboutUs"  >
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="ix:about"  size="150%" />
                    </div>
                    <span class="pl-3"> About Us</span>
                  </nuxt-link>               
                </li>

                <li class="text-l py-3 w-full  hover:bg-gray-700 hover:text-blue-500 pl-2" @click="toggleMenu">
                  <nuxt-link class="flex items-center gap-2 p-0" tag="button" to="/TermsAndConditions" >
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="fluent:calendar-mention-16-regular"  size="200%" />
                    </div>
                    <span  class="max-w-[100px] pl-2">Terms and Conditions</span>
                    <!-- "Informations légales" ou "Conditions générales". -->
                  </nuxt-link>               
                </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>    
</template>

<script setup>
import { ref, defineProps, onMounted  } from 'vue'

/////////////// @click="toggleMenu"
const list = ref(null);

const isHidden = ref(true);

const items = ref([
  { id: 2, image: '/flags/ar_flag.jpg', alt: 'Arabic', text: 'Arabic' },
  { id: 1, image: '/flags/ma_flag.jpg', alt: 'Morrocan', text: 'Darija' },
  { id: 4, image: '/flags/en_flag.jpg', alt: 'English', text: 'English'},
  { id: 3, image: '/flags/fr_flag.jpg', alt: 'French', text: 'French' },
])


const selectedItem = ref({ image:items.value[3].image, text:items.value[3].text});

const filteredItems = computed(() => {
  return items.value.filter(item => item.text !== selectedItem.value.text);
});


const hideSelected = () => {
  console.log(items.value)
  console.log(selectedItem.value)
}

function handleClick(item) {
  // console.log('Clicked item:', item);
  selectedItem.value.image = item.image;
  selectedItem.value.text = item.text;
  hideSelected()
  // isHidden.value = !isHidden.value;
}

const toggleList = () => {
  // hideSelected()
  // console.log(list);
  //const list = document.getElementById('myList')
  //list.classList.toggle('hidden')
  isHidden.value = !isHidden.value;
}

const selectItem = (event) => {
  // selectedItem.value = event.target.textContent
  isHidden.value = !isHidden.value;
}


///////////////
const props = defineProps({
  leftStarted: Boolean
})

const emit = defineEmits(['update:leftStarted']);

const toggleMenu = () => {
  emit('update:leftStarted', !props.leftStarted);
  isHidden.value = true;

}


</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>