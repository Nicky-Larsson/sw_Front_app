import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Simple function to read .env file
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  
  // Split by lines and extract key=value pairs
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.trim().startsWith('#')) return;
    
    // Find the first = character (but not ones in the JSON content)
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const key = line.substring(0, eqIdx).trim();
      let value = line.substring(eqIdx + 1).trim();
      
      // Store in results
      result[key] = value;
    }
  });
  
  return result;
}

async function main() {
  try {
    // Get project root
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(__dirname, '..');
    
    console.log('Starting Firebase test...');
    console.log(`Project root: ${projectRoot}`);
    
    // Read .env file
    const envPath = path.join(projectRoot, '.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ ERROR: .env file not found!');
      process.exit(1);
    }
    
    // Parse .env file
    const envVars = parseEnvFile(envPath);
    
    // Get Firebase service account key
    const serviceAccountString = envVars.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      console.error('❌ ERROR: FIREBASE_SERVICE_ACCOUNT_KEY not found in .env file');
      process.exit(1);
    }
    
    console.log('Found FIREBASE_SERVICE_ACCOUNT_KEY in .env file');
    
    // Parse the service account key JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountString);
      console.log('✅ Successfully parsed service account JSON');
      console.log(`• Project ID: ${serviceAccount.project_id}`);
      console.log(`• Client Email: ${serviceAccount.client_email}`);
    } catch (error) {
      console.error('❌ ERROR: Failed to parse service account JSON:', error.message);
      process.exit(1);
    }
    
    // Initialize Firebase
    try {
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ ERROR: Failed to initialize Firebase Admin SDK:', error.message);
      process.exit(1);
    }
    
    // Test Firestore connection
    try {
      const db = getFirestore();
      console.log('Testing Firestore connection...');
      const testQuery = await db.collection('users').limit(1).get();
      console.log(`✅ Firestore connection successful! (${testQuery.empty ? "No users found" : "Users found"})`);
    } catch (error) {
      console.error('❌ ERROR: Failed to connect to Firestore:', error.message);
      process.exit(1);
    }
    
    console.log('🎉 Success! Your Firebase credentials are working correctly.');
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
}

main();