import { getFirebaseDb } from '../../utils/firebase';

export default defineEventHandler(async (event) => {
  const { orderId } = event.context.params;
  const { userId } = getQuery(event);

  if (!orderId || !userId) {
    return { success: false, message: 'Missing orderId or userId in the request.' };
  }

  const db = getFirebaseDb();

  try {
    // Fetch the order document from the user's orders subcollection
    const orderDoc = await db.collection('users').doc(userId).collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      return { success: false, message: 'Order not found.' };
    }

    const orderData = orderDoc.data();

    // You can add any transformation here if needed
    return {
      success: true,
      order: {
        id: orderId,
        ...orderData,
      },
    };
  } catch (error) {
    console.error(`Error fetching order details for ${orderId}:`, error);
    return {
      success: false,
      message: 'Server error fetching order details.',
      technical: error.message,
    };
  }
});