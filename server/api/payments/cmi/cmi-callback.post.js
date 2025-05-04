import { defineEventHandler, readBody } from 'h3';
import { getFirebaseDb } from '../../../utils/firebase'; // adjust path if needed
const db = getFirebaseDb();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Log callback data from CMI
    console.log('CMI callback received:', body);
    
    // Extract order info from CMI response
    const { oid: orderId, ProcReturnCode, Response, TransId } = body;
    
    if (!orderId) {
      console.error('No orderId in CMI callback');
      return { success: false, message: 'Missing orderId' };
    }
    
    // Find the order in Firestore
    // Example: "SW-230501-1423-45-CM" (need to search by document ID)
    const ordersSnapshot = await db.collectionGroup('orders')
      .where('paymentMethod', '==', 'cmi')
      .where('status', '==', 'pending')
      .get();
    
    const orderDoc = ordersSnapshot.docs.find(doc => doc.id === orderId);
    
    if (!orderDoc) {
      console.error(`Order not found: ${orderId}`);
      return { success: false, message: 'Order not found' };
    }
    
    // Update order status based on CMI response
    if (ProcReturnCode === '00' && Response === 'Approved') {
      await orderDoc.ref.update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cmi_webhook_answer: {
          transactionId: body.TransId,
          authCode: body.AuthCode, // if available
          response: body.Response,
          cardBrand: body.CardType || '', // if available
          cardLast4: body.PAN || '',      // if available
          // ...other fields as needed
        }
      });
    } else {
      await orderDoc.ref.update({
        status: 'failed',
        failedAt: new Date().toISOString(),
        failureReason: Response || 'Payment failed',
        paymentDetails: body
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error processing CMI callback:', error);
    return { success: false, error: error.message };
  }
});