import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  console.error('Current config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
    authDomain: firebaseConfig.authDomain || 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'MISSING',
  });
}

// Initialize Firebase services
let app, auth, db;

try {
  if (missingKeys.length === 0) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Configure Firestore settings for better connection handling
    if (typeof window !== 'undefined' && db) {
      // Enable offline persistence and configure settings
      try {
        // These settings help with connection issues
        db._delegate._databaseId = {
          projectId: firebaseConfig.projectId,
          database: '(default)'
        };
      } catch (error) {
        console.warn('Firestore settings configuration failed:', error);
      }
    }

    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase initialization skipped due to missing configuration');
    auth = null as any;
    db = null as any;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = null as any;
  db = null as any;
}

export { auth, db };
export default app;