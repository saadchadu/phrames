/**
 * Script to enable offers in Firestore
 * Run with: npx tsx scripts/enable-offers.ts
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

async function enableOffers() {
  try {
    console.log('Enabling offers...\n');

    const systemRef = db.collection('settings').doc('system');
    
    await systemRef.update({
      offersEnabled: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'script',
    });

    console.log('✅ Offers enabled successfully!');
    
    // Verify
    const systemDoc = await systemRef.get();
    const data = systemDoc.data();
    
    console.log('\nCurrent Status:');
    console.log('===============');
    console.log('Offers Enabled:', data?.offersEnabled ? '✅ YES' : '❌ NO');
    
    // Show which plans have discounts
    const plansDoc = await db.collection('settings').doc('plans').get();
    const plansData = plansDoc.data();
    
    console.log('\nActive Discounts:');
    console.log('=================');
    if (plansData?.discounts) {
      const plans = ['week', 'month', '3month', '6month', 'year'];
      const labels: any = {
        week: 'Week',
        month: 'Month',
        '3month': '3 Month',
        '6month': '6 Month',
        year: 'Year'
      };
      
      for (const plan of plans) {
        const discount = plansData.discounts[plan] || 0;
        const price = plansData[plan] || 0;
        if (discount > 0) {
          const discountedPrice = Math.round(price - (price * discount / 100));
          console.log(`${labels[plan]}: ${discount}% OFF (₹${price} → ₹${discountedPrice})`);
        }
      }
    }
    
    console.log('\n✅ Discounts are now visible on the landing page!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

enableOffers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
