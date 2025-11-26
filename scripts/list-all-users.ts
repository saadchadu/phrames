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

async function listAllUsers() {
  console.log('Listing all users...\n');
  
  const allUsers: any[] = [];
  let nextPageToken: string | undefined;
  
  try {
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      for (const user of listUsersResult.users) {
        const campaignCount = await getUserCampaignCount(user.uid);
        
        allUsers.push({
          email: user.email || 'No email',
          uid: user.uid,
          created: user.metadata.creationTime,
          lastSignIn: user.metadata.lastSignInTime,
          campaigns: campaignCount,
          provider: user.providerData[0]?.providerId || 'unknown',
        });
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`=== ALL USERS (${allUsers.length} total) ===\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Provider: ${user.provider}`);
      console.log(`   Created: ${user.created}`);
      console.log(`   Last Sign In: ${user.lastSignIn || 'Never'}`);
      console.log(`   Campaigns: ${user.campaigns}`);
      console.log('');
    });
    
    console.log(`\nTotal users: ${allUsers.length}`);
    
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
