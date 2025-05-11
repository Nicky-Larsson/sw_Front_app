import { getFirebaseDb } from '../../../utils/firebase';

export default defineEventHandler(async (event) => {
  const orderId = event.context.params.orderId;
  const db = getFirebaseDb();
  
  try {
    // Try to find the order in any user collection
    const ordersRef = db.collectionGroup('orders')
      .where('orderId', '==', orderId);
    
    const snapshot = await ordersRef.get();
    
    if (snapshot.empty) {
      // Order not found - still processing or doesn't exist
      return { status: 'processing' };
    }
    
    // Get the order data
    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();
    
    // Check if there was an error during processing
    if (orderData.status === 'error') {
      return {
        status: 'error',
        error: orderData.error || 'Unknown error',
        orderId
      };
    }
    
    // Check if order is paid and access was granted
    if (orderData.status === 'paid') {
      return {
        status: 'paid',
        accessGranted: orderData.accessGranted || false,
        orderId
      };
    }
    
    // Otherwise still processing
    return { status: 'processing' };
  } catch (error) {
    console.error(`Error checking order status for ${orderId}:`, error);
    return { 
      status: 'error', 
      error: 'Server error checking order status'
    };
  }
});