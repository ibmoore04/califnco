import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Califnco Firebase Client Configuration
 * Reads from Expo-compatible public environment variables (EXPO_PUBLIC_*)
 * Safe for Expo Go and client builds. Never embed private service account keys here.
 */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Determine if valid Firebase credentials are provided.
 * If credentials are missing or default placeholders, the application
 * gracefully falls back to local demo mode without crashing.
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('placeholder') &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Califnco Firebase] Initialized successfully with project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Califnco Firebase] Initialization error, falling back to local demo mode:', err);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.log('[Califnco Firebase] Running in local demo mode (Firebase credentials not configured).');
}

export { app, auth, db };

/**
 * Helper to check connection status
 */
export const getFirebaseStatus = () => ({
  configured: isFirebaseConfigured,
  projectId: firebaseConfig.projectId || 'demo-mode',
  hasAuth: auth !== null,
  hasFirestore: db !== null,
});
