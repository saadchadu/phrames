#!/usr/bin/env ts-node
/**
 * Initialize Admin Settings Script
 * 
 * This script initializes default system settings and plan pricing in Firestore
 * Run this once during initial admin dashboard setup
 * 
 * Usage:
 *   npm run init-admin-settings
 */

import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

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

const db = admin.firestore();

const DEFAULT_SYSTEM_SETTINGS = {
  freeCampaignEnabled: true,
  newCampaignsEnabled: true,
  newSignupsEnabled: true,
  enabledPlans: {
    week: true,
    month: true,
    '3month': true,
    '6month': true,
    year: true,
  },
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedBy: 'system',
};

const DEFAULT_PLAN_PRICING = {
  week: 99,
  month: 299,
  '3month': 799,
  '6month': 1499,
  year: 2499,
  currency: 'INR',
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedBy: 'system',
};

async function main() {
  try {
    console.log('Initializing default admin settings...\n');
    
    // Initialize system settings
    const systemRef = db.collection('settings').doc('system');
    const systemSnap = await systemRef.get();

    if (!systemSnap.exists) {
      await systemRef.set(DEFAULT_SYSTEM_SETTINGS);
      console.log('✓ Default system settings initialized');
    } else {
      console.log('✓ System settings already exist');
    }

    // Initialize plan pricing
    const pricingRef = db.collection('settings').doc('plans');
    const pricingSnap = await pricingRef.get();

    if (!pricingSnap.exists) {
      await pricingRef.set(DEFAULT_PLAN_PRICING);
      console.log('✓ Default plan pricing initialized');
    } else {
      console.log('✓ Plan pricing already exists');
    }
    
    console.log('\n✅ Successfully initialized default settings');
    console.log('\nDefault settings created:');
    console.log('- System settings: /settings/system');
    console.log('- Plan pricing: /settings/plans');
    console.log('\nYou can now access the admin dashboard to modify these settings.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
}

main();
