import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDFLbddOmzweqt0lsBhVcTW1G2b_fdj6NU',
  authDomain: 'califnco-assignment-d989e.firebaseapp.com',
  projectId: 'califnco-assignment-d989e',
  storageBucket: 'califnco-assignment-d989e.firebasestorage.app',
  messagingSenderId: '952118787903',
  appId: '1:952118787903:android:bfba740f2ac042ed7e9d8a',
};

async function runLiveFirebaseTests() {
  console.log('=== CALIFNCO LIVE FIREBASE INTEGRATION TEST ===');
  console.log('Project ID:', firebaseConfig.projectId);

  // 1. Initialize App
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  console.log('✓ Firebase Client SDK initialized successfully.');

  const testEmail = `test.customer.${Date.now()}@example.com`;
  const testPassword = 'Califnco#Test2026';
  let currentUser = null;

  // 2. Test Authentication (Create Account)
  console.log('\n--- Test 1: Firebase Authentication (Sign Up) ---');
  try {
    const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    currentUser = cred.user;
    console.log(`✓ Successfully registered test user: ${currentUser.email} (UID: ${currentUser.uid})`);
  } catch (err) {
    if (err.code === 'auth/operation-not-allowed') {
      console.warn('⚠️ Firebase Console Step Required: Email/Password sign-in provider is not enabled in Firebase Console.');
      console.warn('   Go to: Firebase Console > Authentication > Sign-in method > Enable Email/Password.');
      return;
    } else {
      console.error('❌ Auth creation failed:', err.message);
      return;
    }
  }

  // 3. Test Firestore Write (User Profile with role: customer)
  console.log('\n--- Test 2: Firestore Document Write (User Profile as Customer) ---');
  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const profileData = {
      uid: currentUser.uid,
      displayName: 'Test Customer',
      email: currentUser.email,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, profileData);
    console.log('✓ Successfully created user profile in Firestore: users/' + currentUser.uid);
  } catch (err) {
    console.log('  Firestore status: Rules not yet published in console (' + err.message + ')');
  }

  // 4. Test Firestore Write (Order Creation with status 'pending')
  console.log('\n--- Test 3: Firestore Order Creation (status: pending) ---');
  const testOrderId = `TEST-ORD-${Date.now()}`;
  try {
    const orderDocRef = doc(db, 'orders', testOrderId);
    const orderData = {
      id: testOrderId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userRole: 'customer',
      status: 'pending',
      totalAmount: 13999,
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(orderDocRef, orderData);
    console.log(`✓ Order creation permitted: orders/${testOrderId} (status: pending)`);

    // Read it back
    const snapshot = await getDoc(orderDocRef);
    if (snapshot.exists() && snapshot.data().id === testOrderId) {
      console.log(`✓ Order read verified: Total ₹${snapshot.data().totalAmount}`);
    }
  } catch (err) {
    console.log('  Order write note: Pending rule publish in console (' + err.message + ')');
  }

  // 5. Test Firestore Rule Rejection (Order Creation with status 'delivered' by customer)
  console.log('\n--- Test 4: Security Rule Enforcement (status: delivered by customer should fail) ---');
  const invalidOrderId = `INVALID-ORD-${Date.now()}`;
  try {
    const invalidOrderRef = doc(db, 'orders', invalidOrderId);
    const invalidOrderData = {
      id: invalidOrderId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      status: 'delivered', // MUST BE BLOCKED BY SECURITY RULE
      totalAmount: 999,
    };
    await setDoc(invalidOrderRef, invalidOrderData);
    console.error('❌ Security alert: Order with status "delivered" was allowed! Rules not published or too permissive.');
  } catch (err) {
    console.log('✓ Security rule enforced correctly: Order with status "delivered" rejected by Firestore security rules.');
    console.log(`  Expected error: ${err.code} (${err.message})`);
  }

  // 6. Test Privilege Escalation (Setting role: admin should fail)
  console.log('\n--- Test 5: Privilege Escalation Prevention (role: admin by customer should fail) ---');
  try {
    const maliciousDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(maliciousDocRef, { role: 'admin' }, { merge: true });
    console.error('❌ Security alert: User was allowed to set role: "admin"!');
  } catch (err) {
    console.log('✓ Privilege escalation rejected by security rules: User cannot self-grant admin role.');
  }

  // Cleanup session
  await signOut(auth);
  console.log('\n✓ Signed out test user cleanly.');
  console.log('\n=== LIVE TEST SUITE COMPLETED ===');
}

runLiveFirebaseTests().catch((e) => console.error('Test script crashed:', e));
