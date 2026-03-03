const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
require('dotenv').config();

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
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.status === 'Active') {
      console.log(`ID: ${doc.id}`);
      console.log(`Name: ${data.campaignName}`);
      console.log(`CreatedAt: ${data.createdAt ? data.createdAt.toDate().toISOString() : 'None'}`);
      console.log(`ExpiresAt: ${data.expiresAt ? data.expiresAt.toDate().toISOString() : 'None'}`);
      console.log(`IsFree: ${data.isFreeCampaign}, IsActive: ${data.isActive}`);
      console.log('---');
    }
  });
}

inspect().catch(console.error);
