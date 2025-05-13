import { getFirebaseDb } from './firebase';

/**
 * Checks if Firebase database is accessible and working properly
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const checkDatabaseHealth = async () => {
  const db = getFirebaseDb();
  
  try {
    // 1. Simple write test
    const testDocRef = db.collection('system').doc('health_check');
    await testDocRef.set({
      lastCheck: new Date().toISOString(),
      status: 'ok'
    });
    
    // 2. Simple read test
    const testDoc = await testDocRef.get();
    if (!testDoc.exists) {
      return {
        success: false,
        message: 'Database write succeeded but read failed'
      };
    }
    
    return {
      success: true,
      message: 'Database is healthy'
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      success: false,
      message: `Database check failed: ${error.message}`
    };
  }
};