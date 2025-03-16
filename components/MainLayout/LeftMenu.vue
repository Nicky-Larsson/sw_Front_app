<template>
    <div>
      <transition name="slide-left">
        <div v-if="leftStarted" class="fixed inset-0 z-40 flex w-64  items-center justify-left">
          <div @click="toggleMenu" class="fixed inset-0 bg-red-300 opacity-50"></div>
          <div @click.stop class="bg-white pl-6 pt-4 w-65 h-[98%] rounded shadow-lg relative">
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-3 mr-4">X</button> -->
            <ul>
                
                <li class="flex">
                  <img src="/simowarch_logo.jpeg" alt="Logo Description" class="w-30 h-30 mr-4">
                  <nuxt-link  @click="toggleMenu" to="/authentication/signin" class="text-blue-500 hover:text-blue-700"></nuxt-link>
                </li>

                <!-- <li class="relative">
                    <button class="flex items-center gap-2 p-2"  @click="toggleVisibility">
                      <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5" />
                      <span> Darija</span>
                    </button>
                    <div class="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      <ul class="py-2"  v-if="isVisible">
                        <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                          <img src="/flags/ar_flag.jpg" alt="Arabic" class="w-6 h-5 inline-block" />
                          <span> Arabic</span>
                        </li>
                        <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                          <img src="/flags/fr_flag.jpg" alt="French" class="w-6 h-5 inline-block" />
                          <span> French</span>
                        </li>
                        <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                          <img src="/flags/en_flag.jpg" alt="English" class="w-6 h-5 inline-block" />
                          <span> English</span>
                        </li>
                      </ul>
                    </div>
                </li> -->

                  <!-- <button id="toggleButton" @click="toggleList">{{ selectedItem }}</button> -->
                <!-- <li class="text-2xl py-4">

                  <button class="flex items-center gap-2 p-0"  @click="toggleList">
                    <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5" />
                    <span> {{ selectedItem }}</span>
                  </button>
                  <ul ref="list" id="myList" :class="{'hidden': isHidden}" @click="selectItem">
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5 inline-block" />
                      <span> Darija</span>                      
                    </li>
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/ar_flag.jpg" alt="Arabic" class="w-6 h-5 inline-block" />
                      <span> Arabic</span>
                    </li>
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/fr_flag.jpg" alt="French" class="w-6 h-5 inline-block" />
                      <span> French</span>
                    </li>
                    <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/en_flag.jpg" alt="English" class="w-6 h-5 inline-block" />
                      <span> English</span>
                    </li>
                  </ul>
                  <li id="selectedItem"></li>
                </li> -->


                <li class="text-2xl py-4">
                  <!-- <button id="toggleButton" @click="toggleList">{{ selectedItem }}</button> -->
                  <div class="flex justify-normal  ">
                  <Icon name="ri:earth-line"  size="150%" />
                  <button class="flex items-center gap-2 pl-3"  @click="toggleList">
                    <img :src="selectedItem.image" alt="Darija" class="w-6 h-5 " />
                    <span> {{ selectedItem.text }}</span>
                  </button>
                  </div>
                  <ul ref="list" id="myList" :class="{'hidden': isHidden}" @click="selectItem">
                    <!-- <li class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img src="/flags/ma_flag.jpg" alt="Darija" class="w-6 h-5 inline-block" />
                      <span> Darija</span>                      
                    </li> -->
                    <li v-for="item in filteredItems" :key="item.id" @click="handleClick(item)"
                                               class="hover:bg-gray-100 cursor-pointer px-4 py-2">
                      <img :src="item.image" :alt="item.alt" class="w-6 h-5 inline-block">
                      <span class="pl-2"> {{ item.text }}</span>
                    </li>
                  </ul>
                </li>

                <li class="text-2xl py-4 inline-block">
                  <button class="flex items-center gap-2 p-0"  @click="toggleList">
                    <div class="flex justify-center items-center">
                    <Icon name="flowbite:book-open-outline"  size="150%" />
                    </div>
                    <span> bibliotheque</span>
                  </button>               
                </li>

                <li class="text-2xl py-4 inline-block">
                  <button class="flex items-center gap-2 p-0"  @click="toggleList">
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="guidance:gallery"  size="140%" />
                    </div>
                    <span> Gallery Expo</span>
                  </button>               
                </li>

                <li class="text-2xl py-4 inline-block">
                  <button class="flex items-center gap-2 p-0"  @click="toggleList">
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="material-symbols-light:install-mobile-outline"  size="150%" />
                    </div>
                    <span> Installer App</span>
                  </button>               
                </li>

                <li class="text-2xl py-4 inline-block">
                  <button class="flex items-center gap-2 p-0"  @click="toggleList">
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="guidance:gallery"  size="150%" />
                    </div>
                    <span> About Us</span>
                  </button>               
                </li>

                <li class="text-2xl py-4 inline-block">
                  <button class="flex items-center gap-2 p-0"  @click="toggleList">
                    <div class="flex justify-center items-center pt-1">
                      <Icon name="guidance:gallery"  size="150%" />
                    </div>
                    <span> Mentions Legales</span>
                  </button>               
                </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>    
</template>

<script setup>
import { ref, defineProps, onMounted  } from 'vue'

///////////////
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