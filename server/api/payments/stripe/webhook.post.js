import Stripe from 'stripe';
import { getFirebaseDb } from '../../../utils/firebase';
import { readRawBody } from 'h3';
import { updateProductsAccess } from '../../../utils/productsAccess.js'; // Import the function
import { createOrderData } from '../orderTemplate.js'; 


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirebaseDb();



export default defineEventHandler(async (event) => {
  // Stripe requires the raw body to verify the signature
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

    if (userId && orderId) {
      try {
        // Get checkout items from the user document
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        
        // Default to empty array if checkout not found or document doesn't exist
        const userData = userDoc.exists ? userDoc.data() : {};
        const checkoutItems = userData.checkout || [];

        if (stripeEvent.type === 'payment_intent.succeeded') {
          const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
          
          try {
            // STEP 1: Create the order
            const orderData = createOrderData(
              {
                userId,
                email: metadata.email,
                alias: metadata.alias,
                checkoutItems,
                amount: paymentIntent.amount,
                status: 'paid'
              },
              'stripe',
              {
                orderId,
                currency: paymentIntent.currency,
                payment_infos: {
                  payment_method: 'stripe',
                  paymentIntentId: paymentIntent.id,
                  paymentIntentStatus: paymentIntent.status,
                  payment_method_type: paymentIntent.payment_method_types?.[0] || '',
                  payment_brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand || '',
                  payment_last: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || '',
                  payment_country: paymentIntent.charges?.data?.[0]?.country || '',
                },
                extraFields: {
                  stripe_webhook_answer: {
                    paidAt: new Date().toISOString()
                  }
                }
              }
            );
            
            // Create or overwrite the order document
            await orderDocRef.set(orderData, { merge: true });
            
            try {
              // STEP 2: Update products access
              await updateProductsAccess(userId, checkoutItems);
              
              // STEP 3: Mark order as fully processed with access granted
              await orderDocRef.update({
                accessGranted: true,
                webhookProcessedAt: new Date().toISOString()
              });
              
              // STEP 4: Clear checkout data
              await userDocRef.update({
                checkout: [],
                checkoutTotal: 0,
                checkoutTotalFormatted: '0.00 EUR',
                checkoutCreatedAt: '',
                cart: [],
                selectedArray: []
              });
              
              console.log(`Order created and products access updated for user: ${userId}`);
            } catch (accessError) {
              // If product access update fails, mark the order with error
              console.error(`Order created but access update failed: ${accessError.message}`);
              await orderDocRef.update({
                accessError: accessError.message,
                status: 'error',
                requiresManualAccess: true,
                errorTime: new Date().toISOString()
              });
              
              throw accessError; // Re-throw to be caught by the outer catch
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
              webhookReceived: true
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
            checkoutItems
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
            resolved_time: ''
          });
      }
    }
  }

  return { received: true };
});