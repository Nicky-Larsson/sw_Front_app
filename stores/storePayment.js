import { defineStore } from 'pinia';
import { useStoreUser } from '~/stores/storeUser';

export const useStorePayment = defineStore('storePayment', {
  state: () => ({
    clientSecret: null,
    error: null,
  }),

  actions: {
    async createPaymentIntent(amount, email, alias) {
      try {
        console.log('Creating payment intent for:', { amount, email, alias });

        const response = await $fetch('/api/create-payment-intent', {
          method: 'POST',
          body: {
            amount, // Amount in cents
            email,  // Client's email
            alias,  // Client's alias
          },
        });

        if (response.error) {
          throw new Error(response.error);
        }

        this.clientSecret = response.clientSecret;
        console.log('Payment Intent created successfully:', response.clientSecret);

        return response.clientSecret;
      } catch (error) {
        console.error('Error creating payment intent:', error.message);
        this.error = error.message;
        throw error;
      }
    },
  },
});