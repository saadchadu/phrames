/**
 * Script to initialize discount settings in Firestore
 * Run with: npx tsx scripts/initialize-discounts.ts
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
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

async function initializeDiscounts() {
  try {
    console.log('Initializing discount settings...');

    // Get current plans
    const plansRef = db.collection('settings').doc('plans');
    const plansDoc = await plansRef.get();
    
    if (!plansDoc.exists) {
      console.log('Plans document does not exist. Creating with default values...');
      await plansRef.set({
        week: 99,
        month: 299,
        '3month': 799,
        '6month': 1499,
        year: 2499,
        discounts: {
          week: 0,
          month: 0,
          '3month': 0,
          '6month': 0,
          year: 0,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'system',
      });
    } else {
      // Add discounts field if it doesn't exist
      const data = plansDoc.data();
      if (!data?.discounts) {
        console.log('Adding discounts field to existing plans...');
        await plansRef.update({
          discounts: {
            week: 0,
            month: 0,
            '3month': 0,
            '6month': 0,
            year: 0,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        console.log('Discounts field already exists.');
      }
    }

    // Update system settings to add offersEnabled flag
    const systemRef = db.collection('settings').doc('system');
    const systemDoc = await systemRef.get();
    
    if (!systemDoc.exists) {
      console.log('System document does not exist. Creating with default values...');
      await systemRef.set({
        freeCampaignEnabled: true,
        newCampaignsEnabled: true,
        newSignupsEnabled: true,
        offersEnabled: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'system',
      });
    } else {
      const data = systemDoc.data();
      if (data?.offersEnabled === undefined) {
        console.log('Adding offersEnabled flag to system settings...');
        await systemRef.update({
          offersEnabled: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        console.log('offersEnabled flag already exists.');
      }
    }

    console.log('✅ Discount settings initialized successfully!');
    console.log('\nYou can now:');
    console.log('1. Go to Admin Settings page');
    console.log('2. Set discount percentages for each plan');
    console.log('3. Enable "Special Offers/Discounts" toggle');
    console.log('4. Discounts will appear on the landing page and payment modal');
    
  } catch (error) {
    console.error('❌ Error initializing discounts:', error);
    process.exit(1);
  }
}

// Run the script
initializeDiscounts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
