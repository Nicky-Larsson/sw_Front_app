import Stripe from 'stripe';
import { getFirebaseDb } from '../../../utils/firebase';
import { readRawBody } from 'h3';
const db = getFirebaseDb();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
      try {
        if (stripeEvent.type === 'payment_intent.succeeded') {
          await orderDocRef.update({
            status: 'paid',
            webhook_answer: {
              paidAt: new Date().toISOString(),
              paymentIntentId: paymentIntent.id,
              paymentIntentStatus: paymentIntent.status,
              paymentMethodType: paymentIntent.payment_method_types?.[0] || '', // e.g. 'card'
              paymentBrand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand || '', // e.g. 'visa'
              paymentLast4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || '', // last 4 digits
              paymentCountry: paymentIntent.charges?.data?.[0]?.country || '', // card country
            }
          });
        } else {
          await orderDocRef.update({
            status: 'failed',
            failedAt: new Date().toISOString(),
            error: paymentIntent.last_payment_error?.message || 'Payment failed'
          });
        }
      } catch (err) {
        // Optionally log for manual review
        await db.collection('orderReports').doc('stripeOrders').collection(orderId).add({
          userId,
          attemptedUpdate: { status: stripeEvent.type === 'payment_intent.succeeded' ? 'paid' : 'failed' },
          error: err.message,
          status: 'unresolved',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  return { received: true };
});