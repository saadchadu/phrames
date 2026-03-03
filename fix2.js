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

const parseDate = (d) => {
  if (!d) return null;
  if (typeof d.toDate === 'function') return d.toDate();
  if (typeof d.seconds === 'number') return new Date(d.seconds * 1000);
  return new Date(d);
};

async function fix() {
  const querySnapshot = await getDocs(collection(db, 'campaigns'));
  let count = 0;
  for (const d of querySnapshot.docs) {
    const data = d.data();
    if (data.isActive !== false) {
      const isPaid = !!data.paymentId && data.paymentId !== 'null' && data.paymentId !== 'undefined';
      const created = parseDate(data.createdAt);
      if (!isPaid && created) {
        const strictExpiry = new Date(created);
        strictExpiry.setDate(strictExpiry.getDate() + 30);
        if (strictExpiry < new Date()) {
          console.log(`Disabling ${d.id}`);
          count++;
          await updateDoc(doc(db, 'campaigns', d.id), {
            expiresAt: strictExpiry,
            isActive: false,
            status: 'Inactive'
          });
        }
      }
    }
  }
  console.log(`Fixed ${count}`);
}

fix();
