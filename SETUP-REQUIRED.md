# ⚠️ Setup Required

## Firebase Configuration Missing

The error you're seeing is because Firebase environment variables are not configured.

## Quick Fix

I've created `.env.local` from the example file. You need to fill in your Firebase credentials:

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Copy the configuration values

### Step 2: Update .env.local

Open `.env.local` and replace these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## If You Don't Have Firebase Setup

If you haven't set up Firebase yet:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Firebase Storage
5. Get your configuration from Project Settings

## Alternative: Use Test/Demo Mode

If you want to test without Firebase temporarily, you'll need to modify the code to use mock data. However, this is not recommended as the app is tightly integrated with Firebase.

## Need Help?

See the main [README.md](README.md) for detailed Firebase setup instructions.

---

**This is not related to the dependency updates** - it's a standard setup requirement for the project.
