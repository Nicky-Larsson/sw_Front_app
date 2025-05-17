import Stripe from 'stripe';
import { getFirebaseDb } from '../../../utils/firebase';
import { readRawBody } from 'h3';
import { updateProductsAccess } from '../../../utils/productsAccess.js'; // Import the function
import { createOrderData } from '../orderTemplate.js'; 


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirebaseDb();



export default defineEventHandler(async (event) => {
  console.log('Stripe webhook received!');
  const sig = event.node.req.headers['stripe-signature'];
  const rawBody = await readRawBody(event);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return { received: false };
  }

  // Handle the event
  if (stripeEvent.type === 'payment_intent.succeeded' || stripeEvent.type === 'payment_intent.payment_failed') {
    const paymentIntent = stripeEvent.data.object;
    const { metadata, id, status } = paymentIntent;
    const userId = metadata?.userId;
    const orderId = metadata?.orderId;
    const paymentMethod = metadata?.paymentMethod || 'stripe'; // Determine payment method (Stripe card, Google Pay, etc.)

    if (userId && orderId) {
      const userDocRef = db.collection('users').doc(userId);
      const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);

      try {
        // Get checkout items from the user document
        const userDoc = await userDocRef.get();
        const userData = userDoc.exists ? userDoc.data() : {};
        const checkoutItems = userData.checkout || [];
        

        const formattedAmount = paymentIntent.amount / 100;
        console.log('\nAmount before saving:', formattedAmount, typeof formattedAmount);

        if (stripeEvent.type === 'payment_intent.succeeded') {
          try {
            // STEP 1: Create the order with provisional access
            const orderData = createOrderData(
              {
                userId,
                email: metadata.email,
                alias: metadata.alias,
                checkoutItems,
                amount: parseFloat((paymentIntent.amount / 100).toFixed(2)),
                status: 'paid',
                accessLevel: 'provisional', // Start with provisional access
                provisionalExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              },
              paymentMethod,
              {
                orderId,
                currency: paymentIntent.currency,
                totalPrice: parseFloat((paymentIntent.amount / 100).toFixed(2)),
                payment_infos: {
                  payment_method: paymentMethod,
                  payment_intent_id: paymentIntent.id,
                  payment_method_type: paymentIntent.payment_method_types?.[0] || '',
                  payment_brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand || '',
                  payment_last: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || '',
                  payment_country: paymentIntent.charges?.data?.[0]?.country || '',
                },
                extraFields: {
                  stripe_webhook_answer: {
                    paidAt: new Date().toISOString(),
                  },
                },
              }
            );

            // Create or update the order document
            await orderDocRef.set(orderData, { merge: true });

            try {
              // STEP 2: Update products access
              await updateProductsAccess(userId, checkoutItems);

              // STEP 3: Mark as fully processed with access granted
              await orderDocRef.update({
                accessGranted: true,
                accessLevel: 'full',
                webhookProcessedAt: new Date().toISOString(),
              });

              // STEP 4: Clear checkout data
              await userDocRef.update({
                checkout: [],
                checkoutTotal: 0,
                checkoutTotalFormatted: '0.00 EUR',
                checkoutCreatedAt: '',
                cart: [],
                selectedArray: [],
              });

              console.log(`Order ${orderId} processed successfully for user ${userId} using ${paymentMethod}`);
            } catch (accessError) {
              // If product access fails, mark the error
              await orderDocRef.update({
                accessError: accessError.message,
                status: 'error',
                errorTime: new Date().toISOString(),
              });

              throw accessError;
            }
          } catch (orderError) {
            console.error(`Error creating order: ${orderError.message}`);
            // Create error order if normal order creation fails
            await orderDocRef.set({
              status: 'error',
              error: orderError.message,
              errorTime: new Date().toISOString(),
              paymentIntentId: paymentIntent.id,
              userId,
              orderId,
              webhookReceived: true,
            });

            throw orderError; // Re-throw to be caught by the outer catch
          }
        } else {
          // Handle payment_intent.payment_failed
          const failedOrderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId + '_failed');
          await failedOrderDocRef.set({
            status: 'failed',
            failedAt: new Date().toISOString(),
            error: paymentIntent.last_payment_error?.message || 'Payment failed',
            checkoutItems,
          });
        }
      } catch (err) {
        // Log for manual review
        await db
          .collection('logs')
          .doc('orderReports')
          .collection('stripeOrders')
          .doc(orderId + '_error_internal')
          .set({
            userId,
            orderId,
            email: metadata.email,
            alias: metadata.alias,
            paymentIntentId: paymentIntent.id,
            attemptedUpdate: { status: stripeEvent.type === 'payment_intent.succeeded' ? 'paid' : 'failed' },
            error: err.message,
            status: 'unresolved',
            error_time: new Date().toISOString(),
            resolved_time: '',
          });
      }
    }
  }

  return { received: true };
});