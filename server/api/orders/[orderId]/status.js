import { getFirebaseDb } from '../../../utils/firebase';

export default defineEventHandler(async (event) => {
  const { orderId } = event.context.params; // Extract orderId from the route
  const { userId } = getQuery(event); // Extract userId from query parameters

  if (!orderId || !userId) {
    throw new Error('Missing orderId or userId in the request.');
  }
  
  console.log(`Order ID: ${orderId}, User ID: ${userId}`);


  const db = getFirebaseDb();

  try {
    if (!userId) {
      throw new Error('Missing userId in the request. Ensure it is passed as a query parameter.');
    }

    // Query the user's orders subcollection directly
    const orderDoc = await db.collection('users').doc(userId).collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      // Order not found - still pending
      return { status: 'pending' }; // Use 'pending' if that's your desired status
    }

    const orderData = orderDoc.data();

    // Check for explicit error status
    if (orderData.status === 'error' || orderData.accessError) {
      return {
        status: 'error',
        error: orderData.accessError || orderData.error || 'Unknown error',
        orderId,
      };
    }

    // Check if order is paid and has access
    if (orderData.status === 'paid') {
      return {
        status: 'paid',
        accessGranted: orderData.accessGranted || false,
        accessLevel: orderData.accessLevel || 'none',
        orderId,
      };
    }

    // Default: still pending
    return { status: orderData.status || 'pending' };
  } catch (error) {
    console.error(`Error checking order status for ${orderId}:`, error);
    return {
      status: 'error',
      error: 'Server error checking order status',
      technical: error.message,
    };
  }
});