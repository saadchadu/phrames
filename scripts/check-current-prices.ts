/**
 * Script to check current pricing in Firestore
 * Run with: npx tsx scripts/check-current-prices.ts
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

async function checkPrices() {
  try {
    console.log('Checking current pricing in Firestore...\n');

    const plansDoc = await db.collection('settings').doc('plans').get();
    
    if (!plansDoc.exists) {
      console.log('❌ Plans document does not exist!');
      return;
    }

    const data = plansDoc.data();
    console.log('Current Pricing:');
    console.log('================');
    console.log(`Week:     ₹${data?.week || 'NOT SET'}`);
    console.log(`Month:    ₹${data?.month || 'NOT SET'}`);
    console.log(`3 Month:  ₹${data?.['3month'] || 'NOT SET'}`);
    console.log(`6 Month:  ₹${data?.['6month'] || 'NOT SET'}`);
    console.log(`Year:     ₹${data?.year || 'NOT SET'}`);
    
    console.log('\nDiscounts:');
    console.log('==========');
    if (data?.discounts) {
      console.log(`Week:     ${data.discounts.week || 0}%`);
      console.log(`Month:    ${data.discounts.month || 0}%`);
      console.log(`3 Month:  ${data.discounts['3month'] || 0}%`);
      console.log(`6 Month:  ${data.discounts['6month'] || 0}%`);
      console.log(`Year:     ${data.discounts.year || 0}%`);
    } else {
      console.log('No discounts set');
    }

    const systemDoc = await db.collection('settings').doc('system').get();
    if (systemDoc.exists) {
      const systemData = systemDoc.data();
      console.log('\nOffers Enabled:', systemData?.offersEnabled ? '✅ YES' : '❌ NO');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPrices()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
