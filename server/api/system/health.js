import { checkDatabaseHealth } from '../../utils/databaseHealth';

export default defineEventHandler(async (event) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    return {
      success: true,
      database: dbHealth,
      server: { status: 'ok' }
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});