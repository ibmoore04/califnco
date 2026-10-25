import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseAuthProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { UserProfile, Order, Product, DealerProfile, ServiceBooking } from '@shared';

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

/**
 * Parse user-friendly error messages from Firebase error codes
 */
export const formatFirebaseAuthError = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access temporarily disabled. Please reset password or try again later.';
    default:
      return error?.message || 'Authentication error. Please try again.';
  }
};

/**
 * Sign up a new customer with Firebase Auth and initialize their Firestore profile
 * Role is strictly locked to 'customer' to prevent privilege escalation.
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  phone?: string
): Promise<UserProfile> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Running in demo mode.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Update Auth profile display name
  await updateFirebaseAuthProfile(user, {
    displayName: displayName.trim(),
  });

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || email.trim(),
    displayName: displayName.trim(),
    role: 'customer', // Locked to customer - cannot self-grant admin
    phone: phone?.trim(),
    createdAt: new Date().toISOString(),
  };

  // Persist profile to Firestore if Firestore is active
  if (db) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, profile, { merge: true });
    } catch (fsErr) {
      console.warn('[Califnco Firebase] Could not write user profile to Firestore:', fsErr);
    }
  }

  return profile;
};

/**
 * Sign in existing user with Firebase Auth and retrieve their profile
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserProfile> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Running in demo mode.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  let profile: UserProfile = {
    uid: user.uid,
    email: user.email || email.trim(),
    displayName: user.displayName || email.split('@')[0],
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  // Attempt to fetch custom fields (address, phone, role) from Firestore
  if (db) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        profile = {
          ...profile,
          ...data,
          uid: user.uid,
          email: user.email || profile.email,
        } as UserProfile;
      }
    } catch (fsErr) {
      console.warn('[Califnco Firebase] Could not read user profile from Firestore:', fsErr);
    }
  }

  return profile;
};

/**
 * Sign out current Firebase user
 */
export const signOutUser = async (): Promise<void> => {
  if (auth) {
    await firebaseSignOut(auth);
  }
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const subscribeToAuthChanges = (
  onUserChanged: (user: User | null) => void
): (() => void) => {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, onUserChanged);
};

/**
 * Sync order to Firestore if online & authenticated
 */
export const syncOrderToFirestore = async (order: Order): Promise<boolean> => {
  if (!db || !auth || !auth.currentUser) {
    return false;
  }
  try {
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, order);
    console.log('[Califnco Firebase] Order synced to Firestore:', order.id);
    return true;
  } catch (err) {
    console.warn('[Califnco Firebase] Failed to sync order to Firestore:', err);
    return false;
  }
};

/**
 * Fetch orders for authenticated user from Firestore
 */
export const fetchUserOrdersFromFirestore = async (userId: string): Promise<Order[]> => {
  if (!db) {
    return [];
  }
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    return orders;
  } catch (err) {
    console.warn('[Califnco Firebase] Error fetching orders from Firestore:', err);
    return [];
  }
};

/**
 * Fetch products from Firestore backend
 */
export const fetchProductsFromFirestore = async (): Promise<Product[]> => {
  if (!db) {
    return [];
  }
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });
    return products;
  } catch (err) {
    console.warn('[Califnco Firebase] Error fetching products from Firestore:', err);
    return [];
  }
};

/**
 * Submit wholesale dealer application to Firestore
 */
export const submitDealerApplicationToFirestore = async (
  dealerData: Omit<DealerProfile, 'id' | 'userId' | 'status' | 'appliedAt'>
): Promise<DealerProfile | null> => {
  if (!db || !auth || !auth.currentUser) {
    return null;
  }
  const uid = auth.currentUser.uid;
  const application: DealerProfile = {
    id: uid,
    userId: uid,
    businessName: dealerData.businessName || dealerData.companyName || '',
    companyName: dealerData.companyName || dealerData.businessName || '',
    contactPerson: dealerData.contactPerson,
    email: dealerData.email || auth.currentUser.email || '',
    phone: dealerData.phone,
    gstNumber: dealerData.gstNumber.toUpperCase(),
    address: dealerData.address,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  };

  try {
    const dealerDocRef = doc(db, 'dealers', uid);
    await setDoc(dealerDocRef, application);
    console.log('[Califnco Firebase] Dealer application submitted:', uid);
    return application;
  } catch (err) {
    console.warn('[Califnco Firebase] Error submitting dealer application:', err);
    return null;
  }
};

/**
 * Fetch dealer profile / application status for user
 */
export const fetchDealerApplicationFromFirestore = async (
  userId: string
): Promise<DealerProfile | null> => {
  if (!db) {
    return null;
  }
  try {
    const dealerDocRef = doc(db, 'dealers', userId);
    const snapshot = await getDoc(dealerDocRef);
    if (snapshot.exists()) {
      return snapshot.data() as DealerProfile;
    }
    return null;
  } catch (err) {
    console.warn('[Califnco Firebase] Error fetching dealer status:', err);
    return null;
  }
};

/**
 * Create a new service booking in Firestore
 */
export const createServiceBookingInFirestore = async (
  bookingData: Omit<ServiceBooking, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<ServiceBooking | null> => {
  if (!db || !auth || !auth.currentUser) {
    return null;
  }
  const uid = auth.currentUser.uid;
  const bookingId = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const booking: ServiceBooking = {
    id: bookingId,
    userId: uid,
    customerName: bookingData.customerName,
    customerPhone: bookingData.customerPhone,
    serviceType: bookingData.serviceType,
    preferredDate: bookingData.preferredDate,
    preferredTimeSlot: bookingData.preferredTimeSlot || '10:00 AM - 1:00 PM',
    address: bookingData.address,
    notes: bookingData.notes || '',
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const serviceDocRef = doc(db, 'services', bookingId);
    await setDoc(serviceDocRef, booking);
    console.log('[Califnco Firebase] Service booking created:', bookingId);
    return booking;
  } catch (err) {
    console.warn('[Califnco Firebase] Error creating service booking:', err);
    return null;
  }
};

/**
 * Fetch service bookings for authenticated user
 */
export const fetchUserServiceBookingsFromFirestore = async (
  userId: string
): Promise<ServiceBooking[]> => {
  if (!db) {
    return [];
  }
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const bookings: ServiceBooking[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push(docSnap.data() as ServiceBooking);
    });
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return bookings;
  } catch (err) {
    console.warn('[Califnco Firebase] Error fetching service bookings:', err);
    return [];
  }
};

/**
 * Subscribe in real-time to authenticated user's orders from Firestore
 */
export const subscribeUserOrdersFromFirestore = (
  userId: string,
  onUpdate: (orders: Order[]) => void
): (() => void) => {
  if (!db) {
    return () => {};
  }
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as Order);
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(orders);
      },
      (err) => {
        console.warn('[Califnco Firebase] Orders subscription warning:', err);
      }
    );
  } catch (err) {
    console.warn('[Califnco Firebase] Failed to attach orders subscription:', err);
    return () => {};
  }
};

/**
 * Subscribe in real-time to dealer profile / application status for user
 */
export const subscribeDealerApplicationFromFirestore = (
  userId: string,
  onUpdate: (dealer: DealerProfile | null) => void
): (() => void) => {
  if (!db) {
    return () => {};
  }
  try {
    const dealerDocRef = doc(db, 'dealers', userId);
    return onSnapshot(
      dealerDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as DealerProfile);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        console.warn('[Califnco Firebase] Dealer status subscription warning:', err);
      }
    );
  } catch (err) {
    console.warn('[Califnco Firebase] Failed to attach dealer subscription:', err);
    return () => {};
  }
};

/**
 * Subscribe in real-time to service bookings for authenticated user
 */
export const subscribeUserServiceBookingsFromFirestore = (
  userId: string,
  onUpdate: (bookings: ServiceBooking[]) => void
): (() => void) => {
  if (!db) {
    return () => {};
  }
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const bookings: ServiceBooking[] = [];
        snapshot.forEach((docSnap) => {
          bookings.push(docSnap.data() as ServiceBooking);
        });
        bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(bookings);
      },
      (err) => {
        console.warn('[Califnco Firebase] Service bookings subscription warning:', err);
      }
    );
  } catch (err) {
    console.warn('[Califnco Firebase] Failed to attach service bookings subscription:', err);
    return () => {};
  }
};


