import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { getFirebaseDb } from '../../../utils/firebase'; 
import { createOrderData } from '../orderTemplate';
import { updateProductsAccess } from '../../../utils/productsAccess.js';
import { checkDatabaseHealth } from '../../../utils/databaseHealth';

// Add this helper function at the top of your file
function ensureValidUrl(url, fallback = 'http://localhost:3000') {
  if (!url) return fallback;
  
  // Check if URL has protocol, if not add http://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `http://${url}`;
  }
  
  return url;
}

// --- Firebase Admin SDK Initialization ---
const config = useRuntimeConfig();
const serviceAccountJson = config.firebaseServiceAccountKey;

let serviceAccount;
try {
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined in runtimeConfig.');
  }
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (e) {
  console.error("Failed to parse Firebase service account key JSON:", e.message);
  throw new Error("Invalid Firebase service account key configuration.");
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin SDK Initialized.");
  } catch (e) {
    console.error("Failed to initialize Firebase Admin SDK:", e.message);
    throw new Error("Could not initialize Firebase Admin SDK.");
  }
}

const db = getFirebaseDb();
// --- Stripe Client Initialization ---
const stripe = new Stripe(config.stripeSecretKey);

export default defineEventHandler(async (event) => {
  try {
    // CRITICAL: Check database health before creating payment
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.success) {
      console.error('Google Pay rejected due to database issue:', dbHealth.message);
      throw createError({ 
        statusCode: 503, 
        statusMessage: `We're experiencing technical difficulties. Please try again in a few minutes. (Database issue)` 
      });
    }
        

    const body = await readBody(event);
    const { paymentMethodId, userId, email, alias, amount: clientAmountCents } = body; // Renamed amount to clientAmountCents for clarity
    const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : [];

    if (!paymentMethodId || !userId || typeof clientAmountCents === 'undefined') { // Check for undefined clientAmountCents
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Missing required parameters: paymentMethodId, userId, or amount' 
      });
    }

    // Assuming clientAmountCents is the total in cents from the client
    // You will replace this with secure server-side calculation later
    const totalPriceCents = parseInt(clientAmountCents, 10); 

    // RESTORED AND CORRECTED VALIDATION:
    if (isNaN(totalPriceCents) || totalPriceCents <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or missing amount value' });
    }
    const totalPriceEuros = Number((totalPriceCents / 100).toFixed(2));

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

    // Generate order ID with payment method code
    const now = new Date();
    const dateCode = now.getFullYear().toString().slice(2) + 
                    (now.getMonth()+1).toString().padStart(2,'0') + 
                    now.getDate().toString().padStart(2,'0');
    const timeCode = now.getHours().toString().padStart(2,'0') + 
                    now.getMinutes().toString().padStart(2,'0');
    const randomPart = Math.floor(Math.random()*100).toString().padStart(2,'0');

    const paymentMethodCode = getPaymentMethodCode(body.paymentSource || 'googlepay');
    const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-${paymentMethodCode}`;
    
    // Then create document with custom ID
    const orderRef = await db.collection('users').doc(userId).collection('orders').doc(orderId);
     
    
    console.log('Received clientAmountCents:', clientAmountCents, 'type:', typeof clientAmountCents);
    console.log('Parsed totalPriceCents:', totalPriceCents, 'totalPriceEuros:', totalPriceEuros);

    
    const orderData = createOrderData(body, 'googlepay', {
      orderId,
      currency: 'eur', // Stripe will use 'eur'
      totalPrice: totalPriceEuros,    // Pass the Euro value
      totalPriceCents: totalPriceCents, // Pass the Cent value
      payment_infos: {
        payment_provider:'googlepay', // via Stripe
        payment_intentId: '', // to be filled after intent creation
        payment_method: 'googlepay',
        payment_email_id: email,
        sent_metadata: body.metadata || {},
      },
      // Set provisional access level
      accessLevel: 'provisional',
      provisionalExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    console.log('orderData before Firestore set:', orderData);
    await orderRef.set(orderData);

    // Create a payment intent with the payment method
    // Stripe expects the amount in the smallest currency unit (cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPriceCents, // Use totalPriceCents for Stripe
      currency: 'eur',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${ensureValidUrl(config.public.siteUrl)}/checkout/processing?orderId=${orderId}`,
      metadata: {
        orderId,
        userId,
        email,
        alias,
        paymentSource: body.paymentSource || 'googlepay',
        paymentMethod: 'GOOGLE_PAY'
      } 
    });

    await orderRef.update({
      status: 'processing',
      'payment_infos.payment_intentId': paymentIntent.id,
      'payment_infos.payment_intentStatus': paymentIntent.status,
      updatedAt: new Date().toISOString()
    });

    console.log('Order updated with payment intent ID:', paymentIntent.id);   

    /* // Check if payment succeeded       <<<<<<<<<<<<<<<<<<<<
    if (paymentIntent.status === 'succeeded') {
      // Update order status to paid
      await orderRef.update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payment_infos: {
          payment_method: 'googlepay',
          payment_intentId: paymentIntent.id,
          payment_intentStatus: paymentIntent.status,
          payment_provider: 'googlepay',
          payment_email_id: email,
          payment_brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand || '',
          payment_country: paymentIntent.charges?.data?.[0]?.country || '',
          sent_metadata: paymentIntent.metadata || {},
        },
        webhook_answer: {
          payment_method: 'googlepay',
          payment_intentId: paymentIntent.id,
          payment_intentStatus: paymentIntent.status,
          payment_methodType: paymentIntent.payment_method_types?.[0] || '',
          payment_brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand || '',
          payment_last: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || '',
          payment_country: paymentIntent.charges?.data?.[0]?.country || '',
        }
      });

      // Update products_access for the user
      await updateProductsAccess(userId, checkoutItems);

      return {
        success: true,
        orderId,
        clientSecret: paymentIntent.client_secret
      };
    } else if (paymentIntent.status === 'requires_action') {
      // Additional authentication required
      await orderRef.update({
        status: 'pending_authentication',
        stripePaymentIntentId: paymentIntent.id
      });

      return {
        success: true,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        orderId
      };
    } else {
      // Payment failed
      await orderRef.update({
        status: 'failed',
        stripePaymentIntentId: paymentIntent.id,
        failedAt: new Date().toISOString()
      });

      throw createError({ 
        statusCode: 400, 
        statusMessage: `Payment failed with status: ${paymentIntent.status}` 
      });
    } */

    return {
      success: true,
      orderId,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      handledByWebhook: true
    };


  } catch (error) {
    console.error('Error processing Google Pay payment:', error);
    
    // Add error logging to Firestore
    try {
      await db.collection('logs')
        .doc('paymentErrors')
        .collection('googlePay')
        .add({
          userId,
          orderId,
          error: error.message,
          timestamp: new Date().toISOString(),
          paymentMethodId
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Error processing payment' 
    });
  }
});