import { getFirebaseDb } from '../../../utils/firebase';
import Stripe from 'stripe'; // Import Stripe
import { updateProductsAccess } from '../../../utils/productsAccess'; // Assuming this path is correct

// Initialize Stripe (ensure STRIPE_SECRET_KEY is in your .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default defineEventHandler(async (event) => {
  const { orderId } = event.context.params;
  const { userId } = getQuery(event);

  if (!orderId || !userId) {
    // Use createError for proper Nuxt error handling
    throw createError({ statusCode: 400, statusMessage: 'Missing orderId or userId in the request.' });
  }
  
  console.log(`[API_ORDER_STATUS] Initiating check for Order ID: ${orderId}, User ID: ${userId}`);

  const db = getFirebaseDb();
  const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      console.log(`[API_ORDER_STATUS] Order ${orderId} not found in DB. Returning 'pending'.`);
      // Consider if you should attempt a Stripe check even if the order isn't in DB
      // For now, assuming 'pending' if not found, but this might need refinement
      // if a paymentIntent could exist without a DB order record yet.
      return { status: 'pending', orderId };
    }

    let orderData = orderDoc.data();
    console.log(`[API_ORDER_STATUS] Order ${orderId} found in DB. Current status: ${orderData.status}, FulfillmentCompletedAt: ${orderData.fulfillmentCompletedAt || 'N/A'}`);

    // --- START: MODIFICATION 1 - Early exit for fully completed orders ---
    if (orderData.status === 'paid' && orderData.accessGranted === true && orderData.fulfillmentCompletedAt) {
      console.log(`[API_ORDER_STATUS_IDEMPOTENCY] Order ${orderId} already fully processed (paid, accessGranted, fulfillmentCompletedAt is set). API skipping update.`);
      return {
        status: 'paid',
        accessGranted: orderData.accessGranted || false, 
        accessLevel: orderData.accessLevel || 'none',   
        orderId,
        orderItems: orderData.checkoutItems,
        paymentMethod: orderData.payment_infos?.payment_method || ''
      };
    }
    // --- END: MODIFICATION 1 ---

    if (orderData.status === 'pending' && orderData.payment_infos?.paymentIntentId) {
      console.log(`[API_ORDER_STATUS] Order ${orderId} is 'pending'. API checking with Stripe for PI: ${orderData.payment_infos.paymentIntentId}`);
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(orderData.payment_infos.paymentIntentId);
        console.log(`[API_ORDER_STATUS] Stripe PI status for ${orderId}: ${paymentIntent.status}`);

        if (paymentIntent.status === 'succeeded') {
          console.log(`[API_ORDER_STATUS] Stripe confirms PI ${paymentIntent.id} succeeded for order ${orderId}. API performing update.`);
          
          const updatePayload = {
            status: 'paid',
            accessGranted: true,
            accessLevel: 'full', 
            'payment_infos.paymentIntentStatus': paymentIntent.status, 
            webhookMissedAndReconciledAt: new Date().toISOString(), 
            fulfillmentCompletedAt: new Date().toISOString(), 
          };
          await orderDocRef.update(updatePayload);
          console.log(`[API_ORDER_STATUS_UPDATE] Order ${orderId} updated to 'paid' by API. Granting access.`);

          if (orderData.checkoutItems && orderData.checkoutItems.length > 0) {
            await updateProductsAccess(userId, orderData.checkoutItems);
            console.log(`[API_ORDER_STATUS_UPDATE] Product access updated for order ${orderId} by API.`);
          } else {
            console.warn(`[API_ORDER_STATUS] No checkoutItems found on order ${orderId} to grant access for.`);
          }
          
          // Clear cart (optional here, as processing.vue also does it, but good for consistency)
          // const userDocRef = db.collection('users').doc(userId);
          // await userDocRef.update({ cart: [], selectedArray: [], checkout: [] });
          // console.log(`[API_ORDER_STATUS] Cart cleared for user ${userId} for order ${orderId}.`);

          // Update orderData for the response
          orderData = { ...orderData, ...updatePayload }; 
          
          return {
            status: 'paid',
            accessGranted: true,
            accessLevel: orderData.accessLevel,
            orderId,
            orderItems: orderData.checkoutItems, 
            paymentMethod: orderData.payment_infos?.payment_method || ''
          };
        } else if (paymentIntent.status === 'processing') {
          console.log(`[API_ORDER_STATUS] Stripe PI ${paymentIntent.id} for order ${orderId} is still 'processing'. API returning 'pending'.`);
          return { status: 'pending', detail: 'processing_at_stripe', orderId };
        } else { // PI status indicates failure (e.g., 'requires_payment_method', 'canceled')
          console.log(`[API_ORDER_STATUS] Stripe PI ${paymentIntent.id} for order ${orderId} status is '${paymentIntent.status}'. API updating to 'failed'.`);
          
          const failureUpdatePayload = {
            status: 'failed',
            'payment_infos.paymentIntentStatus': paymentIntent.status,
            'payment_infos.last_payment_error': paymentIntent.last_payment_error || { message: `Payment not successful. PI status: ${paymentIntent.status}` },
            failedAt: new Date().toISOString(),
          };

          await orderDocRef.update(failureUpdatePayload); 
          console.log(`[API_ORDER_STATUS_ACTION_FAILURE] Order ${orderId} marked as 'failed' by API due to PI status: ${paymentIntent.status}.`);
          
          orderData = { ...orderData, ...failureUpdatePayload }; 

          return { 
            status: 'failed', 
            error: orderData.payment_infos?.last_payment_error?.message || `Payment not successful. PI status: ${paymentIntent.status}`, 
            orderId 
          };
        }
      } catch (stripeError) {
        console.error(`[API_ORDER_STATUS_ERROR] Error checking PaymentIntent ${orderData.payment_infos.paymentIntentId} with Stripe for order ${orderId}:`, stripeError);
        return { 
          status: orderData.status, 
          error: 'Error communicating with payment provider.', 
          detail: stripeError.message,
          orderId 
        };
      }
    }

    // If not 'pending' or no paymentIntentId, or already processed by Stripe check above, handle normally: // YOUR COMMENT IS PRESERVED HERE
    if (orderData.status === 'error' || orderData.accessError) {
      console.log(`[API_ORDER_STATUS_INFO] Order ${orderId} has status '${orderData.status}' or accessError. Returning error state.`);
      return {
        status: 'error',
        error: orderData.accessError || orderData.error || 'Unknown error',
        orderId,
        paymentMethod: orderData.payment_infos?.payment_method || ''
      };
    }

    if (orderData.status === 'paid') {
      // This log helps understand if the API is returning a 'paid' status that might have been set by the webhook. // YOUR COMMENT PRESERVED
      console.log(`[API_ORDER_STATUS_INFO] Order ${orderId} is 'paid'. FulfillmentCompletedAt: ${orderData.fulfillmentCompletedAt || 'N/A'}. API returning current paid status.`);
      return {
        status: 'paid',
        accessGranted: orderData.accessGranted || false,
        accessLevel: orderData.accessLevel || 'none',
        orderId,
        orderItems: orderData.checkoutItems, 
        paymentMethod: orderData.payment_infos?.payment_method || ''
      };
    }
    
    console.log(`[API_ORDER_STATUS_INFO] Order ${orderId} status is '${orderData.status}'. API returning this status.`);
    return { status: orderData.status || 'pending', orderId };

  } catch (error) {
    console.error(`[API_ORDER_STATUS_ERROR] General error for order ${orderId}:`, error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Server error checking order status', 
      data: { technical: error.message, orderId } 
    });
  }
});