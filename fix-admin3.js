const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

function parseDate(d) {
  if (!d) return null;
  if (typeof d.toDate === 'function') return d.toDate();
  if (d._seconds) return new Date(d._seconds * 1000);
  if (d.seconds) return new Date(d.seconds * 1000);
  return new Date(d);
}

async function fix() {
  const querySnapshot = await db.collection('campaigns').get();
  let count = 0;
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    if (data.isActive !== false) {
      const isPaid = !!data.paymentId && data.paymentId !== 'null' && data.paymentId !== 'undefined';
      const created = parseDate(data.createdAt);
      if (!isPaid && created) {
        const strictExpiry = new Date(created);
        strictExpiry.setDate(strictExpiry.getDate() + 30);
        if (strictExpiry < new Date()) {
          console.log(`Disabling ${doc.id} | ${data.campaignName}`);
          count++;
          await doc.ref.update({
            isActive: false,
            status: 'Inactive'
          });
        }
      }
    }
  }
  console.log(`Fixed ${count} campaigns using Admin SDK`);
}

fix();
