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

async function getUserCampaignCount(userId: string): Promise<number> {
  try {
    const campaignsSnapshot = await db.collection('campaigns')
      .where('createdBy', '==', userId)
      .get();
    return campaignsSnapshot.size;
  } catch (error) {
    return 0;
  }
}

async function previewTestUsers() {
  console.log('Previewing test users that will be deleted...\n');
  
  const testUsers: any[] = [];
  const realUsers: any[] = [];
  let nextPageToken: string | undefined;
  
  try {
    do {
      // List users in batches
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      for (const user of listUsersResult.users) {
        const isTest = await isTestUser(user.email, user.uid);
        const campaignCount = await getUserCampaignCount(user.uid);
        
        const userInfo = {
          email: user.email || 'No email',
          uid: user.uid,
          created: user.metadata.creationTime,
          campaigns: campaignCount,
        };
        
        if (isTest) {
          testUsers.push(userInfo);
        } else {
          realUsers.push(userInfo);
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log('=== USERS TO BE DELETED ===');
    console.log(`Total: ${testUsers.length}\n`);
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Created: ${user.created}`);
      console.log(`   Campaigns: ${user.campaigns}`);
      console.log('');
    });
    
    console.log('\n=== USERS TO BE KEPT ===');
    console.log(`Total: ${realUsers.length}\n`);
    realUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Created: ${user.created}`);
      console.log(`   Campaigns: ${user.campaigns}`);
      console.log('');
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Test users to delete: ${testUsers.length}`);
    console.log(`Real users to keep: ${realUsers.length}`);
    console.log('\nTo proceed with deletion, run: npm run cleanup-test-users');
    
  } catch (error) {
    console.error('Error during preview:', error);
    process.exit(1);
  }
}

// Run the preview
previewTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
