/**
 * Client-side migration script to add createdByEmail to existing campaigns
 * This can be run from the browser console or as a one-time admin page
 */

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function migrateCampaignEmails() {
  console.log('Starting campaign email migration...')
  
  try {
    // Get all campaigns
    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'))
    console.log(`Found ${campaignsSnapshot.size} campaigns to process`)
    
    let updated = 0
    let skipped = 0
    let errors = 0
    
    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaign = campaignDoc.data()
      
      // Skip if already has createdByEmail
      if (campaign.createdByEmail) {
        console.log(`Campaign ${campaignDoc.id} already has createdByEmail, skipping`)
        skipped++
        continue
      }
      
      // Get user email from users collection
      if (campaign.createdBy) {
        try {
          const userDoc = await getDocs(
            collection(db, 'users')
          ).then(snapshot => 
            snapshot.docs.find(doc => doc.id === campaign.createdBy)
          )
          
          if (userDoc) {
            const userData = userDoc.data()
            if (userData.email) {
              await updateDoc(doc(db, 'campaigns', campaignDoc.id), {
                createdByEmail: userData.email
              })
              console.log(`Updated campaign ${campaignDoc.id} with email: ${userData.email}`)
              updated++
            } else {
              console.log(`Campaign ${campaignDoc.id}: User has no email`)
              errors++
            }
          } else {
            console.log(`Campaign ${campaignDoc.id}: User ${campaign.createdBy} not found`)
            errors++
          }
        } catch (error) {
          console.error(`Error processing campaign ${campaignDoc.id}:`, error)
          errors++
        }
      } else {
        console.log(`Campaign ${campaignDoc.id} has no createdBy field`)
        errors++
      }
    }
    
    console.log('\nMigration complete!')
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)
    console.log(`Errors: ${errors}`)
    
    return { updated, skipped, errors }
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
