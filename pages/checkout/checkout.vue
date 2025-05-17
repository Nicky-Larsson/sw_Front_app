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
          </div>
          
          <div class="bg-white rounded-lg p-4 mt-4">
            <div class="text-2xl font-bold mb-4">Payment methods :</div>
            <div class="flex flex-col gap-2">

              <div
                v-for="option in paymentOptions"
                :key="option.value"
                class="border rounded-lg transition-all duration-200"
              >
                <button
                  type="button"
                  class="w-full flex items-center justify-between focus:outline-none transition-all duration-200"
                  :class="selectedPayment === option.value
                    ? 'px-6 py-4 text-xl bg-blue-50 border-blue-550 scale-100'
                    : 'px-4 py-2 text-base bg-white opacity-80 scale-95'"
                  @click="selectedPayment = option.value"
                >
                  <div class="flex items-center">
                    <img
                      :src="option.icon"
                      :alt="option.label"
                      class="transition-all duration-200 mr-3"
                      :class="selectedPayment === option.value ? 'h-8' : 'h-6 opacity-70'"
                    />
                    <span
                      class="transition-all duration-200 whitespace-nowrap"
                      :class="selectedPayment === option.value ? 'font-semibold text-xl' : 'font-normal text-lg'"
                    > {{ option.label }}</span>
                  </div>
                  <span
                    v-if="selectedPayment === option.value"
                    class="text-blue-600 font-bold"
                  >Selected</span>
                </button>


                <div v-show="selectedPayment === option.value" class="p-3 border-t">
                  <!-- Stripe -->
                  <form
                    v-if="option.value === 'stripe'"
                    @submit.prevent="payWithStripe"
                    class="mt-1 bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  > 
                    <!-- <div class="flex items-center justify-center mb-4">
                      <img src="/payment/stripe.jpg" alt="Powered by Stripe" class="h-9 mr-2" />
                    </div> -->
                    
                    <div class="mb-4">
                          <div 
                            id="card-element" 
                            class="border border-gray-300 rounded-md p-4 bg-gray-50 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
                          ></div>
                      <p id="card-error" class="text-red-500 text-sm mt-2"></p>
                    </div>

                    <div class="flex items-center mb-4">
                      <img src="/payment/visa.png" alt="visa" class="h-6 mr-2" />
                      <img src="/payment/mastercard.png" alt="mastercard" class="h-6 mr-2" />
                      <span class="text-sm text-gray-500">Powered by Stripe</span>
                    </div>
                    <button
                      :disabled="isProcessing"
                      type="submit"
                      class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div v-if="isProcessing" class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processing...
                      </div>
                      <div v-else>Pay Now</div>
                    </button>
                  </form>
                  <!-- PayPal -->
                  <div v-else-if="option.value === 'paypal'">
                    <div id="paypal-button-container" class="mt-4"></div>
                  </div>

                  <!-- Google Pay -->
                  <div v-else-if="option.value === 'googlepay'">
                    <div class="mb-4">
                      <div id="payment-request-button"></div>
                      <p id="payment-request-not-available" class="hidden text-center text-sm text-gray-500 mt-2">
                        Google Pay is not available on this device or browser.
                      </p>
                    </div>
                    <button
                      class="w-full bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center"
                      @click="testGooglePayFlow"
                      :disabled="isProcessing"
                    >
                      <img src="/payment/googlepay.png" alt="Google Pay" class="h-6 mr-2" />
                      Pay with Google Pay (Test)
                    </button>
                  </div>
                  
                  <!-- CMI -->
                  <div v-else-if="option.value === 'cmi'">
                    <button 
                      class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                      @click="payWithCMI"
                      :disabled="isProcessing"
                    >
                      <img src="/payment/cmi-logo.png" alt="CMI" class="h-6 mr-2" />
                      Pay with Credit Card (CMI)
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
import { useStoreUser } from '@/stores/storeUser';
import { ref, computed, onMounted, nextTick, watch, toRaw } from 'vue';
import { navigateTo } from '#app';
import { loadStripe } from '@stripe/stripe-js';
import { useStorePayment } from '@/stores/storePayment'; // Import the payment store
import { useRuntimeConfig } from '#app';
import { useStoreAuth } from '@/stores/storeAuth'; // <-- Add this import


const config = useRuntimeConfig();
const userStore = useStoreUser();
const paymentStore = useStorePayment();
const authStore = useStoreAuth(); 


const selectedPayment = ref('stripe');




const paymentOptions = [
  { value: 'paypal', label: 'PayPal', icon: '/payment/paypal.png' },
  { value: 'stripe', label: 'Credit Card', icon: '/payment/stripe.jpg' },
  { value: 'cmi', label: 'Credit Card (CMI)', icon: '/payment/cmi-logo.png' },
  { value: 'googlepay', label: 'Google Pay', icon: '/payment/googlepay.png' }, // Add this line
];


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

const email = ref(userStore.userSession.email || '')
const alias = ref(userStore.userSession.alias || '')

// Add this to your script
const isProd = ref(process.env.NODE_ENV === 'production');

console.log('checkout at checkout page:', userStore.userSession.checkout);

const totalPriceComputed = computed(() => {
const selectedArray = userStore.userSession.checkout;
  return selectedArray.reduce((total, prod) => {
    return total + (parseFloat(prod.price) || 0);
  }, 0) / 100; // Return the total price as a fixed decimal
});


const testGooglePayFlow = async () => {
  isProcessing.value = true;
  try {
    console.log("Starting Google Pay test flow...");
    
    if (!stripe) {
      throw new Error("Stripe not initialized. Please try again.");
    }
    
    // Instead of creating a payment method directly, use a test payment method ID
    const paymentMethodId = 'pm_card_visa'; // Stripe's test payment method
    
    console.log("Using Stripe test payment method ID:", paymentMethodId);

    console.log('totalPriceComputed.value:', totalPriceComputed.value);
    console.log('amount sent to backend:', Math.round(totalPriceComputed.value * 100));
    console.log('checkoutItems:', toRaw(userStore.userSession.checkout));

    // Send the request to your server
    const response = await $fetch('/api/payments/stripe/googlepay-intent', {
      method: 'POST',
      body: {
        paymentMethodId: paymentMethodId,
        userId: authStore.authInfo.uid,
        email: email.value,
        alias: alias.value,
        amount: Math.round(totalPriceComputed.value * 100),
        checkoutItems: toRaw(userStore.userSession.checkout || []),
        paymentSource: 'googlepay_test'
      }
    });
    
    console.log("Google Pay test flow response:", response);
    
    if (response && response.success) {
      // If payment needs additional steps, handle it
      if (response.requiresAction) {
        // Handle the authentication if needed
      } else {
        // Navigate to processing page where webhook will update the status
        navigateTo(`/checkout/processing?orderId=${response.orderId}`);
      }
    } else {
      alert('Payment failed: ' + (response?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error("Google Pay test flow failed:", error);
    alert('Test payment failed: ' + (error.data?.statusMessage || error.message));
  } finally {
    isProcessing.value = false;
  }
};


// Initialize PayPal on mount
onMounted(async () => {
  await nextTick();

  // Watch for changes to selectedPayment and initialize only the chosen method
  watch(selectedPayment, async (method) => {
    await nextTick();

    // Clean up previous payment UIs if needed
    // (Optional: add code here to unmount Stripe/PayPal buttons if switching)

    if (method === 'paypal') {
      // Initialize PayPal
      const paypalContainer = document.querySelector("#paypal-button-container");
      if (paypalContainer) {
        paypalContainer.innerHTML = '';
      }
      if (paypalContainer && window.paypal) {
        window.paypal.Buttons({
          fundingSource: window.paypal.FUNDING.PAYPAL, // Force PayPal funding source
          createOrder: async (data, actions) => {
            const checkoutItems = toRaw(userStore.userSession.checkout || []);
            console.log('checkoutItems in createOrder:', checkoutItems);
        
            if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
              throw new Error('Your cart is empty. Please add items to your cart before proceeding.');
            }
        
            const response = await $fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              body: {
                amount: totalPriceComputed.value.toFixed(2),
                currency: 'EUR',
                checkoutItems,
                userId: authStore.authInfo.uid,
              },
            });
        
            if (!response.id) {
              throw new Error('Failed to create PayPal order.');
            }
            return response.id;
          },
          onApprove: async (data, actions) => {
            console.log('PayPal onApprove data:', data);
            console.log('authStore.authInfo.uid:', authStore.authInfo?.uid);

            if (!data.orderID || !authStore.authInfo?.uid) {
              alert('Missing PayPal Order ID or User ID. Please log in again.');
              return;
            }

            const checkoutItems = toRaw(userStore.userSession.checkout || []);
            console.log('checkoutItems in onApprove:', checkoutItems);
        
            const response = await $fetch('/api/payments/paypal/paypal-intent', {
              method: 'POST',
              body: {
                orderID: data.orderID,
                checkoutItems,
                userId: authStore.authInfo.uid,
                email: userStore.userSession.email,
                alias: userStore.userSession.alias,
                totalPrice: totalPriceComputed.value,
                currency: 'EUR',
              },
            });
        
            if (response.success) {
              navigateTo(`/checkout/processing?orderId=${response.orderId}&paymentId=${data.orderID}`);
            } else {
              throw new Error(response.message || 'Server reported an issue finalizing the order.');
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            alert('An error occurred during the PayPal payment process.');
          },
          onCancel: () => {
            console.log('PayPal payment canceled by user.');
          },
        }).render("#paypal-button-container");
      }
    }

    if (method === 'stripe') {
      // Initialize Stripe
      stripe = await loadStripe(config.public.stripePublishableKey);
      if (!stripe) throw new Error('Stripe failed to initialize. Check your public key.');
      elements = stripe.elements();
      card = elements.create('card');
      const cardElement = document.querySelector('#card-element');
      if (cardElement) card.mount('#card-element');

      // Google Pay/Apple Pay
      const paymentRequest = stripe.paymentRequest({
        country: 'FR',
        currency: 'eur',
        total: {
          label: 'Total',
          amount: Math.round(totalPriceComputed.value * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default',
            theme: 'gray',
            height: '44px',
          },
        },
      });

      paymentRequest.on('paymentmethod', async (ev) => {
        isProcessing.value = true;
        try {
          const response = await $fetch('/api/payments/stripe/googlepay-intent', {
            method: 'POST',
            body: {
              paymentMethodId: ev.paymentMethod.id,
              userId: authStore.authInfo.uid,
              email: email.value,
              alias: alias.value,
              amount: Math.round(totalPriceComputed.value * 100),
              checkoutItems: toRaw(userStore.userSession.checkout || [])
            }
          });
          
          if (response.requiresAction) {
            const { error, paymentIntent } = await stripe.confirmCardPayment(response.clientSecret);
            if (error) {
              ev.complete('fail');
              throw new Error(error.message);
            } else if (paymentIntent.status === 'succeeded') {
              ev.complete('success');
              // Redirect to processing page instead of success
              navigateTo(`/checkout/processing?orderId=${response.orderId}&paymentId=${paymentIntent.id}`);
            }
          } else {
            ev.complete('success');
            // Redirect to processing page
            navigateTo(`/checkout/processing?orderId=${response.orderId}`);
          }
        } catch (error) {
          ev.complete('fail');
          alert('Google Pay payment failed: ' + error.message);
        } finally {
          isProcessing.value = false;
        }
      });

      paymentRequest.canMakePayment().then((result) => {
        if (result) {
          prButton.mount('#payment-request-button');
        } else {
          document.getElementById('payment-request-not-available').classList.remove('hidden');
        }
      });
    }

    // No JS initialization needed for CMI
  }, { immediate: true });
});


// Handle Stripe Payment
const payWithStripe = async () => {
  isProcessing.value = true;
  try {
    // 1. Create payment intent and order
    console.log('Sending checkoutItems:', toRaw(userStore.userSession.checkout));
    
    const { clientSecret, orderId } = await $fetch('/api/payments/stripe/stripe-intent', {
      method: 'POST',
      body: {
        amount: Math.round(totalPriceComputed.value * 100),
        email: email.value,
        alias: alias.value,
        checkoutItems: toRaw(userStore.userSession.checkout || []),
        userId: authStore.authInfo.uid
      }
    });

    if (!clientSecret || !orderId) throw new Error('Server error: missing payment intent or order.');

    // 2. Confirm payment on the frontend
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: card },
    });

    if (error) {
      throw new Error(error.message || 'Payment failed');
    }

    if (paymentIntent.status === 'succeeded') {
      // Important: do NOT clear cart here since the processing page will do it
      // This ensures good UX while maintaining accurate checkout state
      
      // 3. Redirect to processing page
      navigateTo(`/checkout/processing?orderId=${orderId}&paymentId=${paymentIntent.id}`);
    } else {
      throw new Error('Payment not successful');
    }
  } catch (error) {
    alert('Payment failed: ' + error.message);
  } finally {
    isProcessing.value = false;
  }
};


const payWithCMI = async () => {
  // Skip the cmi-intent API call completely
  navigateTo({
    path: '/checkout/cmiPaymentPage',
    query: {
      amount: totalPriceComputed.value.toFixed(2),
      // Pass any needed data through query params
      userId: authStore.authInfo.uid,
      email: email.value,
      alias: alias.value
    }
  });
};

// Add this function to your existing <script setup> section
/* const payWithCMI = async () => {
  isProcessing.value = true;
  try {
    const response = await $fetch('/api/payments/cmi/cmi-intent', {
      method: 'POST',
      body: {
        userId: authStore.authInfo.uid,
        email: email.value,
        alias: alias.value,
        amount: Math.round(totalPriceComputed.value * 100),
        checkoutItems: toRaw(userStore.userSession.checkout || [])
      }
    });

    if (response.success) {
      // If the URL is your Nuxt page, use navigateTo (SPA navigation)
      if (response.cmiUrl === '/checkout/cmiPaymentPage') {
        console.log("formData : ",  response.formData)
        navigateTo({
          path: response.cmiUrl,
          query: {
            oid: response.formData.oid,
            amountMAD: response.formData.amountMAD,
            amountEuros: response.formData.amountEuros,
            okUrl: response.formData.okUrl,
            failUrl: response.formData.failUrl,
            source: 'cmi' 
          }
        });
        return;
      }

      // Otherwise, submit the form to the real CMI gateway
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.cmiUrl;
      Object.entries(response.formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } else {
      alert('Payment initialization failed');
    }
  } catch (error) {
    console.error("CMI payment failed:", error);
    alert('Payment failed: ' + (error.data?.statusMessage || error.message));
  } finally {
    isProcessing.value = false;
  }
};
 */


// Show error messages
const showError = (errorMsgText) => {
  const errorMsg = document.querySelector("#card-error");
  if (errorMsg) {
    errorMsg.textContent = errorMsgText;
    console.error("Error:", errorMsgText);
  }
};



</script>