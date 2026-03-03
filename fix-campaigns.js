const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
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

// Helper to parse dates robustly
const parseFirestoreDate = (dateField) => {
  if (!dateField) return null;
  if (typeof dateField.toDate === 'function') return dateField.toDate();
  if (typeof dateField.seconds === 'number') return new Date(dateField.seconds * 1000);
  const d = new Date(dateField);
  return isNaN(d.getTime()) ? null : d;
};

async function fix() {
  console.log('Fetching campaigns to evaluate database fixes...');
  try {
    const querySnapshot = await getDocs(collection(db, 'campaigns'));
    let count = 0;
    
    for (const d of querySnapshot.docs) {
      const data = d.data();
      
      // Skip formally disabled campaigns
      if (data.isActive === false && data.status === 'Inactive') continue;
      
      const isPaid = !!data.paymentId && data.paymentId !== 'null' && data.paymentId !== 'undefined';
      const createdDate = parseFirestoreDate(data.createdAt);
      
      if (!isPaid && createdDate) {
        const strictExpiryLimit = new Date(createdDate);
        strictExpiryLimit.setDate(strictExpiryLimit.getDate() + 30);
        
        // If it's over 30 days old and unpaid
        if (strictExpiryLimit < new Date()) {
          console.log(`Fixing: ${doc.id} | ${data.campaignName}`);
          
          await updateDoc(doc(db, 'campaigns', d.id), {
            expiresAt: strictExpiryLimit,
            isActive: false,
            status: 'Inactive'
          });
          count++;
        }
      }
    }
    console.log(`Successfully fixed ${count} stuck campaigns in the database!`);
    
  } catch (err) {
    console.error('Firebase error:', err);
  }
}

fix();
