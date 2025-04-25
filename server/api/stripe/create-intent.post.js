import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = getFirestore();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe Secret Key is missing. Check your .env file.');
  }
  if (!body.email || !body.alias || !body.userId) {
    throw new Error('Email, alias, and userId are required.');
  }
  const amount = parseInt(body.amount, 10);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount. Amount must be a positive integer.');
  }

  // 1. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: {
      email: body.email,
      alias: body.alias,
      userId: body.userId,
    },
  });

  // 2. Create Firestore order as 'pending'
  const orderDocRef = db.collection('users').doc(body.userId).collection('orders').doc(paymentIntent.id);
  await orderDocRef.set({
    userId: body.userId,
    paymentIntentId: paymentIntent.id,
    checkoutItems: body.checkoutItems,
    totalPrice: amount / 100,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  return { clientSecret: paymentIntent.client_secret, orderId: paymentIntent.id };
});