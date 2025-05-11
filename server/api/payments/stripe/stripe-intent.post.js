import Stripe from 'stripe';
import { getFirebaseDb } from '../../../utils/firebase';
import { createOrderData } from '../orderTemplate';
import { readBody } from 'h3';
import { updateProductsAccess } from '../../../utils/productsAccess.js';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirebaseDb();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe Secret Key is missing. Check your .env file.');
  }
  if (!body.email || !body.alias || !body.userId) {
    throw new Error('Email, alias, and userId are required.');
  }
  const amount = parseInt(body.amount, 10);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount. Amount must be a positive integer.');
  }


  // Helper function to get the code
  function getPaymentMethodCode(paymentSource) {
    switch(paymentSource.toLowerCase()) {
      case 'googlepay':
      case 'googlepay_test':
        return 'GP';
      case 'paypal':
        return 'PP';
      case 'stripe':
      case 'card':
        return 'CC';
      default:
        return 'OT'; // Other
    }
  }

  // 1. Create a new order in Firestore with 'pending' status
  // Replace lines 75-76 with this:
  const now = new Date();
  const dateCode = now.getFullYear().toString().slice(2) + 
                  (now.getMonth()+1).toString().padStart(2,'0') + 
                  now.getDate().toString().padStart(2,'0');
  const timeCode = now.getHours().toString().padStart(2,'0') + 
                  now.getMinutes().toString().padStart(2,'0');
  const randomPart = Math.floor(Math.random()*100).toString().padStart(2,'0');
  

  // Add payment method code to the order ID
  const paymentMethodCode = getPaymentMethodCode(body.paymentSource || 'stripe');
  

  try { 
    const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-${paymentMethodCode}`;
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        metadata: {
          email: body.email,
          alias: body.alias,
          userId: body.userId,
          orderId: orderId,
        },
      });
      // console.log('PaymentIntent created:', paymentIntent);
      // throw new Error('Test error for logging!');
    } catch (error) {
      console.error('Failed to create PaymentIntent:', error);
      throw error;
    }

    
    
    // 2. Create Firestore order as 'pending'
    // const orderDocRef = db.collection('users').doc(body.userId).collection('orders').doc(orderId);
    
    /* await orderDocRef.set({
      userId: body.userId,
      paymentIntentId: paymentIntent.id,
      checkoutItems: body.checkoutItems,
      totalPrice: amount / 100,
      status: 'pending',
      createdAt: new Date().toISOString(),
      email: body.email,
      alias: body.alias,
      orderId: orderId,
      paymentMethod: paymentMethodCode,
    }); */
    

    
    /* await orderDocRef.set(
      createOrderData(body, 'stripe', {
        orderId,
        payment_infos: {
          payment_method: 'stripe',
          paymentIntentId: paymentIntent.id,
          paymentIntentStatus: paymentIntent.status,
          paymentMethod: paymentMethodCode,
          payment_account_id: paymentIntent.account || null,
          payment_email_id: body.email,
          payment_brand: body.paymentBrand || '',
          payment_country: body.paymentCountry || '',
          sent_metadata: paymentIntent.metadata || {},
        }
      })
    ); */

    // Update products_access for the user

    /* const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : [];
    console.log('Received checkoutItems:', body.checkoutItems);

    
    await updateProductsAccess(body.userId, checkoutItems);

    console.log(`Order and products_access updated successfully for user: ${body.userId}`);
    */


    return { clientSecret: paymentIntent.client_secret, orderId }; 

  } catch (error) {
    console.error('<<<<<<<< /n /n Failed to process Stripe payment:', error);
    throw error;
  }
});


