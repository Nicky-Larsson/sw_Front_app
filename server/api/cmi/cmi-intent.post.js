import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import crypto from 'crypto';
import { getFirebaseDb } from '../../utils/firebase';


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  

  const db = getFirebaseDb();
  
  try {
    const body = await readBody(event);
    // Rest of your code...
  } catch (error) {
    console.error('Error processing CMI callback:', error);
    return { success: false, error: error.message };
  }


  try {
    // Validate inputs
    if (!body.email || !body.userId || !body.amount) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Missing required parameters: email, userId, amount' 
      });
    }
    
    // Generate order ID 
    const now = new Date();
    const dateCode = now.getFullYear().toString().slice(2) + 
                    (now.getMonth()+1).toString().padStart(2,'0') + 
                    now.getDate().toString().padStart(2,'0');
    const timeCode = now.getHours().toString().padStart(2,'0') + 
                    now.getMinutes().toString().padStart(2,'0');
    const randomPart = Math.floor(Math.random()*100).toString().padStart(2,'0');
    const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-CM`; // CM for CMI
    
    // CMI specific parameters
    const storeKey = config.cmiStoreKey;
    const storeName = config.cmiStoreName;
    const amount = Math.round(body.amount / 100).toString(); // Convert cents to MAD
    
    // Create hash for CMI security
    const currencyCode = '504'; // 504 is MAD
    const hashString = `${storeKey}${orderId}${amount}${currencyCode}${storeKey}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    // Store order in Firestore
    const orderDocRef = db.collection('users').doc(body.userId).collection('orders').doc(orderId);
    
    await orderDocRef.set({
      userId: body.userId,
      checkoutItems: body.checkoutItems,
      totalAmount: body.amount / 100,
      status: 'pending',
      paymentMethod: 'cmi',
      createdAt: new Date().toISOString()
    });
    

    const isDev = process.env.CMI_ENV === 'TEST';
    if (isDev && !config.cmiStoreKey) {
      // Return mock payment URL instead of actual CMI URL
      return {
        success: true,
        cmiUrl: `/mock-cmi-payment`, // Local route to mock page
        formData: {
          amount: amount,
          oid: orderId,
          okUrl: `${config.public.siteUrl}/checkout/purchaseSuccess`,
          failUrl: `${config.public.siteUrl}/checkout/checkout`,
        },
        orderId: orderId
      };
    }

    // Return CMI form data
    return {
      success: true,
      cmiUrl: config.cmiPaymentUrl, // From your .env
      formData: {
        clientid: storeName,
        amount: amount,
        currency: currencyCode,
        oid: orderId,
        okUrl: `${config.public.siteUrl}/checkout/purchaseSuccess`,
        failUrl: `${config.public.siteUrl}/checkout/purchaseFailed`,
        lang: 'fr',
        hash: hash,
        storetype: '3d_pay_hosting',
        refreshtime: '5'
      },
      orderId: orderId
    };
  } catch (error) {
    console.error('CMI payment creation failed:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || 'Failed to create CMI payment'
    });
  }
});