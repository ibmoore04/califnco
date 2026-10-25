import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Califnco Admin Web Dashboard Firebase Client Configuration
 * Uses Vite public environment variables (VITE_FIREBASE_*)
 * Strictly client-side SDK. Never embed server-side private keys.
 */
export const adminFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDFLbddOmzweqt0lsBhVcTW1G2b_fdj6NU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'califnco-assignment-d989e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'califnco-assignment-d989e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'califnco-assignment-d989e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '952118787903',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:952118787903:web:bfba740f2ac042ed7e9d8a',
};

export const isAdminFirebaseConfigured: boolean = Boolean(
  adminFirebaseConfig.apiKey &&
  adminFirebaseConfig.projectId &&
  !adminFirebaseConfig.apiKey.includes('placeholder') &&
  adminFirebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

let adminApp: FirebaseApp | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

if (isAdminFirebaseConfigured) {
  try {
    const existingApp = getApps().find(a => a.name === 'califnco-admin');
    adminApp = existingApp || initializeApp(adminFirebaseConfig, 'califnco-admin');
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    console.log('[Califnco Admin Firebase] Initialized successfully with project:', adminFirebaseConfig.projectId);
  } catch (err) {
    console.warn('[Califnco Admin Firebase] Initialization error, using demo fallback:', err);
    adminApp = null;
    adminAuth = null;
    adminDb = null;
  }
} else {
  console.log('[Califnco Admin Firebase] Running in demo mode (Vite Firebase credentials not configured).');
}

export { adminApp, adminAuth, adminDb };

export const getAdminFirebaseStatus = () => ({
  configured: isAdminFirebaseConfigured,
  projectId: adminFirebaseConfig.projectId || 'demo-mode',
  hasAuth: adminAuth !== null,
  hasFirestore: adminDb !== null,
});
