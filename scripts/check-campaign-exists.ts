import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

async function checkCampaign() {
  const campaignId = 'cSKG6hbjjBSbcGEpEsHE'
  
  console.log('\n=== Checking Campaign ===\n')
  console.log('Campaign ID:', campaignId)
  
  const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
  
  if (!campaignDoc.exists) {
    console.log('❌ Campaign not found')
    
    // List all campaigns for the user
    console.log('\nListing all campaigns for user: o8VA5Fh1h1PtQ1623LTrSlyAsNz1')
    const campaignsSnapshot = await db.collection('campaigns')
      .where('createdBy', '==', 'o8VA5Fh1h1PtQ1623LTrSlyAsNz1')
      .get()
    
    console.log(`\nFound ${campaignsSnapshot.size} campaigns:`)
    campaignsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      console.log(`\n  Campaign ${index + 1}:`)
      console.log('  - ID:', doc.id)
      console.log('  - Name:', data.campaignName)
      console.log('  - Slug:', data.slug)
      console.log('  - Status:', data.status)
      console.log('  - Is Active:', data.isActive)
    })
  } else {
    const data = campaignDoc.data()
    console.log('✅ Campaign found:')
    console.log('  - Name:', data?.campaignName)
    console.log('  - Slug:', data?.slug)
    console.log('  - Status:', data?.status)
    console.log('  - Is Active:', data?.isActive)
    console.log('  - Plan Type:', data?.planType)
    console.log('  - Amount Paid:', data?.amountPaid)
    console.log('  - Payment ID:', data?.paymentId)
    console.log('  - Expires At:', data?.expiresAt?.toDate())
  }
}

checkCampaign()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
