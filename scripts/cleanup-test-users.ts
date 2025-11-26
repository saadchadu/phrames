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

// Patterns to identify test users
const TEST_PATTERNS = [
  /^test-user/i,
  /^expiry-test/i,
  /^[a-z0-9]{8,}-test/i,
  /@3m9\.ca$/i,
  /^[a-z]{3,4}\.[a-z]{2,3}@/i, // Patterns like "ef.ke@", "so.k6ie@"
  /^[a-z0-9]{10,}@/i, // Random string emails
  /\+test@/i,
  /test\d+@/i,
];

// Email to keep (your real account)
const KEEP_EMAILS = [
  'ramshidnirmal@gmail.com', // Your real account
];

async function isTestUser(email: string | undefined, uid: string): Promise<boolean> {
  if (!email) return true; // Users without email are likely test users
  
  // Keep specific emails
  if (KEEP_EMAILS.includes(email.toLowerCase())) {
    return false;
  }
  
  // Check against test patterns
  return TEST_PATTERNS.some(pattern => pattern.test(email) || pattern.test(uid));
}

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
      console.log(`  Deleted ${campaignsSnapshot.size} campaigns for user ${userId}`);
    }
  } catch (error) {
    console.error(`  Error deleting campaigns for user ${userId}:`, error);
  }
}

async function deleteUserDocument(userId: string) {
  try {
    await db.collection('users').doc(userId).delete();
    console.log(`  Deleted user document for ${userId}`);
  } catch (error) {
    console.error(`  Error deleting user document for ${userId}:`, error);
  }
}

async function cleanupTestUsers() {
  console.log('Starting test user cleanup...\n');
  
  let deletedCount = 0;
  let keptCount = 0;
  let nextPageToken: string | undefined;
  
  try {
    do {
      // List users in batches
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      for (const user of listUsersResult.users) {
        const isTest = await isTestUser(user.email, user.uid);
        
        if (isTest) {
          console.log(`Deleting test user: ${user.email || user.uid}`);
          
          try {
            // Delete user's campaigns
            await deleteUserCampaigns(user.uid);
            
            // Delete user document
            await deleteUserDocument(user.uid);
            
            // Delete auth user
            await auth.deleteUser(user.uid);
            
            deletedCount++;
            console.log(`  ✓ Deleted successfully\n`);
          } catch (error) {
            console.error(`  ✗ Error deleting user:`, error);
          }
        } else {
          console.log(`Keeping user: ${user.email || user.uid}`);
          keptCount++;
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log('\n=== Cleanup Summary ===');
    console.log(`Test users deleted: ${deletedCount}`);
    console.log(`Real users kept: ${keptCount}`);
    console.log('Cleanup completed!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
