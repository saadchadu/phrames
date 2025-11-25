/**
 * Script to force set discounts using merge
 * Run with: npx tsx scripts/force-set-discounts.ts
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

async function forceSetDiscounts() {
  try {
    console.log('Force Setting Discounts\n');
    console.log('=======================\n');

    const plansRef = db.collection('settings').doc('plans');
    
    // Get current data first
    const currentDoc = await plansRef.get();
    const currentData = currentDoc.data() || {};
    
    console.log('Current prices:');
    console.log(`Week: ₹${currentData.week || 'NOT SET'}`);
    console.log(`Month: ₹${currentData.month || 'NOT SET'}`);
    console.log(`3 Month: ₹${currentData['3month'] || 'NOT SET'}`);
    console.log(`6 Month: ₹${currentData['6month'] || 'NOT SET'}`);
    console.log(`Year: ₹${currentData.year || 'NOT SET'}`);
    console.log('');

    // Set discounts with merge
    const discounts = {
      week: 10,
      month: 20,
      '3month': 25,
      '6month': 30,
      year: 35
    };

    await plansRef.set({
      ...currentData,
      discounts: discounts,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'force-script',
    }, { merge: false }); // Use merge: false to replace entire document

    console.log('✅ Discounts forcefully set!\n');

    // Verify
    const verifyDoc = await plansRef.get();
    const verifyData = verifyDoc.data();
    
    console.log('Verified discounts:');
    console.log(JSON.stringify(verifyData?.discounts, null, 2));
    console.log('');

    // Show what will be displayed
    console.log('Landing Page Preview:');
    console.log('---------------------\n');

    const plans: any = {
      week: '1 Week',
      month: '1 Month',
      '3month': '3 Months',
      '6month': '6 Months',
      year: '1 Year'
    };

    for (const [key, name] of Object.entries(plans)) {
      const price = verifyData?.[key] || 0;
      const discount = verifyData?.discounts?.[key] || 0;
      
      if (discount > 0) {
        const discountedPrice = Math.round(price - (price * discount / 100));
        console.log(`${name}: ₹${price} → ₹${discountedPrice} (${discount}% OFF)`);
      } else {
        console.log(`${name}: ₹${price} (no discount)`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

forceSetDiscounts()
  .then(() => {
    console.log('\n✅ Done - Now refresh your landing page!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
