const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

const db = getFirestore(app);

async function inspect() {
  const querySnapshot = await getDocs(collection(db, 'campaigns'));
  let found = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.isActive !== false) {
      console.log(`ID: ${doc.id} | Name: ${data.campaignName}`);
      console.log(`CreatedAt: ${data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : JSON.stringify(data.createdAt)) : 'None'}`);
      console.log(`ExpiresAt: ${data.expiresAt ? (typeof data.expiresAt.toDate === 'function' ? data.expiresAt.toDate().toISOString() : JSON.stringify(data.expiresAt)) : 'None'}`);
      console.log(`PaymentId: ${data.paymentId} | IsFree: ${data.isFreeCampaign} | IsActive: ${data.isActive}`);
      console.log('---');
      found++;
    }
  });
  console.log('Total found active-ish:', found);
}

inspect().catch(console.error);
