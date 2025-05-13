import { getFirebaseDb } from '../../utils/firebase';

export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event); // Extract userId from query parameters

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId in the request.',
    });
  }

  try {
    const db = getFirebaseDb();
    const ordersSnapshot = await db.collection('users').doc(userId).collection('orders').get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders. Please try again later.',
    });
  }
});