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
    let paymentMethod = metadata?.paymentMethod || 'stripe';

    if (paymentMethod === 'GOOGLE_PAY') {
      paymentMethod = 'GOOGLE PAY';
    }

    // const paymentMethod = 'STRIPE';

    console.log(`[WEBHOOK] 3. Processing event: ${stripeEvent.type}, OrderID: ${orderId}, UserID: ${userId}, PI_Status: ${paymentIntentStatus}`);

    if (userId && orderId) {
      const userDocRef = db.collection('users').doc(userId);
      const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);

      try {
        console.log(`[WEBHOOK] 5. Attempting to get order document: ${orderDocRef.path}`);
        const orderDoc = await orderDocRef.get();
        const orderDataFromDb = orderDoc.exists ? orderDoc.data() : {};
        // const checkoutItems = orderDataFromDb.checkoutItems || [];


        const checkoutItems = orderDataFromDb.checkout_infos?.items || [];
        if (checkoutItems.length === 0) {
          console.warn(`[API_ORDER_STATUS] No items found in checkout_infos.items for order ${orderId}.`);
        }

        console.log(`[WEBHOOK] 6. Order doc exists: ${orderDoc.exists}. Current DB status: ${orderDataFromDb.status}. FulfillmentCompletedAt: ${orderDataFromDb.fulfillmentCompletedAt || 'N/A'}. CheckoutItems count: ${checkoutItems.length}`);

        if (stripeEvent.type === 'payment_intent.succeeded') {

          // +++ START IDEMPOTENCY CHECK (MODIFIED) +++
          if (orderDoc.exists && orderDataFromDb.status === 'paid' && orderDataFromDb.accessGranted === true && orderDataFromDb.fulfillmentCompletedAt) { 
            console.log(`[WEBHOOK_IDEMPOTENCY] OrderID ${orderId} already fully processed (paid, accessGranted, fulfillmentCompletedAt is set). Webhook skipping update.`);
            return { received: true, message: 'Event for already fully processed order.' }; 
          }
          // +++ END IDEMPOTENCY CHECK +++

          console.log(`[WEBHOOK] 7. Handling payment_intent.succeeded for OrderID: ${orderId}`);
          try {
            const orderPayload = createOrderData(
              {
                userId,
                email: metadata.email,
                alias: metadata.alias,
                checkoutItems,
                amount: parseFloat((paymentIntent.amount / 100).toFixed(2)),
                status: 'paid', // Webhook can set to 'paid' directly if it's going to do full processing
                accessLevel: 'provisional', // Or keep provisional if preferred, then update to 'full'
                provisionalExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              },
              paymentMethod,
              {
                orderId,
                currency: paymentIntent.currency,
                totalPrice: parseFloat((paymentIntent.amount / 100).toFixed(2)),
                totalPriceCents: paymentIntent.amount, // <-- ADD THIS LINE
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
                    paidAt: new Date().toISOString(), // This is when webhook processed it
                  },
                },
              }
            );
            console.log(`[WEBHOOK] 8. Attempting to set/merge order for OrderID: ${orderId}. Payload status: ${orderPayload.status}`);
            await orderDocRef.set(orderPayload, { merge: true }); // Use merge:true if order might partially exist
            console.log(`[WEBHOOK_ACTION_UPDATE] 9. Order set/merged by Webhook for OrderID: ${orderId}`);

            try {
              console.log(`[WEBHOOK] 10. Attempting updateProductsAccess for OrderID: ${orderId}`);
              await updateProductsAccess(userId, checkoutItems); // This is idempotent
              console.log(`[WEBHOOK_ACTION_UPDATE] 11. Products access updated by Webhook for OrderID: ${orderId}`);

              const finalUpdatePayload = {
                status: 'paid', // Ensure final status is 'paid'
                accessGranted: true, 
                accessLevel: 'full', // Final access level
                webhookProcessedAt: new Date().toISOString(), // Specific timestamp for webhook full processing
                fulfillmentCompletedAt: new Date().toISOString(), 
              };
              console.log(`[WEBHOOK] 12. Attempting final order update (full 'paid') for OrderID: ${orderId}. Payload status: ${finalUpdatePayload.status}`);
              await orderDocRef.update(finalUpdatePayload);
              console.log(`[WEBHOOK_ACTION_UPDATE] 13. Final order update performed by Webhook for OrderID: ${orderId}`);

              console.log(`[WEBHOOK] 14. Attempting to clear cart for UserID: ${userId}`);
              await userDocRef.update({
                checkout: [], checkoutTotal: 0, checkoutTotalFormatted: '0.00 EUR',
                checkoutCreatedAt: '', cart: [], selectedArray: [],
              });
              console.log(`[WEBHOOK_ACTION_UPDATE] 15. Cart cleared by Webhook for UserID: ${userId}. Order ${orderId} processing complete.`);

            } catch (accessError) {
              console.error(`[WEBHOOK_ERROR] 16a. Inner catch (accessError) for OrderID ${orderId}: ${accessError.message}`, accessError);
              await orderDocRef.update({
                accessError: accessError.message, status: 'error', 
                errorTime: new Date().toISOString(),
                webhookAttemptedAt: new Date().toISOString(), // Mark webhook attempt
              });
              console.log(`[WEBHOOK_ACTION_ERROR_STATE] Order ${orderId} status set to 'error' by Webhook due to accessError: ${accessError.message}`);
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
              throw accessError; // Re-throw to be caught by outer catch if necessary
            }
          } catch (orderError) {
            console.error(`[WEBHOOK_ERROR] 16b. Outer catch (orderError) for OrderID ${orderId}: ${orderError.message}`, orderError);
            await orderDocRef.set({ // Using .set() here as a fallback if the initial set/merge failed
              status: 'error',
              error: orderError.message,
              errorTime: new Date().toISOString(),
              paymentIntentId: paymentIntent.id,
              userId,
              orderId,
              webhookAttemptedAt: new Date().toISOString(), // Mark webhook attempt
            }, { merge: true }); // Merge in case some fields were set before error
            console.log(`[WEBHOOK_ACTION_ERROR_STATE] Order ${orderId} status set to 'error' by Webhook due to orderError: ${orderError.message}`);
            throw orderError; // Re-throw
          }
        } else { // payment_intent.payment_failed
          console.log(`[WEBHOOK] 17. Handling payment_intent.payment_failed for OrderID: ${orderId}`);
          // Decide if you want to update the main order or a separate _failed order
          // Updating main order:
          await orderDocRef.update({ 
            status: 'failed',
            failedAt: new Date().toISOString(),
            'payment_infos.last_payment_error': paymentIntent.last_payment_error || { message: 'Payment failed per webhook event' },
            'payment_infos.paymentIntentStatus': paymentIntentStatus,
            webhookProcessedAt: new Date().toISOString(), 
          });
          console.log(`[WEBHOOK_ACTION_FAILURE] Order ${orderId} marked as 'failed' by Webhook due to event: ${stripeEvent.type}, PI_Status: ${paymentIntentStatus}.`);
        }
      } catch (err) {
        console.error(`[WEBHOOK_ERROR] 18. Outermost catch for OrderID ${orderId}: ${err.message}`, err);
        await db
          .collection('logs')
          .doc('orderReports')
          .collection('stripeOrders')
          .doc(orderId + '_webhook_error_internal') // Differentiate log source
          .set({
            userId,
            orderId,
            email: metadata.email,
            alias: metadata.alias,
            paymentIntentId: paymentIntent.id,
            attemptedEvent: stripeEvent.type,
            error: err.message,
            status: 'unresolved_webhook_error',
            error_time: new Date().toISOString(),
            resolved_time: '',
          });
      }
    } else {
      console.log('[WEBHOOK_WARN] 19. Missing UserID or OrderID in metadata. PI_ID:', id);
    }
  } else {
    console.log('[WEBHOOK_INFO] 20. Event type not handled for detailed processing:', stripeEvent.type);
  }

  return { received: true };
});