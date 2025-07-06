import Stripe from 'stripe';
import { getFirebaseDb } from '../../../utils/firebase';
import { createOrderData } from '../orderTemplate';
import { readBody } from 'h3';
import { updateProductsAccess } from '../../../utils/productsAccess.js';
import { checkDatabaseHealth } from '../../../utils/databaseHealth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirebaseDb();

export default defineEventHandler(async (event) => {

  // CRITICAL: Check database health before creating payment
  const dbHealth = await checkDatabaseHealth();
  if (!dbHealth.success) {
    console.error('Payment rejected due to database issue:', dbHealth.message);
    throw createError({
      statusCode: 503, // Service Unavailable
      statusMessage: `We're experiencing technical difficulties. Please try again in a few minutes.`,
    });
  }

  const body = await readBody(event);

  if (!process.env.STRIPE_SECRET_KEY) {
    throw createError({
      statusCode: 500, // Internal Server Error
      statusMessage: 'Stripe Secret Key is missing. Please contact support.',
    });
  }
  if (!body.email || !body.alias || !body.userId) {
    throw createError({
      statusCode: 400, // Bad Request
      statusMessage: 'Email, alias, and userId are required.',
    });
  }

    // Validate and calculate total price on the backend
  const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : [];
  const totalPriceCents = checkoutItems.reduce((sum, item) => {
    const price = Number(item.price);
    if (isNaN(price) || price <= 0) {
      throw createError({
        statusCode: 400, // Bad Request
        statusMessage: `Invalid price value for item: ${item.name || 'unknown'}`,
      });
    }
    return sum + price;
  }, 0);
  

  if (isNaN(totalPriceCents) || totalPriceCents <= 0) {
      throw createError({
      statusCode: 400, // Bad Request
      statusMessage: 'Invalid total price: Must be a positive number.',
    });
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
        amount: totalPriceCents, // Use backend-calculated total
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
    
    console.log('Calling updateProductsAccess with:', body.userId, checkoutItems);

    // await updateProductsAccess(body.userId, checkoutItems);

    // console.log(`Order and products_access updated successfully for user: ${body.userId}`);

    

    const orderDocRef = db.collection('users').doc(body.userId).collection('orders').doc(orderId);
    await orderDocRef.set({
      status: 'pending',
      createdAt: new Date().toISOString(),
      // checkoutItems: checkoutItems,
      checkout_infos: { items: checkoutItems },
      totalPrice: totalPriceCents / 100,
      totalPriceCents: totalPriceCents,
      currency: 'eur', 
      accessGranted: 'pending',
      accessLevel: 'pending',
      payment_infos: {
        payment_method: body.paymentSource || 'STRIPE',
        payment_provider: 'stripe',
        paymentIntentId: paymentIntent.id,
        paymentIntentStatus: paymentIntent.status
      },
      email: body.email,
      alias: body.alias,
      userId: body.userId,
      orderId,
    });    


    return { clientSecret: paymentIntent.client_secret, orderId }; 


  } catch (error) {
    console.error('<<<<<<<< /n /n Failed to process Stripe payment:', error);
    throw error;
  }
});


