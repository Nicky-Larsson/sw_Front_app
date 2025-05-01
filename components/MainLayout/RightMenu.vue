<template>
    <div>
      <transition name="slide-right">

        <div v-if="rightStarted" class="fixed z-30  top-0 right-0  w-60
                                        bg-orange-500  justify-center  transition-transform duration-300 ease-in-out">
          <div @click="toggleMenu" class="fixed inset-0 bg-gray-700 opacity-40"></div>
          <div @click.stop class="bg-gray-800 text-gray-300 pl-3 pt-4 w-65 h-190 rounded shadow-lg relative">
            <!-- <button @click="toggleMenu" class="absolute top-0 right-0 mt-4 mr-4">X</button> -->
            <ul>

                 
                <li class="text-4xl pr-4 py-3 w-full flex justify-center items-center ">
                  <nuxt-link class="flex items-center p-2 w-50 bg-blue-500 hover:bg-blue-400 text-white rounded "
                          to="/authentication/signin" tag="button"  @click="toggleMenu">
                      <Icon name="material-symbols:person" class="scale-100 pl-10"  />
                      <span v-if="authStore.authInfo.email" class="pl-3 pb-0 text-2xl "> {{ userStore.userSession.alias }}  </span>
                      <span v-else class="pl-5 pb-2"> Login </span>

                  </nuxt-link>
                </li>

                <li class="text-xl pl-4 py-4 inline-block w-full hover:bg-gray-800 hover:text-blue-500"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/checkout/shoppingCart">
                    <div class="flex justify-center items-center">
                    <Icon name="mdi:cart-variant"  size="170%" />
                    </div>
                    <span class="pl-2"> Mon Panier </span>
                  </nuxt-link>               
                </li> <!-- ri:shopping-basket-2-line -->

                <li class="text-xl pl-4 py-4 inline-block w-full hover:bg-gray-800 hover:text-blue-500"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/user/buyingList">
                    <div class="flex justify-center items-center">
                    <Icon name="ix:history-list"  size="150%" />
                    </div>
                    <span class="pl-2"> Achats </span>
                  </nuxt-link>               
                </li> 

                <li class="text-xl pl-4 py-4 inline-block w-full hover:bg-gray-800 hover:text-blue-500"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/user/gift">
                    <div class="flex justify-center items-center">
                    <Icon name="material-symbols:featured-seasonal-and-gifts"  size="150%" />
                    </div>
                    <span class="pl-2"> Cadeaux </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl pl-4 py-4 w-full hover:bg-gray-800 hover:text-blue-500"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/user/favorites">
                    <div class="flex justify-center items-center">
                    <Icon name="ri:poker-hearts-line"  size="150%" />
                    </div>
                    <span class="pl-2"> Favoris </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl pl-4 py-4 w-full hover:bg-gray-800 hover:text-blue-500"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/user/accountSettings">
                    <div class="flex justify-center items-center">
                    <Icon name="material-symbols:manage-accounts"  size="150%" />
                    </div>
                    <span class="pl-2">User Settings </span>
                  </nuxt-link>               
                </li>

                <li class="text-xl pl-4 py-4 w-full hover:bg-gray-800 hover:text-blue-500"  @click="toggleMenu" >
                  <nuxt-link class="flex items-center gap-2 p-0"  tag="button"  to="/user/help">
                    <div class="flex justify-center items-center">
                    <Icon name="solar:help-linear"  size="150%" />
                    </div>
                    <span class="pl-2"> Aide </span>
                  </nuxt-link>               
                </li>


                <li class="text-xl pl-3 py-4 border-b-1 border-t-1 border-black-500 pt-1 hover:bg-gray-800 "  @click="toggleMenu">
                  <!-- <button id="toggleButton" @click="toggleList">{{ selectedItem }}</button> -->
                  <div class="w-full hover:text-blue-500 ">
                    <div class="flex items-center justify-left pt-1 w-full   hover:text-blue-500" @click="toggleList">
                      <Icon name="pepicons-print:paint-pallet"  size="200%"/> 
                      <span class="text pl-2"> Discover Fresco :</span>
                    </div>
                    <nuxt-link class="flex justify-start gap-5 pl-11 pt-2 hover:text-blue-500"  tag="button"  to="/socialNetwork">
                        <Icon name="bxl:instagram"  size="130%"/>
                        <Icon name="simple-icons:tiktok"  size="120%" />
                        <Icon name="entypo-social:facebook"  size="120%" />
                    </nuxt-link>                    
                  </div>
                </li>


                <li class="text-xl pl-4 py-4 w-full hover:bg-gray-800 hover:text-blue-500"  @click="logout" >
                  <nuxt-link class="flex items-center gap-2 p-0" v-if="authStore.authInfo.email"  
                              tag="button"  to="/authentication/disconnected">
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
import { ref} from 'vue'

import { useStoreAuth } from '@/stores/storeAuth'
import { useStoreUser } from '@/stores/storeUser';

const authStore = useStoreAuth()


const userStore = useStoreUser();


console.log(userStore.userSession)
// authStore.authInfo.email

const props = defineProps({
  rightStarted: Boolean
})



// Watch for changes in userSession
watch(
  () => userStore.userSession,
  (newSession) => {
    // console.log('userSession updated:', newSession);
  },
  { deep: true }
);


const emit = defineEmits(['update:rightStarted']);

const toggleMenu = () => {
  emit('update:rightStarted', !props.rightStarted);
}


const logout = async () => {
  try {
    await authStore.logoutUser();
    await userStore.setCartInfoDb();
    authStore.clearSession();    // <-- Add this line for immediate clearing
    userStore.clearSession();

    console.log("Logout successful, session cleared");
    toggleMenu();
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
};


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