/**
 * Migration script to add createdByEmail to existing campaigns
 * Run this once to update all existing campaigns with the creator's email
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin
if (!getApps().length) {
  // You'll need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
  // or provide the service account key path
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json')
  })
}

const db = getFirestore()
const auth = getAuth()

async function migrateCampaignEmails() {
  console.log('Starting campaign email migration...')
  
  try {
    // Get all campaigns
    const campaignsSnapshot = await db.collection('campaigns').get()
    console.log(`Found ${campaignsSnapshot.size} campaigns to process`)
    
    let updated = 0
    let skipped = 0
    let errors = 0
    
    for (const doc of campaignsSnapshot.docs) {
      const campaign = doc.data()
      
      // Skip if already has createdByEmail
      if (campaign.createdByEmail) {
        console.log(`Campaign ${doc.id} already has createdByEmail, skipping`)
        skipped++
        continue
      }
      
      // Get user email from createdBy UID
      if (campaign.createdBy) {
        try {
          const userRecord = await auth.getUser(campaign.createdBy)
          
          if (userRecord.email) {
            await doc.ref.update({
              createdByEmail: userRecord.email
            })
            console.log(`Updated campaign ${doc.id} with email: ${userRecord.email}`)
            updated++
          } else {
            console.log(`Campaign ${doc.id}: User ${campaign.createdBy} has no email`)
            errors++
          }
        } catch (error) {
          console.error(`Error getting user ${campaign.createdBy} for campaign ${doc.id}:`, error)
          errors++
        }
      } else {
        console.log(`Campaign ${doc.id} has no createdBy field`)
        errors++
      }
    }
    
    console.log('\nMigration complete!')
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)
    console.log(`Errors: ${errors}`)
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateCampaignEmails()
  .then(() => {
    console.log('Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
