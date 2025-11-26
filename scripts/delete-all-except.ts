import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';

// Load environment variables from .env.local
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

const auth = admin.auth();
const db = admin.firestore();

// IMPORTANT: Add emails you want to KEEP here
const KEEP_EMAILS = [
  'saadchadu@gmail.com', // Your main admin account
  // Add any other emails you want to keep
];

async function deleteUserCampaigns(userId: string) {
  try {
    const campaignsSnapshot = await db.collection('campaigns')
      .where('createdBy', '==', userId)
      .get();
    
    const batch = db.batch();
    campaignsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (!campaignsSnapshot.empty) {
      await batch.commit();
      console.log(`  Deleted ${campaignsSnapshot.size} campaigns`);
    }
  } catch (error) {
    console.error(`  Error deleting campaigns:`, error);
  }
}

async function deleteUserDocument(userId: string) {
  try {
    await db.collection('users').doc(userId).delete();
    console.log(`  Deleted user document`);
  } catch (error) {
    console.error(`  Error deleting user document:`, error);
  }
}

async function deleteAllExcept() {
  console.log('Starting user cleanup...');
  console.log(`Keeping these emails: ${KEEP_EMAILS.join(', ')}\n`);
  
  let deletedCount = 0;
  let keptCount = 0;
  let nextPageToken: string | undefined;
  
  try {
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      for (const user of listUsersResult.users) {
        const email = user.email?.toLowerCase();
        
        // Check if this user should be kept
        if (email && KEEP_EMAILS.map(e => e.toLowerCase()).includes(email)) {
          console.log(`✓ Keeping: ${user.email}`);
          keptCount++;
          continue;
        }
        
        // Delete this user
        console.log(`✗ Deleting: ${user.email || user.uid}`);
        
        try {
          await deleteUserCampaigns(user.uid);
          await deleteUserDocument(user.uid);
          await auth.deleteUser(user.uid);
          deletedCount++;
          console.log(`  Successfully deleted\n`);
        } catch (error) {
          console.error(`  Error deleting user:`, error);
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log('\n=== Cleanup Summary ===');
    console.log(`Users deleted: ${deletedCount}`);
    console.log(`Users kept: ${keptCount}`);
    console.log('Cleanup completed!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will delete ALL users except:');
KEEP_EMAILS.forEach(email => console.log(`   - ${email}`));
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  deleteAllExcept()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}, 5000);
