/**
 * Script to set example discounts
 * Run with: npx tsx scripts/set-example-discounts.ts
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

async function setExampleDiscounts() {
  try {
    console.log('Setting Example Discounts\n');
    console.log('=========================\n');

    const plansRef = db.collection('settings').doc('plans');
    const plansDoc = await plansRef.get();
    
    if (!plansDoc.exists) {
      console.log('❌ Plans document does not exist!');
      return;
    }

    const currentData = plansDoc.data()!;

    // Set example discounts
    const exampleDiscounts = {
      week: 10,      // 10% off
      month: 20,     // 20% off
      '3month': 25,  // 25% off
      '6month': 30,  // 30% off
      year: 35       // 35% off (best value)
    };

    await plansRef.update({
      discounts: exampleDiscounts,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'script',
    });

    console.log('✅ Example discounts set successfully!\n');

    console.log('Discount Preview:');
    console.log('-----------------\n');

    const plans: any = {
      week: '1 Week',
      month: '1 Month',
      '3month': '3 Months',
      '6month': '6 Months',
      year: '1 Year'
    };

    for (const [key, name] of Object.entries(plans)) {
      const price = currentData[key] || 0;
      const discount = exampleDiscounts[key as keyof typeof exampleDiscounts];
      const discountedPrice = Math.round(price - (price * discount / 100));
      const savings = price - discountedPrice;

      console.log(`${name}:`);
      console.log(`  Original: ₹${price}`);
      console.log(`  Discount: ${discount}%`);
      console.log(`  New Price: ₹${discountedPrice}`);
      console.log(`  You Save: ₹${savings}`);
      console.log('');
    }

    console.log('✅ Discounts are now active on the landing page!');
    console.log('\nTo see them:');
    console.log('1. Refresh your landing page (hard refresh: Ctrl+Shift+R)');
    console.log('2. Look for red "X% OFF" badges');
    console.log('3. Original prices will show with strikethrough');
    console.log('4. Discounted prices will be in green');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setExampleDiscounts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
