import { defineEventHandler, readBody } from 'h3';
import { getFirebaseDb } from '../../../utils/firebase'; // adjust path if needed
import { updateProductsAccess } from '../../../utils/productsAccess.js'; // Import the function



const db = getFirebaseDb();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Log callback data from CMI
    console.log('CMI callback received:', body);
    
    // Extract order info from CMI response
    // const { orderDoc: orderId, userId: userId , checkoutItems :chekoutItems, ProcReturnCode, Response, TransId } = body;

    const { oid: orderId, userId, chekoutItems, ProcReturnCode, Response, TransId } = body;
    
    if (!orderId) {
      console.error('No orderId in CMI callback');
      return { success: false, message: 'Missing orderId' };
    }
    
    // Find the order by searching all users (if userId is not in callback)
    // let orderDoc = null, userId = null, checkoutItems = [];


    // If you store userId in the orderId or callback, use it directly!
    // Otherwise, fallback to searching users (slower, but no composite index needed)
/*     const usersSnapshot = await db.collection('users').get();
    for (const user of usersSnapshot.docs) {
      const docRef = db.collection('users').doc(user.id).collection('orders').doc(orderId);
      const doc = await docRef.get();
      if (doc.exists) {
        orderDoc = doc;
        userId = user.id;
        checkoutItems = doc.data().checkoutItems || [];
        break;
      }
    } */

    const orderDocRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
    const orderDoc = await orderDocRef.get();      
    
    if (!orderDoc) {
      console.error(`Order not found: ${orderId}`);
      return { success: false, message: 'Order not found' };
    }
    
    // Update order status based on CMI response
    if (ProcReturnCode === '00' && Response === 'Approved') {
      await orderDocRef.update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        webhook_answer: {
          payment_method: 'cmi',
          transactionId: TransId,
          authCode: body.AuthCode || '',
          response: body.Response || '',
          cardBrand: body.CardType || '', // if available
          cardLast4: body.PAN || '',      // if available
          // ...other fields as needed
        }
      });


      // **Update products_access for the user**
      // const userId = orderDoc.data()?.userId; // Assuming userId is stored in the order document
      const checkoutItems = orderDoc.data().checkout_infos?.items || []; // Assuming checkoutItems are stored in the order document
      await updateProductsAccess(userId, checkoutItems);

      console.log(`Products access updated for user: ${userId}`);

      // STEP 4: Clear checkout data (add this block)
      await db.collection('users').doc(userId).update({
        checkout: [],
        checkoutTotal: 0,
        checkoutTotalFormatted: '0.00 EUR',
        checkoutCreatedAt: '',
        cart: [],
        selectedArray: [],
      });

      console.log(`Cart cleared for user: ${userId}`);


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