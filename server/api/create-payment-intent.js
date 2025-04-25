import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use your Stripe Secret Key

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log('Received request body:', body);

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe Secret Key is missing. Check your .env file.');
    }

    // Validate required fields
    if (!body.email || !body.alias) {
      throw new Error('Email and alias are required.');
    }

    // Ensure the amount is an integer
    const amount = parseInt(body.amount, 10);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount. Amount must be a positive integer.');
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Pass the parsed integer amount
      currency: 'eur',
      metadata: {
        email: body.email,
        alias: body.alias,
      },
    });

    console.log('Payment Intent created successfully:', paymentIntent);

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    return { error: error.message };
  }
});