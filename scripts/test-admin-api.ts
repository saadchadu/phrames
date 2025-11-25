import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

console.log('Environment check:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓' : '✗');
console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓' : '✗');
console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓' : '✗');
console.log('');

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

async function testAdminAPI() {
  try {
    console.log('Testing Firebase Admin connection...\n');
    
    // Test users collection
    const usersSnap = await db.collection('users').get();
    console.log(`✓ Users collection: ${usersSnap.size} documents`);
    if (usersSnap.size > 0) {
      const firstUser = usersSnap.docs[0].data();
      console.log('  Sample user:', {
        id: usersSnap.docs[0].id,
        email: firstUser.email,
        createdAt: firstUser.createdAt,
      });
    }
    
    // Test campaigns collection
    const campaignsSnap = await db.collection('campaigns').get();
    console.log(`✓ Campaigns collection: ${campaignsSnap.size} documents`);
    if (campaignsSnap.size > 0) {
      const firstCampaign = campaignsSnap.docs[0].data();
      console.log('  Sample campaign:', {
        id: campaignsSnap.docs[0].id,
        isActive: firstCampaign.isActive,
        createdAt: firstCampaign.createdAt,
      });
    }
    
    // Test payments collection
    const paymentsSnap = await db.collection('payments').get();
    console.log(`✓ Payments collection: ${paymentsSnap.size} documents`);
    if (paymentsSnap.size > 0) {
      const firstPayment = paymentsSnap.docs[0].data();
      console.log('  Sample payment:', {
        id: paymentsSnap.docs[0].id,
        status: firstPayment.status,
        amount: firstPayment.amount,
        createdAt: firstPayment.createdAt,
      });
    }
    
    console.log('\n✓ All collections accessible!');
    
    if (usersSnap.size === 0 && campaignsSnap.size === 0 && paymentsSnap.size === 0) {
      console.log('\n⚠️  Warning: All collections are empty. This is why the dashboard shows zeros.');
      console.log('   The API is working correctly, but there is no data to display.');
    }
    
  } catch (error) {
    console.error('✗ Error testing admin API:', error);
    if (error instanceof Error) {
      console.error('  Message:', error.message);
      console.error('  Stack:', error.stack);
    }
  } finally {
    process.exit(0);
  }
}

testAdminAPI();
