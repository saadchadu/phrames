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

// Correct pricing
const CORRECT_PRICES = {
  week: 49,
  month: 99,
  '3month': 249,
  '6month': 499,
  year: 899
}

async function checkAndFixPrices() {
  try {
    console.log('Checking current prices in Firestore...\n')
    
    const plansDoc = await db.collection('settings').doc('plans').get()
    
    if (!plansDoc.exists) {
      console.log('❌ Plans document does not exist. Creating it...')
      await db.collection('settings').doc('plans').set(CORRECT_PRICES)
      console.log('✅ Created plans document with correct prices')
      return
    }
    
    const currentPrices = plansDoc.data()
    console.log('Current prices in Firestore:')
    console.log(JSON.stringify(currentPrices, null, 2))
    
    console.log('\n\nExpected prices:')
    console.log(JSON.stringify(CORRECT_PRICES, null, 2))
    
    // Check if prices match
    let needsUpdate = false
    for (const [plan, price] of Object.entries(CORRECT_PRICES)) {
      if (currentPrices?.[plan] !== price) {
        console.log(`\n⚠️  Mismatch found for ${plan}: Current=${currentPrices?.[plan]}, Expected=${price}`)
        needsUpdate = true
      }
    }
    
    if (needsUpdate) {
      console.log('\n\n🔧 Updating prices to correct values...')
      await db.collection('settings').doc('plans').set(CORRECT_PRICES, { merge: true })
      console.log('✅ Prices updated successfully!')
      
      // Verify update
      const updatedDoc = await db.collection('settings').doc('plans').get()
      console.log('\n\nUpdated prices:')
      console.log(JSON.stringify(updatedDoc.data(), null, 2))
    } else {
      console.log('\n\n✅ All prices are correct!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkAndFixPrices()
