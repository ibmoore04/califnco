/**
 * Califnco Admin Claim Provisioning Script
 * 
 * Safely grants { admin: true } custom claim to target Firebase Auth user.
 * 
 * Target User UID: KIjD31YuSmdzxDgbjzvGkrxkJra2
 * Firebase Project ID: califnco-assignment-d989e
 * 
 * Security & Integrity Guarantees:
 * 1. Checks that user exists in Firebase Auth before modifying claims.
 * 2. Preserves any existing custom claims on the user record.
 * 3. Does not hardcode or commit any service account private keys.
 * 4. Accepts service account path via GOOGLE_APPLICATION_CREDENTIALS or standard ADC.
 * 5. Updates user's Firestore document to role: 'admin' for UI consistency.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const TARGET_UID = process.argv[2] || 'KIjD31YuSmdzxDgbjzvGkrxkJra2';
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.argv[3];

async function assignAdminClaim() {
  console.log('====================================================');
  console.log('Califnco Administrator Claim Assignment');
  console.log('Project ID: califnco-assignment-d989e');
  console.log('Target UID: ' + TARGET_UID);
  console.log('====================================================\n');

  try {
    let app;

    if (CREDENTIALS_PATH) {
      const resolvedPath = path.resolve(CREDENTIALS_PATH);
      if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
        console.error(`❌ Credentials file not found at: ${resolvedPath}`);
        console.error('\nPlease verify the file path to your downloaded Firebase Service Account JSON key.');
        console.error('To get this file:');
        console.error('1. Go to Firebase Console -> Project Settings -> Service accounts');
        console.error('2. Click "Generate new private key" and download the JSON file');
        console.error('3. Run: node scripts/set-admin-claim.mjs ' + TARGET_UID + ' "C:/path/to/downloaded-key.json"');
        process.exit(1);
      }

      console.log(`[Auth] Loading service account key from: ${resolvedPath}`);
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'califnco-assignment-d989e',
      });
    } else {
      console.log('[Auth] Initializing with Application Default Credentials (ADC)...');
      app = initializeApp({
        projectId: 'califnco-assignment-d989e',
      });
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    // 1. Verify user exists in Firebase Authentication
    console.log(`[Step 1/3] Verifying user existence for UID: ${TARGET_UID}...`);
    let userRecord;
    try {
      userRecord = await auth.getUser(TARGET_UID);
      console.log(`✓ User verified successfully!`);
      console.log(`  - Email:        ${userRecord.email || '(none)'}`);
      console.log(`  - Display Name: ${userRecord.displayName || '(none)'}`);
      console.log(`  - Created At:   ${userRecord.metadata.creationTime}`);
    } catch (userErr) {
      if (userErr.code === 'auth/user-not-found') {
        console.error(`\n❌ Error: No Firebase Auth user found with UID "${TARGET_UID}".`);
        console.error('Please verify the UID or create the user account before assigning administrator claims.');
        process.exit(1);
      }
      throw userErr;
    }

    // 2. Preserve existing claims and set { admin: true }
    console.log(`\n[Step 2/3] Checking and preserving existing custom claims...`);
    const existingClaims = userRecord.customClaims || {};
    console.log('  - Current claims:', JSON.stringify(existingClaims));

    const updatedClaims = {
      ...existingClaims,
      admin: true,
    };

    await auth.setCustomUserClaims(TARGET_UID, updatedClaims);
    console.log(`✓ Successfully assigned custom claims:`, JSON.stringify(updatedClaims));

    // 3. Sync Firestore profile to reflect role 'admin'
    console.log(`\n[Step 3/3] Syncing role in Firestore users/${TARGET_UID}...`);
    try {
      await db.collection('users').doc(TARGET_UID).set(
        {
          role: 'admin',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`✓ Firestore users/${TARGET_UID} updated to role: 'admin'`);
    } catch (fsErr) {
      console.warn(`⚠️ Warning updating Firestore profile: ${fsErr.message}`);
    }

    console.log('\n====================================================');
    console.log('✓ SUCCESS: Administrator claim has been granted!');
    console.log('====================================================');
    console.log('\nNext steps for the administrator:');
    console.log('1. In the web admin / mobile app, sign out and sign back in.');
    console.log('   (Custom claims are embedded in the Firebase ID token and refresh on new token issuance)');
    console.log('2. Alternatively, invoke: await firebase.auth().currentUser.getIdToken(true) to force token refresh.');
    console.log('3. The request.auth.token.admin == true check in firestore.rules will now evaluate to TRUE.');
  } catch (err) {
    console.error('\n❌ Error executing admin assignment:', err.message);
    if (err.message.includes('Could not load the default credentials')) {
      console.error('\nCredential supply instructions:');
      console.error('1. Download service-account.json from Firebase Console:');
      console.error('   Project Settings > Service accounts > Generate new private key');
      console.error('2. Run this command securely (do not commit service-account.json to git):');
      console.error('   node scripts/set-admin-claim.mjs KIjD31YuSmdzxDgbjzvGkrxkJra2 "C:\\path\\to\\service-account.json"');
      console.error('   OR');
      console.error('   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\service-account.json"; node scripts/set-admin-claim.mjs');
    }
    process.exit(1);
  }
}

assignAdminClaim();
