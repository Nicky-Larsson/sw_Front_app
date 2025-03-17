<template>
    <div>
      <transition name="slide-right">

        <div v-if="rightStarted" class="fixed z-40  top-0 right-0 h-full w-64 bg-gray-800  flex flex-col justify-center items-center transition-transform duration-300 ease-in-out">
          <div @click="toggleMenu" class="fixed inset-0 bg-red-300 opacity-50"></div>
          <div @click.stop class="bg-gray-700 text-white pl-6 pt-4 w-65 h-[98%] rounded shadow-lg relative">
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-4 mr-4">X</button> -->
            <ul>


                
                <li class="text-4xl py-4 flex items-center ">
                  <nuxt-link class="flex items-center p-2  w-50 bg-blue-500 text-white rounded"
                          to="/authentication/signin" tag="button"  @click="toggleMenu">
                      <Icon name="material-symbols:person" class="scale-100 pl-10"  />
                      <span class="pl-5 pb-2"> Login</span> 
                  </nuxt-link>
                </li>              
  
                <li class="text-xl py-6 inline-block"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="ix:history-list"  size="150%" />
                    </div>
                    <span class="pl-2"> Historiques Achats </span>
                  </nuxt-link>               
                </li> 

                <li class="text-xl py-6 inline-block"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="ri:shopping-basket-2-line"  size="170%" />
                    </div>
                    <span class="pl-2"> Mon Panier </span>
                  </nuxt-link>               
                </li> 

                <li class="text-xl py-6 inline-block"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="material-symbols:featured-seasonal-and-gifts"  size="150%" />
                    </div>
                    <span class="pl-2"> Cadeaux </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-6"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="ri:poker-hearts-line"  size="150%" />
                    </div>
                    <span class="pl-2"> Favoris </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-6 inline-block"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="material-symbols:manage-accounts"  size="150%" />
                    </div>
                    <span class="pl-2">User Settings </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-6 inline-block"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="solar:help-linear"  size="150%" />
                    </div>
                    <span class="pl-2"> Aide </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl py-6 inline-block"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/">
                    <div class="flex justify-center items-center">
                    <Icon name="codicon:sign-out"  size="150%" />
                    </div>
                    <span class="pl-2"> Déconnection </span>
                  </nuxt-link>               
                </li>

            </ul>  
          </div>
        </div>
      </transition>



    </div>

    
        
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  rightStarted: Boolean
})

const emit = defineEmits(['update:rightStarted']);

const toggleMenu = () => {
  emit('update:rightStarted', !props.rightStarted);
}
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>