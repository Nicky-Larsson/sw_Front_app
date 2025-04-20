<template>
    <client-only>
        <div id="ShoppingCartPage" class="mt-4 max-w-[1200px] mx-auto px-2">
            <div v-if="!userStore.userSession.cart.length" class="h-[500px] flex items-center justify-center">
                <div class="pt-20">
                    <img 
                        class="mx-auto"
                        width="250"
                        src="/payment/cart-empty.png"
                    >

                    <div class="text-xl text-center mt-4">No items yet?</div>

                    <!-- <div v-if="!user" class="flex text-center">
                        <NuxtLink 
                            to=""
                            class="
                                bg-[#FD374F] 
                                w-full 
                                text-white 
                                text-[21px] 
                                font-semibold 
                                p-1.5 
                                rounded-full
                                mt-4
                            "
                        >
                            Sign in
                        </NuxtLink>
                    </div> -->
                </div>
            </div>

            <div v-else class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="md:w-[65%]">
                    <div class="bg-white rounded-lg p-4">
                        <div class="text-2xl font-bold mb-2">
                            Shopping Cart ({{ userStore.userSession.cart.length }})
                        </div>
                    </div>
                    
                    <div id="Items" class="bg-white rounded-lg p-4 mt-4">
                        <div v-for="product in userStore.userSession.cart" :key="getProductKey(product)">
                            <CartItem
                            :product="product"
                            :isSelected="isItemSelected(product)"
                            @selectedRadio="selectedRadioFunc"
                            @remove="removeFromCart"
                            />
                        </div>
                    </div>
                    <!-- :isSelected="isItemSelected(product)"
                    :selectedArray="selectedArray"  :key="product.product_uid">-->

                    <div class="text-white"> userStore.userSession.checkout {{userStore.userSession.checkout}} </div>

                     <br>
                     <br>
                     <div class="text-white">userStore.userSession.cart :  {{userStore.userSession.cart}} </div>
                    <br>

                    <div class="text-white">userStore.userSession.selectedArray : {{userStore.userSession.selectedArray}} </div>   

                </div>

                <div class="md:hidden block my-4"/>
                <div class="md:w-[35%]">
                    <div id="Summary" class="bg-white rounded-lg p-4">
                        <div class="text-2xl font-extrabold mb-2">Summary</div>
                        <div class="flex items-center justify-between my-4">
                            <div class="font-semibold">Total</div>
                            <div class="text-2xl font-semibold">
                               <span class="font-extrabold">{{ totalPriceComputed }}  €</span>
                            </div>
                        </div>
                        <button 
                            @click="goToCheckout"
                            class="
                                flex
                                items-center
                                justify-center
                                bg-[#FD374F] 
                                w-full 
                                text-white 
                                text-[21px] 
                                font-semibold 
                                p-1.5 
                                rounded-full
                                mt-4
                            "
                        >
                            Checkout
                        </button>
                    </div>

                    <div id="PaymentProtection" class="bg-white rounded-lg p-4 mt-4">

                        <div class="text-lg font-semibold mb-2">Payment methods</div>
                        <div class="flex items-center justify-start gap-8 my-4">
                            <div v-for="(card, index) in cards" :key="index">
                                <img class="h-6" :src="card">
                            </div>
                        </div>

                        <div class="border-b"/>

                        <div class="text-lg font-semibold mb-2 mt-2">Buyer Protection</div>
                        <p class="my-2">
                            Get full refund if  the item is not as described or if is not delivered
                        </p>

                    </div>
                </div>
            </div>
        </div>
    </client-only>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStoreUser } from '@/stores/storeUser';
import { navigateTo } from '#app';

const userStore = useStoreUser();


// const selectedArray = ref(userStore.userSession.selectedArray || []);
// const selectedArray = ref([...userStore.userSession.cart]);

// Ensure userStore.userSession.selectedArray is initialized
onMounted(() => {
  if (!userStore.userSession.selectedArray || userStore.userSession.selectedArray.length === 0) {
    userStore.userSession.selectedArray = [...userStore.userSession.cart];
  }
});

// Function to synchronize selectedArray with the cart
const syncSelectedArray = () => {
  userStore.userSession.cart.forEach((product) => {
    console.log(product)
    const isAlreadySelected = userStore.userSession.selectedArray.some(
      (selected) =>
        selected.graphic_novel_uid === product.graphic_novel_uid &&
        selected.volume_uid === product.volume_uid &&
        selected.volume_name === product.volume_name &&
        selected.product_uid === product.product_uid
    );

    if (!isAlreadySelected) {
      userStore.userSession.selectedArray.push(product); // Add new product to selectedArray
    }
  });
};

// syncSelectedArray()
// Call `syncSelectedArray` whenever the cart changes
/* watch(
  () => userStore.userSession.cart,
  (newCart) => {
    console.log('Cart changed:', newCart);
    syncSelectedArray();
  },
  { deep: true }
); */


// Function to remove an item from the cart and update selectedArray
const removeFromCart = (item) => {
  userStore.userSession.cart = userStore.userSession.cart.filter(
    (prod) =>
      prod.graphic_novel_uid !== item.graphic_novel_uid ||
      prod.volume_uid !== item.volume_uid ||
      prod.volume_name !== item.volume_name ||
      prod.product_uid !== item.product_uid
  );

  userStore.userSession.selectedArray = userStore.userSession.selectedArray.filter(
    (selected) =>
      selected.graphic_novel_uid !== item.graphic_novel_uid ||
      selected.volume_uid !== item.volume_uid ||
      selected.volume_name !== item.volume_name ||
      selected.product_uid !== item.product_uid
  );
};


const getProductKey = (product) => {
  return `${product.graphic_novel_uid}-${product.volume_uid}-${product.volume_name}-${product.product_uid}`;
};

const cards = ref([
  '/payment/visa.png',
  '/payment/mastercard.png',
  '/payment/paypal.png',
  '/payment/applepay.png',
]);


/* const totalPriceComputed = computed(() => {
  let price = 0;
  selectedArray.value.forEach((prod) => {
    price += parseFloat(prod.price) || 0; // Ensure price is valid
  });
  return (price / 100).toFixed(2); // Return the total price as a fixed decimal string
}); */


// Compute the total price dynamically based on selectedArray
const totalPriceComputed = computed(() => {
  return userStore.userSession.selectedArray.reduce((total, prod) => {
    return total + (parseFloat(prod.price) || 0); // Ensure price is valid
  }, 0) / 100; // Return the total price as a fixed decimal
});

// Check if an item is selected
const isItemSelected = (item) => {
  return userStore.userSession.selectedArray.some(
    (selected) =>
      selected.graphic_novel_uid === item.graphic_novel_uid &&
      selected.volume_uid === item.volume_uid &&
      selected.volume_name === item.volume_name &&
      selected.product_uid === item.product_uid
  );
};

// Function to toggle selection of items
const selectedRadioFunc = (item) => {
  const index = userStore.userSession.selectedArray.findIndex(
    (selected) =>
      selected.graphic_novel_uid === item.graphic_novel_uid &&
      selected.volume_uid === item.volume_uid &&
      selected.volume_name === item.volume_name &&
      selected.product_uid === item.product_uid
  )

  if (index === -1) {
    // If the item is not in the selectedArray, add it
    userStore.userSession.selectedArray.push(item);
  } else {
    // If the item is already in the selectedArray, remove it
    userStore.userSession.selectedArray.splice(index, 1);
  }
};

// Function to proceed to checkout
const goToCheckout = () => {

  // Filter selectedArray to only include items that are still in the cart
  userStore.userSession.selectedArray = userStore.userSession.selectedArray.filter((selected) =>
    userStore.userSession.cart.some((cartItem) =>
      cartItem.graphic_novel_uid === selected.graphic_novel_uid &&
      cartItem.volume_uid === selected.volume_uid &&
      cartItem.volume_name === selected.volume_name &&
      cartItem.product_uid === selected.product_uid
    )
  );

  // Assign the selected items to the checkout array
  userStore.userSession.checkout = [...userStore.userSession.selectedArray];



  console.log('Selected items for checkout:', userStore.userSession.checkout);

  // Navigate to the checkout page
  return navigateTo('/checkout/checkout');
};
</script>
