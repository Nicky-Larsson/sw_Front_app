<template>
  <client-only>
  <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
    <div class="md:flex gap-4 justify-between mx-auto w-full">
      <div class="md:w-[65%]">
        <div class="bg-white rounded-lg p-4">
          <div class="text-xl font-semibold mb-2">Client Infos</div>
          <div v-if="currentAddress && currentAddress.data">
            <NuxtLink 
              to=""
              class="flex items-center pb-2 text-blue-500 hover:text-red-400"
            >
              <Icon name="mdi:plus" size="18" class="mr-2" />
              Update Address
            </NuxtLink>
          </div>
        </div>

        <div id="Items" class="bg-white rounded-lg p-4 mt-4">
          <div v-for="product in userStore.userSession.checkout" :key="product.id">
            <CheckoutItem :product="product" />
          </div>
        </div>
      </div>

      <div class="md:w-[35%]">
        <div id="PlaceOrder" class="bg-white rounded-lg p-4">
          <div class="text-2xl font-extrabold mb-2">Summary</div>
          <div class="flex items-center justify-between my-4">
            <div class="font-semibold">Total</div>
            <div class="text-2xl font-semibold">
              <span class="font-extrabold">{{ totalPriceComputed }} €</span>
            </div>
          </div>

          <!-- PayPal Button -->

          <div id="paypal-button-container" class="mt-4"></div>

          <!-- Stripe Button -->
          <form @submit.prevent="payWithStripe" class="mt-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">


            <!-- Stripe Branding -->
            <div class="flex items-center justify-center mb-4">
              <img src="/payment/stripe.jpg" alt="Powered by Stripe" class="h-9 mr-2 " />
            </div>

            <!-- Stripe Card Element -->
            <div class="mb-4">

              <div id="card-element" class="border border-gray-300 rounded-md p-3 bg-gray-50 shadow-sm"></div>
              <p id="card-error" class="text-red-500 text-sm mt-2"></p>
            </div>
              <div class="flex items-center mb-4">
                  <img src="/payment/visa.png" alt="visa" class="h-6 mr-2" />
                  <img src="/payment/mastercard.png" alt="mastercard" class="h-6 mr-2" />
                  <span class="text-sm text-gray-500">Powered by Stripe</span>
              </div>
            <!-- Submit Button -->
            <button
              :disabled="isProcessing"
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isProcessing" class="flex items-center justify-center">
                <svg
                  class="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Processing...
              </div>
              <div v-else>Pay Now</div>
            </button>
          </form>
        </div>

        <div class="bg-white rounded-lg p-4 mt-4">
          <div class="text-lg font-semibold mb-2">Payment methods</div>
          <div class="flex items-center justify-start gap-8 my-4">
            <div v-for="(card, index) in cards" :key="index">
              <img class="h-6" :src="card" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  </client-only>
</template>

<script setup>
import { useStoreUser } from '~/stores/storeUser';
import { ref, computed, onMounted, nextTick } from 'vue';
import { navigateTo } from '#app';
import { loadStripe } from '@stripe/stripe-js';
import { useStorePayment } from '~/stores/storePayment'; // Import the payment store


const userStore = useStoreUser();
const paymentStore = useStorePayment();


const totalPriceComputed = computed(() => {
  const selectedArray = userStore.userSession.checkout;
  return selectedArray.reduce((total, prod) => {
    return total + (parseFloat(prod.price) || 0);
  }, 0) / 100; // Return the total price as a fixed decimal
});

const cards = ref([
  '/payment/visa.png',
  '/payment/mastercard.png',
  '/payment/paypal.png',
  '/payment/applepay.png',
]);

const currentAddress = ref(null);
const isProcessing = ref(false);
let stripe = null;
let elements = null;
let card = null;

// Initialize PayPal on mount
onMounted(async () => {
  try {
    await nextTick(); // Wait for the DOM to be fully updated

    // Initialize PayPal
    const paypalContainer = document.querySelector("#paypal-button-container");
 if (paypalContainer && window.paypal) { // Check if paypal object exists
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          // Creates the order on PayPal's side
          console.log('Creating PayPal order...');
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: totalPriceComputed.value.toFixed(2),
                  currency_code: 'EUR'
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          console.log('PayPal onApprove triggered. OrderID:', data.orderID);
          isProcessing.value = true;

          try {
            // Call your Nitro server route to capture payment and finalize order
            console.log(`Client: Calling /api/paypal/capture for OrderID: ${data.orderID}`);
            const response = await $fetch('/api/paypal/capture', {
              method: 'POST',
              body: {
                orderID: data.orderID,
                // Pass necessary checkout items for the server to save
                checkoutItems: toRaw(userStore.userSession.checkout || [])
              }
            });

            // Check the response from the Nitro server
            if (response.success) {
              console.log('Client: Server confirmed payment and order save. Order ID:', response.orderId);
              // Clear cart locally (server should ideally handle the authoritative state)
              userStore.clearCart(); // Assuming you have this action
              userStore.userSession.checkout = []; // Clear checkout state
              navigateTo('/checkout/purchaseSuccess');
            } else {
              // This case might not be hit if server throws errors using createError,
              // but included for robustness if server returns { success: false }
              throw new Error(response.message || 'Server reported an issue finalizing the order.');
            }

          } catch (error) {
            // Handle errors from the $fetch call (network, or errors thrown by Nitro)
            console.error('Client: Error calling /api/paypal/capture or processing response:', error);
            // Nuxt's $fetch throws errors with a 'data' property for structured server errors
            const message = error.data?.statusMessage || // Message from createError
                            error.message ||             // Generic JS error message
                           'An unexpected error occurred during payment processing.';
            alert('Payment processing failed: ' + message);
            // Do NOT navigate to success page
          } finally {
            isProcessing.value = false;
          }
        },
        onError: (err) => {
          // Handles errors *within* the PayPal SDK (e.g., popup issues)
          console.error('PayPal SDK onError:', err);
          alert('An error occurred with the PayPal button setup or during approval.');
          isProcessing.value = false;
        },
        onCancel: (data) => {
          // Handles user closing the PayPal popup
          console.log('PayPal payment cancelled by user.');
          alert('Payment cancelled.');
          isProcessing.value = false;
        }
      }).render("#paypal-button-container");
    } else {
      console.error('PayPal SDK (window.paypal) not loaded or #paypal-button-container not found.');
    }

    // Initialize Stripe
    stripe = await loadStripe('pk_test_51RH043Ra6buvWRWkCFky34bguFtWWf5QxJGSA9wJXojXjTyUZAYeNTLJe6Wb0RtW16TazCRn3Eu1xvB7Q3BafA0r00Ez03oo0n'); // Replace with your actual Stripe Publishable Key
    if (!stripe) {
      throw new Error('Stripe failed to initialize. Check your public key.');
    }

    elements = stripe.elements();
    card = elements.create('card');
    const cardElement = document.querySelector('#card-element');
    if (cardElement) {
      card.mount('#card-element');
    }
  } catch (error) {
    console.error('Initialization Error:', error.message);
  }
});

const email = ref('test@mail.com');
const alias = ref('Nicky-Larsson');
// Handle Stripe Payment
const payWithStripe = async () => {
  isProcessing.value = true;

  try {
    // Step 1: Create a payment intent using the store
    const clientSecret = await paymentStore.createPaymentIntent(
      Math.round(totalPriceComputed.value * 100), // Amount in cents
      email.value, // Client's email
      alias.value  // Client's alias
    );
    console.log('Client Secret:', clientSecret);

    if (!clientSecret) {
      throw new Error('Client secret is missing. Please try again.');
    }

    // Step 2: Save the order as "pending" before confirming the payment
    const orderId = await userStore.createOrderWithStripe(clientSecret, 'stripe', 'pending');
    if (!orderId) {
      throw new Error('Failed to save the order. Please try again.');
    }

    // Step 3: Confirm the payment on the frontend
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: card },
    });

    if (error) {
      console.error('Stripe Error:', error.message);

      // Update the order to "failed" if payment fails
      await userStore.updateOrderStatus(orderId, 'failed');
      throw new Error(error.message);
    }

    console.log('Stripe Payment Intent:', paymentIntent);

    // Step 4: Update the order to "paid" after successful payment
    await userStore.updateOrderStatus(orderId, 'paid');

    // Step 5: Navigate to the success page
    navigateTo('/checkout/purchaseSuccess');
  } catch (error) {
    console.error('Error processing payment:', error.message);
    alert('Payment failed: ' + error.message);
  } finally {
    isProcessing.value = false;
  }
};

// Show error messages
const showError = (errorMsgText) => {
  const errorMsg = document.querySelector("#card-error");
  if (errorMsg) {
    errorMsg.textContent = errorMsgText;
    console.error("Error:", errorMsgText);
  }
};

</script>