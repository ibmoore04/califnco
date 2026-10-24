/**
 * Califnco Admin Claim Provisioning Script
 * 
 * Usage:
 *   node scripts/set-admin-claim.mjs <USER_UID_OR_EMAIL>
 * 
 * Requirements:
 *   A service account JSON or standard Application Default Credentials (ADC).
 *   Custom claims are cryptographically signed by Firebase Auth and cannot be
 *   forged by client-side SDKs.
 */

import admin from 'firebase-admin';

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.log(`
Usage: node scripts/set-admin-claim.mjs <USER_UID_OR_EMAIL>

Example:
  node scripts/set-admin-claim.mjs admin@califnco.com
  or
  node scripts/set-admin-claim.mjs zbIe2HvDzMhjWqTJqepLvn72U9s1
`);
  process.exit(0);
}

try {
  // Initialize with Application Default Credentials or service account
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'califnco-assignment-d989e',
  });

  const auth = admin.auth();

  let uid = targetIdentifier;

  if (targetIdentifier.includes('@')) {
    const userRecord = await auth.getUserByEmail(targetIdentifier);
    uid = userRecord.uid;
    console.log(`Resolved user email "${targetIdentifier}" to UID: ${uid}`);
  }

  // Set trusted custom claim: { admin: true }
  await auth.setCustomUserClaims(uid, { admin: true });
  console.log(`✓ Successfully granted { admin: true } custom claim to user: ${uid}`);
  console.log('  The user should sign out and sign back in for the new ID token to take effect.');
} catch (err) {
  console.error('Error setting custom claim:', err.message);
  console.log('\nNote: You can also set custom claims via the Firebase CLI / Cloud Functions.');
}
