/**
 * Script to dump raw Firestore settings
 * Run with: npx tsx scripts/dump-firestore-settings.ts
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

async function dumpSettings() {
  try {
    console.log('Raw Firestore Data\n');
    console.log('==================\n');

    const plansDoc = await db.collection('settings').doc('plans').get();
    const systemDoc = await db.collection('settings').doc('system').get();

    console.log('settings/plans:');
    console.log(JSON.stringify(plansDoc.data(), null, 2));
    console.log('\n');

    console.log('settings/system:');
    console.log(JSON.stringify(systemDoc.data(), null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dumpSettings()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
