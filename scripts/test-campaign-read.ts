import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase (client SDK - no auth)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCampaignRead() {
  try {
    const slug = 'sample-campaign';
    
    console.log(`Testing public read access for campaign: ${slug}`);
    console.log('This simulates an unauthenticated user trying to view the campaign\n');
    
    const q = query(collection(db, 'campaigns'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No campaign found or access denied');
      console.log('\nThis means the Firestore rules are blocking access.');
      console.log('The campaign either:');
      console.log('1. Does not exist');
      console.log('2. Is not Public');
      console.log('3. Is not Active (isActive: false)');
      console.log('4. Has expired');
    } else {
      console.log('✅ Campaign found! Public access is working.');
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      console.log('\nCampaign data:');
      console.log('ID:', doc.id);
      console.log('Name:', data.campaignName);
      console.log('Slug:', data.slug);
      console.log('Visibility:', data.visibility);
      console.log('isActive:', data.isActive);
      console.log('status:', data.status);
    }
    
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    console.log('\nThis is a permissions error from Firestore rules.');
  } finally {
    process.exit(0);
  }
}

testCampaignRead();
