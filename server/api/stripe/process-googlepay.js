import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
// import { allowedNodeEnvironmentFlags } from 'process';

// --- Firebase Admin SDK Initialization ---
const config = useRuntimeConfig();
const serviceAccountJson = config.firebaseServiceAccountKey;



// Add this helper function at the top of your file
function ensureValidUrl(url, fallback = 'http://localhost:3000') {
  if (!url) return fallback;
  
  // Check if URL has protocol, if not add http://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `http://${url}`;
  }
  
  return url;
}


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
const db = getFirestore();

// --- Stripe Client Initialization ---
const stripe = new Stripe(config.stripeSecretKey);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { paymentMethodId, userId, email, alias, amount, checkoutItems } = body;

  if (!paymentMethodId || !userId || !amount) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing required parameters: paymentMethodId, userId, or amount' 
    });
  }

  try {
    // First test if Firebase connection works
    try {
      const testQuery = await db.collection('users').limit(1).get();
      console.log("Firebase connection successful:", testQuery.empty ? "No users found" : "Users found");
    } catch (firebaseError) {
      console.error("Firebase connection test failed:", firebaseError);
      throw new Error(`Firebase authentication failed: ${firebaseError.message}`);
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


    const paymentMethodCode = getPaymentMethodCode(body.paymentSource || 'googlepay');
    //  const orderId = `SW-${dateCode}-${timeCode}-${randomPart}`;
    const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-${paymentMethodCode}`;
    
        

    // Then create document with custom ID
    const orderRef = await db.collection('users').doc(userId).collection('orders').doc(orderId);
    
    await orderRef.set({
      userId,
      checkoutItems,
      totalAmount: amount,
      paymentMethod: 'googlepay',
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Add this where you create the payment intent:
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${ensureValidUrl(config.public.siteUrl)}/checkout/purchaseSuccess`,
      metadata: {
        orderId,
        userId,
        email,
        alias,
        paymentSource: body.paymentSource || 'googlepay',
        paymentMethod: 'GOOGLE_PAY'
      } 
    });

    // 3. Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Update order status to paid
      await orderRef.update({
        status: 'paid',
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date().toISOString()
      });

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
    }
  } catch (error) {
    console.error('Error processing Google Pay payment:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Error processing payment' 
    });
  }
});