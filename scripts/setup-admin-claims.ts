#!/usr/bin/env ts-node
/**
 * Setup Admin Custom Claims Script
 * 
 * This script sets the isAdmin custom claim on Firebase Auth tokens
 * Run this script to grant or revoke admin access to users
 * 
 * Usage:
 *   npm run setup-admin-claims <userId> <true|false>
 *   
 * Example:
 *   npm run setup-admin-claims abc123xyz true
 *   npm run setup-admin-claims abc123xyz false
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

/**
 * Set admin custom claim and update Firestore
 */
async function setAdminAccess(userId: string, isAdmin: boolean): Promise<void> {
  try {
    console.log(`Setting admin access for user ${userId} to ${isAdmin}...`);
    
    // Set custom claim on Firebase Auth token
    await admin.auth().setCustomUserClaims(userId, { isAdmin });
    console.log(`✓ Custom claim set on Auth token`);
    
    // Update Firestore user document
    const userRef = db.collection('users').doc(userId);
    await userRef.set({ isAdmin }, { merge: true });
    console.log(`✓ Firestore user document updated`);
    
    // Verify the user exists
    const userRecord = await admin.auth().getUser(userId);
    console.log(`✓ User verified: ${userRecord.email}`);
    
    console.log(`\n✅ Successfully ${isAdmin ? 'granted' : 'revoked'} admin access for ${userRecord.email}`);
    console.log(`\nNote: The user will need to sign out and sign back in for the changes to take effect.`);
  } catch (error) {
    console.error('❌ Error setting admin access:', error);
    throw error;
  }
}

/**
 * Sync admin status from Firestore to custom claims for a user
 */
async function syncAdminClaim(userId: string): Promise<void> {
  try {
    console.log(`Syncing admin claim for user ${userId}...`);
    
    // Get user data from Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found in Firestore`);
    }
    
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(userId, { isAdmin });
    console.log(`✓ Custom claim synced: isAdmin = ${isAdmin}`);
    
    const userRecord = await admin.auth().getUser(userId);
    console.log(`✅ Successfully synced admin claim for ${userRecord.email}`);
  } catch (error) {
    console.error('❌ Error syncing admin claim:', error);
    throw error;
  }
}

/**
 * Sync all users' admin claims from Firestore
 */
async function syncAllAdminClaims(): Promise<void> {
  try {
    console.log('Syncing admin claims for all users...\n');
    
    // Get all users with isAdmin field
    const usersSnapshot = await db.collection('users').where('isAdmin', '==', true).get();
    
    console.log(`Found ${usersSnapshot.size} admin users in Firestore`);
    
    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();
      
      try {
        await admin.auth().setCustomUserClaims(userId, { isAdmin: true });
        console.log(`✓ Synced admin claim for user ${userId} (${userData.email})`);
      } catch (error) {
        console.error(`✗ Failed to sync user ${userId}:`, error);
      }
    }
    
    console.log(`\n✅ Finished syncing admin claims`);
  } catch (error) {
    console.error('❌ Error syncing all admin claims:', error);
    throw error;
  }
}

/**
 * List all users with admin access
 */
async function listAdmins(): Promise<void> {
  try {
    console.log('Listing all admin users...\n');
    
    // Get users from Firestore
    const usersSnapshot = await db.collection('users').where('isAdmin', '==', true).get();
    
    if (usersSnapshot.empty) {
      console.log('No admin users found in Firestore');
      return;
    }
    
    console.log(`Found ${usersSnapshot.size} admin user(s):\n`);
    
    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const userData = doc.data();
      
      // Check if custom claim is set
      try {
        const userRecord = await admin.auth().getUser(userId);
        const hasCustomClaim = userRecord.customClaims?.isAdmin === true;
        
        console.log(`- ${userData.email || 'No email'}`);
        console.log(`  User ID: ${userId}`);
        console.log(`  Firestore isAdmin: ${userData.isAdmin}`);
        console.log(`  Custom Claim: ${hasCustomClaim ? '✓ Set' : '✗ Not set'}`);
        console.log('');
      } catch (error) {
        console.log(`- User ${userId} (Error fetching details)`);
        console.log('');
      }
    }
  } catch (error) {
    console.error('❌ Error listing admins:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Admin Custom Claims Setup Script

Usage:
  npm run setup-admin-claims set <userId> <true|false>  - Set admin access for a user
  npm run setup-admin-claims sync <userId>              - Sync admin claim from Firestore
  npm run setup-admin-claims sync-all                   - Sync all admin claims
  npm run setup-admin-claims list                       - List all admin users

Examples:
  npm run setup-admin-claims set abc123xyz true
  npm run setup-admin-claims sync abc123xyz
  npm run setup-admin-claims sync-all
  npm run setup-admin-claims list
    `);
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'set': {
        const userId = args[1];
        const isAdminStr = args[2];
        
        if (!userId || !isAdminStr) {
          console.error('Error: Missing arguments');
          console.log('Usage: npm run setup-admin-claims set <userId> <true|false>');
          process.exit(1);
        }
        
        const isAdmin = isAdminStr.toLowerCase() === 'true';
        await setAdminAccess(userId, isAdmin);
        break;
      }
      
      case 'sync': {
        const userId = args[1];
        
        if (!userId) {
          console.error('Error: Missing userId');
          console.log('Usage: npm run setup-admin-claims sync <userId>');
          process.exit(1);
        }
        
        await syncAdminClaim(userId);
        break;
      }
      
      case 'sync-all': {
        await syncAllAdminClaims();
        break;
      }
      
      case 'list': {
        await listAdmins();
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Valid commands: set, sync, sync-all, list');
        process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

main();
