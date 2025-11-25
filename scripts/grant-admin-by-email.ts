#!/usr/bin/env ts-node
/**
 * Grant Admin Access by Email
 * 
 * This script grants admin access to a user by their email address
 * 
 * Usage:
 *   npm run grant-admin <email>
 *   
 * Example:
 *   npm run grant-admin user@example.com
 */

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function grantAdminByEmail(email: string): Promise<void> {
  try {
    console.log(`\nLooking up user with email: ${email}...`);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;
    
    console.log(`✓ Found user: ${userRecord.email}`);
    console.log(`  User ID: ${userId}`);
    
    // Set custom claim on Firebase Auth token
    await admin.auth().setCustomUserClaims(userId, { isAdmin: true });
    console.log(`✓ Custom claim set on Auth token`);
    
    // Update Firestore user document
    const userRef = db.collection('users').doc(userId);
    await userRef.set({ isAdmin: true }, { merge: true });
    console.log(`✓ Firestore user document updated`);
    
    console.log(`\n✅ Successfully granted admin access to ${userRecord.email}`);
    console.log(`\n⚠️  IMPORTANT: The user must sign out and sign back in for the changes to take effect.`);
    console.log(`   This is because Firebase custom claims are embedded in the ID token.`);
    
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: No user found with email ${email}`);
      console.log(`\nMake sure the user has signed up first.`);
    } else {
      console.error('\n❌ Error granting admin access:', error);
    }
    throw error;
  }
}

// Main execution
async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.log(`
Grant Admin Access by Email

Usage:
  npm run grant-admin <email>

Example:
  npm run grant-admin user@example.com
    `);
    process.exit(1);
  }
  
  try {
    await grantAdminByEmail(email);
    process.exit(0);
  } catch (error) {
    console.error('\nScript failed');
    process.exit(1);
  }
}

main();
