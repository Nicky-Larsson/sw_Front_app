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

const environment = paypalEnv === 'live'
  ? new paypal.core.LiveEnvironment(paypalClientId, paypalClientSecret)
  : new paypal.core.SandboxEnvironment(paypalClientId, paypalClientSecret);
const client = new paypal.core.PayPalHttpClient(environment);
// ------------------------------------

export default defineEventHandler(async (event) => {
  // ... (rest of your handler logic remains the same)
  const body = await readBody(event);
  const paypalOrderId = body.orderID;
  const userId = 'HARDCODED_USER_ID_REPLACE_ME'; // <<<--- REPLACE WITH ACTUAL USER ID LOGIC
  const checkoutItems = body.checkoutItems || [];
  const totalPrice = checkoutItems.reduce((sum, item) => sum + parseInt(item.price || 0, 10), 0);

  if (!paypalOrderId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing PayPal Order ID or User ID' });
  }

  // 1. Capture PayPal Payment
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});

  let capture;
  try {
    capture = await client.execute(request);
    if (capture.result.status !== 'COMPLETED') {
      throw createError({ statusCode: 400, statusMessage: `PayPal payment status not COMPLETED: ${capture.result.status}` });
    }
  } catch (err) {
    console.error("Server: PayPal capture failed:", err.message);
    throw createError({ statusCode: 500, statusMessage: 'PayPal payment capture failed.' });
  }

  // 2. Save/Update Order in Firestore
  const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(paypalOrderId);
  const orderData = { /* ... your order data ... */ status: 'paid' };

  try {
    await orderDocRef.set(orderData);
    return { success: true, orderId: paypalOrderId };
  } catch (err) {
    console.error(`Server: Firestore save failed for order ${paypalOrderId}:`, err.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Payment successful (PayPal ID: ${paypalOrderId}), but failed to save order details. Please contact support.`
    });
  }
});