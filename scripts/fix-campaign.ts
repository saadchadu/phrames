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

async function fixCampaign() {
  try {
    const slug = 'sample-campaign';
    
    console.log(`Looking for campaign with slug: ${slug}`);
    
    // Find campaign by slug
    const snapshot = await db.collection('campaigns')
      .where('slug', '==', slug)
      .get();
    
    if (snapshot.empty) {
      console.log('Campaign not found!');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('\nCurrent campaign data:');
    console.log('ID:', doc.id);
    console.log('Name:', data.campaignName);
    console.log('Slug:', data.slug);
    console.log('Visibility:', data.visibility);
    console.log('isActive:', data.isActive);
    console.log('status:', data.status);
    console.log('expiresAt:', data.expiresAt?.toDate());
    
    // Fix the campaign
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    await db.collection('campaigns').doc(doc.id).update({
      isActive: true,
      status: 'Active',
      visibility: 'Public',
      expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
    });
    
    console.log('\n✅ Campaign fixed!');
    console.log('Set isActive: true');
    console.log('Set status: Active');
    console.log('Set visibility: Public');
    console.log('Set expiresAt:', expiryDate);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixCampaign();
