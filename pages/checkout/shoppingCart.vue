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
                        <div v-for="product in userStore.userSession.cart" :key="product.id">
                                <CartItem
                                    v-if="product"
                                    :product="product" 
                                    :selectedArray="selectedArray"
                                    @selectedRadio="selectedRadioFunc"
                                />
                        </div>
                    </div>
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


import { useStoreUser } from '@/stores/storeUser';

const userStore = useStoreUser();


// const user = useSupabaseUser()

console.log(userStore.userSession)

// userStore.clearCart()

let selectedArray = ref([]);

// userStore.init()

onMounted(() => {
    // setTimeout(() => userStore.isLoading = false, 200)
});

const cards = ref([
    '/payment/visa.png',
    '/payment/mastercard.png',
    '/payment/paypal.png',
    '/payment/applepay.png',
])

const totalPriceComputed = computed(() => {
    let price = 0
    userStore.userSession.cart.forEach(prod => {
        price +=  parseInt(prod.price)
        // console.log(price);
    })
    return price / 100
})

const selectedRadioFunc = (e) => {

    if (!selectedArray.value.length) {
        selectedArray.value.push(e)
        return
    }

    selectedArray.value.forEach((item, index) => {
        if (e.id != item.id) {
            selectedArray.value.push(e)
        } else {
            selectedArray.value.splice(index, 1);
        }
    })
}

const goToCheckout = () => {
    let ids = []
    userStore.checkout = []


    selectedArray.value.forEach(item => ids.push(item.id))

    let res = userStore.userSession.cart.filter((item) => {
        return ids.indexOf(item.id) != -1
    })

    res.forEach(item => userStore.checkout.push(toRaw(item)))


    return navigateTo('/checkout/checkout')
}

const validCartItems = computed(() => {
  return userStore.userSession.cart.filter(product => product && product.id);
});

</script>
