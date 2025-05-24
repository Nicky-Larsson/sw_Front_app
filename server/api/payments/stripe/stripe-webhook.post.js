import Stripe from 'stripe';
import { getFirebaseDb } from '../../../utils/firebase';
import { readRawBody } from 'h3';
import { updateProductsAccess } from '../../../utils/productsAccess.js';
import { createOrderData } from '../orderTemplate.js'; // Assuming this is correctly defined

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirebaseDb();

export default defineEventHandler(async (event) => {
  console.log('[WEBHOOK] 1. Stripe webhook received!');
  const sig = event.node.req.headers['stripe-signature'];
  const rawBody = await readRawBody(event);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('[WEBHOOK] 2. Signature verified. Event type:', stripeEvent.type);
  } catch (err) {
    console.error('[WEBHOOK_ERROR] Stripe webhook signature verification failed:', err.message);
    return { received: false };
  }

  if (stripeEvent.type === 'payment_intent.succeeded' || stripeEvent.type === 'payment_intent.payment_failed') {
    const paymentIntent = stripeEvent.data.object;
    const { metadata, id, status: paymentIntentStatus } = paymentIntent; // Renamed status
    const userId = metadata?.userId;
    const orderId = metadata?.orderId;
    const paymentMethod = metadata?.paymentMethod || 'stripe';

    console.log(`[WEBHOOK] 3. Processing event: ${stripeEvent.type}, OrderID: ${orderId}, UserID: ${userId}, PI_Status: ${paymentIntentStatus}`);

    if (userId && orderId) {
      console.log(`[WEBHOOK] 4. UserID and OrderID found: UserID=${userId}, OrderID=${orderId}`);
      const userDocRef = db.collection('users').doc(userId);
      const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);

      try {
        console.log(`[WEBHOOK] 5. Attempting to get order document: ${orderDocRef.path}`);
        const orderDoc = await orderDocRef.get();
        const orderDataFromDb = orderDoc.exists ? orderDoc.data() : {};
        const checkoutItems = orderDataFromDb.checkoutItems || [];
        console.log(`[WEBHOOK] 6. Order doc exists: ${orderDoc.exists}. Current DB status: ${orderDataFromDb.status}. CheckoutItems count: ${checkoutItems.length}`);

        // const formattedAmount = paymentIntent.amount / 100; // Your original log
        // console.log('\nAmount before saving:', formattedAmount, typeof formattedAmount); // Your original log

        if (stripeEvent.type === 'payment_intent.succeeded') {
          console.log(`[WEBHOOK] 7. Handling payment_intent.succeeded for OrderID: ${orderId}`);
          try {
            const orderPayload = createOrderData(
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
            console.log(`[WEBHOOK] 8. Attempting to set order (provisional 'paid') for OrderID: ${orderId}. Payload status: ${orderPayload.status}`);
            await orderDocRef.set(orderPayload, { merge: true });
            console.log(`[WEBHOOK] 9. Successfully set order (provisional 'paid') for OrderID: ${orderId}`);

            try {
              console.log(`[WEBHOOK] 10. Attempting updateProductsAccess for OrderID: ${orderId}`);
              await updateProductsAccess(userId, checkoutItems);
              console.log(`[WEBHOOK] 11. Successfully updated products access for OrderID: ${orderId}`);

              const finalUpdatePayload = {
                status: 'paid', accessGranted: true, accessLevel: 'full',
                webhookProcessedAt: new Date().toISOString(),
              };
              console.log(`[WEBHOOK] 12. Attempting final order update (full 'paid') for OrderID: ${orderId}. Payload status: ${finalUpdatePayload.status}`);
              await orderDocRef.update(finalUpdatePayload);
              console.log(`[WEBHOOK] 13. Successfully performed final order update for OrderID: ${orderId}`);

              // console.log('Saving order with checkoutItems:', checkoutItems); // Your original log

              console.log(`[WEBHOOK] 14. Attempting to clear cart for UserID: ${userId}`);
              await userDocRef.update({
                checkout: [], checkoutTotal: 0, checkoutTotalFormatted: '0.00 EUR',
                checkoutCreatedAt: '', cart: [], selectedArray: [],
              });
              console.log(`[WEBHOOK] 15. Successfully cleared cart for UserID: ${userId}. Order ${orderId} processed.`);

            } catch (accessError) {
              console.error(`[WEBHOOK_ERROR] 16a. Inner catch (accessError) for OrderID ${orderId}: ${accessError.message}`, accessError);
              await orderDocRef.update({
                accessError: accessError.message, status: 'error', // Or 'paid_access_issue'
                errorTime: new Date().toISOString(),
              });
              try {
                await userDocRef.update({
                  checkout: [],
                  checkoutTotal: 0,
                  checkoutTotalFormatted: '0.00 EUR',
                  checkoutCreatedAt: '',
                  cart: [],
                  selectedArray: [],
                });
                console.log(`[WEBHOOK] Cart cleared for user ${userId} despite accessError for order ${orderId}.`);
              } catch (clearCartError) {
                console.error(`[WEBHOOK_ERROR] Failed to clear cart for user ${userId} after accessError for order ${orderId}: ${clearCartError.message}`);
              }
              throw accessError;
            }
          } catch (orderError) {
            console.error(`[WEBHOOK_ERROR] 16b. Outer catch (orderError) for OrderID ${orderId}: ${orderError.message}`, orderError);
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
            throw orderError;
          }
        } else { // payment_intent.payment_failed
          console.log(`[WEBHOOK] 17. Handling payment_intent.payment_failed for OrderID: ${orderId}`);
          const failedOrderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId + '_failed');
          await failedOrderDocRef.set({
            status: 'failed',
            failedAt: new Date().toISOString(),
            error: paymentIntent.last_payment_error?.message || 'Payment failed',
            checkoutItems,
          });
        }
      } catch (err) {
        console.error(`[WEBHOOK_ERROR] 18. Outermost catch for OrderID ${orderId}: ${err.message}`, err);
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
    } else {
      console.log('[WEBHOOK] 19. Missing UserID or OrderID in metadata. PI_ID:', id);
    }
  } else {
    console.log('[WEBHOOK] 20. Event type not handled for detailed processing:', stripeEvent.type);
  }

  return { received: true };
});