import { adminDb } from '../lib/firebase-admin';

async function inspect() {
    const querySnapshot = await adminDb.collection('campaigns').where('status', '==', 'Active').get();
    console.log(`Found ${querySnapshot.size} active campaigns.`);
    querySnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Name: ${data.campaignName}`);
        console.log(`CreatedAt: ${data.createdAt ? data.createdAt.toDate().toISOString() : 'None'}`);
        console.log(`ExpiresAt: ${data.expiresAt ? data.expiresAt.toDate().toISOString() : 'None'}`);
        console.log(`IsFree: ${data.isFreeCampaign}, IsActive: ${data.isActive}`);
        console.log('---');
    });
}

inspect().catch(console.error);
