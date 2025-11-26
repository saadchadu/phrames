import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function checkCurrentUser() {
  try {
    console.log('\n=== Current User Check ===\n');
    
    // Prompt for email and password
    const email = process.argv[2];
    const password = process.argv[3];
    
    if (!email || !password) {
      console.log('Usage: npm run check-user <email> <password>');
      console.log('Example: npm run check-user admin@example.com mypassword');
      process.exit(1);
    }
    
    console.log(`Signing in as: ${email}`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('\n✅ Successfully signed in!');
    console.log('\nUser Details:');
    console.log('─────────────────────────────────────');
    console.log(`Email: ${user.email}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Display Name: ${user.displayName || 'Not set'}`);
    console.log(`Email Verified: ${user.emailVerified}`);
    console.log('─────────────────────────────────────');
    
    console.log('\nCurrent ADMIN_UID in .env.local:');
    console.log(`${process.env.ADMIN_UID}`);
    
    if (user.uid === process.env.ADMIN_UID) {
      console.log('\n✅ This user IS the admin!');
    } else {
      console.log('\n❌ This user is NOT the admin!');
      console.log('\nTo make this user an admin, update .env.local:');
      console.log(`ADMIN_UID=${user.uid}`);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkCurrentUser();
