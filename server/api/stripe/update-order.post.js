import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, orderId, status, paymentIntent, error } = body;
  const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);

  try {
    await orderDocRef.update({
      status,
      ...(status === 'paid' && { paidAt: new Date().toISOString(), paymentIntent }),
      ...(status === 'failed' && { failedAt: new Date().toISOString(), error })
    });
    return { success: true };
  } catch (err) {
    // Log to orderReports for manual review
    await db.collection('orderReports').doc('stripeOrders').collection(orderId).add({
      userId,
      attemptedUpdate: { status },
      error: err.message,
      status: 'unresolved',
      timestamp: new Date().toISOString()
    });
    // Still return success if payment succeeded, so user gets access
    return { success: true, warning: 'Order update failed, but payment succeeded. Please contact support if you have issues.' };
  }
});