<template>

  <div class="bg-orange-950">
    
    <banner-v2/>



<!-- 
    <nuxt-link to="/"> Home </nuxt-link>

    
    <nuxt-link to="/ArtGallery"> Art Gallery </nuxt-link>
    <nuxt-link to="/Fanossoura"> Your Library </nuxt-link>


    
    
    <nuxt-link to="/TermsAndConditions"> Terms And Conditions </nuxt-link>
    <nuxt-link to="/loadingPage"> Loading Page </nuxt-link>
    <nuxt-link to="/aboutUs"> About Us </nuxt-link>
    
    
    <nuxt-link to="/checkout/shoppingCart"> Shopping Cart </nuxt-link>
    <nuxt-link to="/checkout/paymentMethod"> Payment </nuxt-link>
    <nuxt-link to="/checkout/PurchaseSuccess"> Purchase Success </nuxt-link>
    
    
    <nuxt-link to="/authentication/clientconfig"> Account </nuxt-link>
    <nuxt-link to="/authentication/signin"> Sign In </nuxt-link>
    <nuxt-link to="/authentication/signup"> Sign Up </nuxt-link>
    <nuxt-link to="/authentication/mailConfirm"> Mail Confirm  </nuxt-link>
 
 -->
    <slot/>


    <bottomNav2 @orderLeftMenu="triggerLeftMenu" 
                @orderRightMenu="triggerRightMenu"
                @orderCloseMenu="triggerCloseMenu"/>
    
    <LeftMenu :leftStarted="leftStarted" 
              @update:leftStarted="triggerLeftMenu"/>

    <RightMenu :rightStarted="rightStarted"
              @update:rightStarted="triggerRightMenu"/>
    <br><br><br>
  </div>
</template>


<script setup>
import { ref } from 'vue'

const leftStarted = ref(false)
const rightStarted = ref(false)

const triggerLeftMenu = () => {
  leftStarted.value = !leftStarted.value;
  rightStarted.value = false
  console.log(leftStarted.value);
}

const triggerRightMenu = () => {
  rightStarted.value = !rightStarted.value;
  leftStarted.value = false
  console.log(rightStarted.value);
}

const triggerCloseMenu = () => {
  rightStarted.value = false;
  leftStarted.value = false
}


/* import { onMounted } from 'vue'
import { useFlowbite } from '~/composables/useFlowbite';

onMounted(() => {
  useFlowbite(() => {
    initFlowbite();
  })
}) */

//    <!-- <nuxt-link to="/users/[oeuvre]/tomes/2/liens"> liens </nuxt-link>
//    <nuxt-link to="/promo/[oeuvre]/tomes/1"> promo </nuxt-link> -->

</script>


<style scoped>
  a {
    margin-right: 10px;
  }
  a:hover {
    text-decoration: underline;
  }
  .active {
    color: red;
  }
  .active:hover {
    color: red;
  }
  .active:visited {
    color: red;
  }
  .active:active {
    color: red;
  }
  .active:focus {
    color: red;
  }
  .active:link {
    color: red;
  }
  .active:after {
    color: red;
  }
  .active:before {
    color: red;
  }
  .active:lang {
    color: red;
  }
  .active:visited {
    color: red;
  }
  .active:visited:hover {
    color: red;
  }
  .active:visited:active {
    color: red;
  }
  .active:visited:focus {
    color: red;
  }
  .active:visited:link {
    color: red;
  }
  .active:visited:after {
    color: red;
  }
  .active:visited:before {
    color: red;
  }
  .active:visited:lang {
    color: red;
  }
  .active:visited {
    color: red;
  }
  .active:visited:hover {
    color: red;
  }
  .active:visited:active {
    color: red;
  }
  .active:visited:focus {
    color: red;
  }
  .active:visited:link {
    color: red;
  }
  .active:visited:after {
    color: red;
  }
  .active:visited:before {
    color: red;
  }
  .active:visited:lang {
    color: red;
  }
  .active:visited {
    color: red;
  }
  .active:visited:hover {
    color: red;
  }
  .active:visited:active {
    color: red;
  }
  .active:visited:focus {
    color: red;
  }
  .active:visited:link {
    color: red;
  }
  .active:visited:after {
    color: red;
  }
  .active:visited:before {
    color: red;
  }
  .active:visited:lang {
    color: red;
  }
  .active:visited {
    color: red;
  }
 .active:visited:hover {
    color: red;
  }
  .active:visited:active {
    color: red;
  }
  .active:visited:focus {
    color: red;
  }
  .active:visited:link {
    color: red;
  } 
  .active:hover {
    color: red;
  }

</style>