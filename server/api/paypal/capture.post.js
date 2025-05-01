import paypal from '@paypal/checkout-server-sdk';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readBody } from 'h3';
import { useRuntimeConfig } from '#imports'; // Use Nuxt's auto-import

// --- Firebase Admin SDK Initialization ---
const config = useRuntimeConfig(); // Access runtime config server-side
const serviceAccountJson = config.firebaseServiceAccountKey; // Get from server-only runtime config

let serviceAccount;
try {
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined in runtimeConfig.');
  }
  serviceAccount = JSON.parse(serviceAccountJson); // Parse the JSON string from env/runtimeConfig
  console.log("Loaded service account email:", serviceAccount.client_email);

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
// -----------------------------------------

// --- PayPal Client Initialization ---
// Use runtimeConfig for PayPal too (more consistent)
const paypalEnv = config.public.paypal.environment; // Public runtime config
const paypalClientId = config.public.paypal.clientId; // Public runtime config
const paypalClientSecret = config.paypalClientSecret; // Server-only runtime config

if (!paypalClientId || !paypalClientSecret || !paypalEnv) {
  throw new Error("PayPal environment variables missing in runtimeConfig.");
}

let environment;
if (paypalEnv === 'sandbox') {
  environment = new paypal.core.SandboxEnvironment(paypalClientId, paypalClientSecret);
} else if (paypalEnv === 'live') {
  environment = new paypal.core.LiveEnvironment(paypalClientId, paypalClientSecret);
} else {
  throw new Error("Unknown PayPal environment: " + paypalEnv);
}
const client = new paypal.core.PayPalHttpClient(environment);
// ------------------------------------

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const paypalOrderId = body.orderID;
  const userId = body.userId;
  const checkoutItems = body.checkoutItems || [];
  const totalPrice = checkoutItems.reduce((sum, item) => sum + parseInt(item.price || 0, 10), 0);

  if (!paypalOrderId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing PayPal Order ID or User ID' });
  }

/*   console.log('userId:', userId);
  console.log('checkoutItems:', checkoutItems);
console.log('orderID:', paypalOrderId); */
  
  if (!userId) {
    throw new Error('userId is missing or undefined!');
  }
  if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    throw new Error('checkoutItems is missing or not an array!');
  }
  if (!paypalOrderId) {
    throw new Error('orderID is missing or undefined!');
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
  const now = new Date();
  const dateCode = now.getFullYear().toString().slice(2) + 
                  (now.getMonth()+1).toString().padStart(2,'0') + 
                  now.getDate().toString().padStart(2,'0');
  const timeCode = now.getHours().toString().padStart(2,'0') + 
                  now.getMinutes().toString().padStart(2,'0');
  const randomPart = Math.floor(Math.random()*100).toString().padStart(2,'0');

  // Add payment method code to the order ID
  const paymentMethodCode = getPaymentMethodCode(body.paymentSource || 'paypal');

  //  const orderId = `SW-${dateCode}-${timeCode}-${randomPart}`;
  const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-${paymentMethodCode}`;


  // 1. Create order in Firestore with status 'pending'
  const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
  
  
  const orderData = {
    userId,
    paypalOrderId,
    checkoutItems,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString()
  };


  try {
    await db.collection('test_admin_write').add({ test: true, time: Date.now() });
    console.log('Admin SDK test write succeeded');
  } catch (e) {
    console.error('Admin SDK test write failed:', e);
  }


  try {
    console.log("Creating pending order in Firestore:", orderData);
    await orderDocRef.set(orderData);
  } catch (err) {
    console.error("Server: Failed to create pending order in Firestore:", err.message);
    throw createError({ statusCode: 500, statusMessage: 'Could not create order in Firestore.' });
  }

  // 2. Attempt to capture PayPal payment
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});
  let capture;
  try {
    capture = await client.execute(request);
    if (capture.result.status !== 'COMPLETED') {
      // Payment not completed, update order to 'failed'
      await orderDocRef.update({ status: 'failed', failedAt: new Date().toISOString() });
      throw createError({ statusCode: 400, statusMessage: `PayPal payment status not COMPLETED: ${capture.result.status}` });
    }
  } catch (err) {
    // Payment failed, update order to 'failed'
    try {
      await orderDocRef.update({ status: 'failed', failedAt: new Date().toISOString(), error: err.message });
    } catch (updateErr) {
      console.error("Server: Failed to update order to failed after PayPal error:", updateErr.message);
    }
    throw createError({ statusCode: 500, statusMessage: 'PayPal payment capture failed.' });
  }

  // 3. Payment succeeded, update order to 'paid'
  try {
    await orderDocRef.update({
      status: 'paid',
      paidAt: new Date().toISOString(),
      paypalCapture: capture.result
    });
    return { success: true, orderId: paypalOrderId };
  } catch (err) {
    // Firestore update failed, but payment succeeded
    console.error("Server: Payment succeeded but failed to update order to paid:", err.message);
  
    // Log the failed update for manual review
    try {
      await db
          .collection('orderReports')
          .doc('paypalOrders')
          .collection(paypalOrderId)
          .doc('failedOrderUpdates')
          .set({
            userId,
            attemptedUpdate: {
              status: 'paid',
              paidAt: new Date().toISOString(),
              paypalCapture: capture.result
            },
            originalOrderData: orderData,
            error: err.message,
            status: 'unresolved',
            timestamp: new Date().toISOString()
          });
    } catch (logErr) {
      console.error("Server: Failed to log failed order update:", logErr.message);
    }
  
    // Still return success so user gets access, but log for manual fix
    return {
      success: true,
      orderId: paypalOrderId,
      warning: 'Payment succeeded, but failed to update order in Firestore. Please contact support if you have issues.'
    };
  }
});