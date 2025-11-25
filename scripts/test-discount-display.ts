/**
 * Script to test discount display logic
 * Run with: npx tsx scripts/test-discount-display.ts
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

async function testDiscountDisplay() {
  try {
    console.log('Testing Discount Display Logic\n');
    console.log('================================\n');

    const [plansDoc, systemDoc] = await Promise.all([
      db.collection('settings').doc('plans').get(),
      db.collection('settings').doc('system').get()
    ]);

    if (!plansDoc.exists || !systemDoc.exists) {
      console.log('❌ Settings documents not found!');
      return;
    }

    const plansData = plansDoc.data()!;
    const systemData = systemDoc.data()!;
    const offersEnabled = systemData.offersEnabled ?? false;

    console.log('System Status:');
    console.log('--------------');
    console.log('Offers Enabled:', offersEnabled ? '✅ YES' : '❌ NO');
    console.log('');

    const plans = [
      { key: 'week', name: '1 Week' },
      { key: 'month', name: '1 Month' },
      { key: '3month', name: '3 Months' },
      { key: '6month', name: '6 Months' },
      { key: 'year', name: '1 Year' }
    ];

    console.log('What Users Will See on Landing Page:');
    console.log('-------------------------------------\n');

    for (const plan of plans) {
      const price = plansData[plan.key] || 0;
      const discount = plansData.discounts?.[plan.key] || 0;
      const hasDiscount = offersEnabled && discount > 0;

      if (hasDiscount) {
        const discountedPrice = Math.round(price - (price * discount / 100));
        console.log(`${plan.name}:`);
        console.log(`  🏷️  ${discount}% OFF Badge`);
        console.log(`  ❌ Original: ₹${price} (strikethrough)`);
        console.log(`  ✅ Discounted: ₹${discountedPrice} (green, large)`);
        console.log(`  💰 Savings: ₹${price - discountedPrice}`);
      } else {
        console.log(`${plan.name}:`);
        console.log(`  💵 Regular Price: ₹${price}`);
        if (discount > 0 && !offersEnabled) {
          console.log(`  ⚠️  Discount ${discount}% configured but offers are disabled`);
        }
      }
      console.log('');
    }

    if (!offersEnabled) {
      console.log('⚠️  NOTE: Offers are disabled. Enable them to show discounts!');
      console.log('Run: npx tsx scripts/enable-offers.ts');
    } else {
      const activeDiscounts = plans.filter(p => (plansData.discounts?.[p.key] || 0) > 0);
      if (activeDiscounts.length === 0) {
        console.log('⚠️  NOTE: Offers are enabled but no discounts are set!');
        console.log('Go to /admin/settings to set discount percentages.');
      } else {
        console.log('✅ Discounts are active and should be visible on the landing page!');
        console.log('');
        console.log('If not showing:');
        console.log('1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)');
        console.log('2. Clear browser cache');
        console.log('3. Check browser console for errors');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDiscountDisplay()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
