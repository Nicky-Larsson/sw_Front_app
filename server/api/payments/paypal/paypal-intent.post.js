import paypal from '@paypal/checkout-server-sdk';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readBody } from 'h3';
import { useRuntimeConfig } from '#imports'; // Use Nuxt's auto-import
import { createOrderData } from '../orderTemplate';
import { updateProductsAccess } from '../../../utils/productsAccess.js';

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
      credential: cert(serviceAccount),
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
  try {
    const body = await readBody(event);
    console.log('Received body in paypal-intent:', body);

    // Extract data from the request body
    const paypalOrderId = body.orderID;
    const userId = body.userId;
    const sw_email = body.email;
    const alias = body.alias;
    const currency = body.currency;
    const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : [];

    // Validate required fields
    if (!paypalOrderId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing PayPal Order ID or User ID' });
    }
    if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
      throw new Error('checkoutItems is missing or not an array!');
    }

    // Validate and calculate totalPrice
    const totalPrice = checkoutItems.reduce((sum, item) => {
      let price = Number(item.price);
      console.log('Item price:', item.price, 'Parsed price:', price , 'type price:', typeof price)

      if (typeof item.price === 'string' && item.price.trim() === '') price = 0;
      if (isNaN(price)) {
        console.error('Invalid price value:', item.price, item);
        throw new Error(`Invalid price value: ${item.price}`);
      }
      return sum + price;
    }, 0);

    console.log('checkoutItems:', checkoutItems);
    console.log('Calculated totalPrice:', totalPrice);

    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new Error('Invalid totalPrice: Must be a positive number.');
    }

    // Helper function to get the payment method code
    function getPaymentMethodCode(paymentSource) {
      switch (paymentSource.toLowerCase()) {
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

    // Generate order ID
    const now = new Date();
    const dateCode = now.getFullYear().toString().slice(2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const timeCode = now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
    const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const paymentMethodCode = getPaymentMethodCode(body.paymentSource || 'paypal');
    const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-${paymentMethodCode}`;
     

     
    console.log("total price : ", totalPrice);
    const totalPriceEuros = totalPrice / 100;

    // Create order data
    const orderData = createOrderData(body, 'paypal', {
      orderId,
      currency,
      totalPrice: totalPriceEuros,
      userId,
      alias,
      sw_email,
      payment_infos: {
        payment_provider: 'paypal',
        paypal_order_id: paypalOrderId,
        sent_metadata: body.metadata || {},
        payment_method: paymentMethodCode, // e.g., 'PP'
      },
    });

    // Save order to Firestore
    const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
    console.log("Creating pending order in Firestore:", orderData.totalPrice);
    await orderDocRef.set(orderData);

    // Capture PayPal payment
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    let capture;
    try {
      capture = await client.execute(request);
      if (capture.result.status !== 'COMPLETED') {
        await orderDocRef.update({ status: 'failed', failedAt: new Date().toISOString() });
        throw createError({ statusCode: 400, statusMessage: `PayPal payment status not COMPLETED: ${capture.result.status}` });
      }
    } catch (err) {
      await orderDocRef.update({ status: 'failed', failedAt: new Date().toISOString(), error: err.message });
      throw createError({ statusCode: 500, statusMessage: 'PayPal payment capture failed.' });
    }

    // Update order to 'paid'
    try {
      await orderDocRef.update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        webhook_answer: {
          payment_method: 'paypal',
          captureId: capture.result.id,
          status: capture.result.status,
          payerEmail: capture.result.payer?.email_address || '',
          payerId: capture.result.payer?.payer_id || '',
          amount: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '',
          currency: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code || '',
        },
      });

      await updateProductsAccess(userId, checkoutItems);

      return { success: true, orderId: paypalOrderId };
    } catch (err) {
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
              paypalCapture: capture.result,
            },
            originalOrderData: orderData,
            error: err.message,
            status: 'unresolved',
            timestamp: new Date().toISOString(),
          });
      } catch (logErr) {
        console.error("Server: Failed to log failed order update:", logErr.message);
      }

      // Still return success so user gets access, but log for manual fix
      return {
        success: true,
        orderId: paypalOrderId,
        warning: 'Payment succeeded, but failed to update order in Firestore. Please contact support if you have issues.',
      };
    }
  } catch (err) {
    console.error("Error processing PayPal payment:", err.message);
    throw createError({ statusCode: 500, statusMessage: err.message });
  }
});