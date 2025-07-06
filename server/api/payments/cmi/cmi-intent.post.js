import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import crypto from 'crypto';
import { getFirebaseDb } from '../../../utils/firebase';
import { createOrderData } from '../orderTemplate';
import { updateProductsAccess } from '../../../utils/productsAccess.js'; // Import the function
import { checkDatabaseHealth } from '../../../utils/databaseHealth';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const db = getFirebaseDb();

  try {
    // CRITICAL: Check database health before creating payment
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.success) {
      console.error('CMI payment rejected due to database issue:', dbHealth.message);
      return {
        success: false,
        message: `We're experiencing technical difficulties. Please try again in a few minutes. (Database issue)`
      };
    }

    const body = await readBody(event);
    // Rest of your code...
  } catch (error) {
    console.error('Error processing CMI callback:', error);
    return { success: false, error: error.message };
  }

  try {
    // Validate inputs
    if (!body.email || !body.userId || !body.amount) { // body.amount is expected to be in cents here
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: email, userId, amount'
      });
    }

    // Generate order ID
    const now = new Date();
    const dateCode = now.getFullYear().toString().slice(2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const timeCode = now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
    const randomPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const orderId = `SW-${dateCode}-${timeCode}-${randomPart}-CM`; // CM for CMI

    // CMI specific parameters
    const storeKey = config.cmiStoreKey;
    const storeName = config.cmiStoreName;

    // Assuming body.amount is the total in cents from the client
    const totalPriceCents = parseInt(body.amount, 10); 
    const totalPriceEuros = Number((totalPriceCents / 100).toFixed(2)); // e.g. 5.98
    
    // amountMAD is what CMI will actually process
    const amountMAD = Number((totalPriceEuros * 10.41).toFixed(2)); // e.g. 62.27

    console.log("CMI amount in MAD:", amountMAD);
    console.log("CMI amount in Euros (for DB):", totalPriceEuros);
    console.log("CMI amount in Cents (for DB):", totalPriceCents);
    console.log("CMI orderId:", orderId);

    // Create hash for CMI security
    const currencyCode = '504'; // 504 is MAD for CMI
    // The hash MUST be based on the amount and currency CMI will process (amountMAD and currencyCode '504')
    const hashString = `${storeKey}${orderId}${amountMAD}${currencyCode}${storeKey}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Store order in Firestore
    const orderDocRef = db.collection('users').doc(body.userId).collection('orders').doc(orderId);

    await orderDocRef.set(
      createOrderData(body, 'cmi', {
        orderId,
        currency: 'EUR', // Standardize to 'EUR' for your database records
        totalPrice: totalPriceEuros,    // Pass the Euro value
        totalPriceCents: totalPriceCents, // Pass the Cent value
        payment_infos: {
          payment_provider:'cmi',
          payment_method: 'CMI',
          cmiOrderId: orderId, // CMI uses your orderId
          payment_email_id: body.email,
          sent_metadata: body.metadata || {},
        },
        extraFields: {
          totalPriceDhirhams: amountMAD // Store the MAD amount for reference if needed
        }
        // Add other provider-specific fields if needed
      })
    );

    const isDev = process.env.CMI_ENV === 'TEST';
    if (isDev && !config.cmiStoreKey) {
      return {
        success: true,
        cmiUrl: '/checkout/cmiPaymentPage',
        formData: {
          // amount: amountMAD, // send MAD to CMI
          amountMAD: amountMAD, 
          amountEuros: totalPriceEuros, // ✅ FIXED - Use the existing variable
          oid: orderId,
          okUrl: `/checkout/processing?orderId=${orderId}&source=cmi`,
          failUrl: `/checkout/checkout`,
        },
        orderId: orderId
      };
    }

    // Simulate payment confirmation (replace this with actual CMI callback handling)
    const paymentStatus = 'succeeded'; // Simulate a successful payment status
    if (paymentStatus === 'succeeded') {
      // Update order status to paid
      await orderDocRef.update({
        status: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payment_infos: {
          payment_provider: 'cmi',
          payment_intentId: orderId,
          payment_intentStatus: 'succeeded',
          payment_email_id: body.email,
        }
      });

      // **Update products_access for the user**
      const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : [];
      await updateProductsAccess(body.userId, checkoutItems);

      return {
        success: true,
        orderId
      };
    }

    // Return CMI form data
    return {
      success: true,
      cmiUrl: config.cmiPaymentUrl, // From your .env
      formData: {
        clientid: storeName,
        amountMAD: amountMAD, 
        amountEuros: totalPriceEuros, // ✅ FIXED - Use the existing variable
        currency: currencyCode,
        oid: orderId,
        okUrl: `/checkout/processing?orderId=${orderId}&source=cmi`,
        failUrl: `/checkout/purchaseFailed`,   // ${config.public.siteUrl}
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