# Vercel + Firebase Database Setup

## 🔥 Using Vercel Hosting + Firebase Database

This is a great combination! Vercel handles your Next.js app hosting, while Firebase provides the database and authentication.

## 🏗️ Architecture

- **Hosting**: Vercel (Next.js app)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage or Vercel Blob
- **Functions**: Vercel Edge Functions

## 🚀 Setup Steps

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or use existing one
3. Enable Authentication → Sign-in method → Email/Password
4. Enable Firestore Database
5. Enable Storage (if needed)

### 2. Get Firebase Config

From Firebase Console → Project Settings:

**Client Config (Web app):**
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}
```

**Admin Config (Service Account):**
- Go to Service Accounts tab
- Generate new private key
- Download JSON file

### 3. Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Session Secret
SESSION_SECRET=your-32-character-session-secret

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## 📁 File Structure Update

You'll need to add back Firebase files but keep them clean:

```
next-app/
├── lib/
│   ├── firebase.ts          # Client-side Firebase
│   ├── firebase-admin.ts    # Server-side Firebase Admin
│   └── firestore.ts         # Firestore helpers
├── app/api/
│   ├── auth/                # Firebase Auth API routes
│   └── campaigns/           # Campaign CRUD with Firestore
```

## 🔧 Implementation

### Firebase Client Setup
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### Firebase Admin Setup
```typescript
// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let app
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
} else {
  app = getApps()[0]
}

export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)
```

## 💾 Storage Options

### Option 1: Firebase Storage
- **Pros**: Integrated with Firebase, easy setup
- **Cons**: Requires Blaze plan for production

### Option 2: Vercel Blob Storage
- **Pros**: Integrated with Vercel, generous free tier
- **Cons**: Newer service, less mature

```typescript
// Using Vercel Blob
import { put } from '@vercel/blob'

export async function uploadToBlob(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
  })
  return blob.url
}
```

## 🔐 Authentication Flow

1. **Client**: User signs up/in with Firebase Auth
2. **Server**: Verify Firebase token in API routes
3. **Database**: Store user data in Firestore
4. **Session**: Optional session cookies for server-side auth

## 📊 Database Structure (Firestore)

```
users/
  {userId}/
    email: string
    createdAt: timestamp
    
campaigns/
  {campaignId}/
    userId: string
    name: string
    slug: string
    frameUrl: string
    createdAt: timestamp
    
stats/
  {campaignId}/
    visits: number
    downloads: number
    date: timestamp
```

## 🚀 Deployment to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** (all Firebase config)
4. **Deploy**

## ✅ Benefits of This Setup

- **Vercel**: Fast global CDN, automatic deployments, edge functions
- **Firebase**: Real-time database, built-in auth, file storage
- **Scalability**: Both services auto-scale
- **Cost**: Generous free tiers on both platforms
- **DX**: Great developer experience with both tools

## 🎯 Perfect For

- **Rapid prototyping**
- **Real-time features** (if using Firestore real-time listeners)
- **Global applications** (both have global infrastructure)
- **Teams familiar with Firebase**

This combination gives you the best of both worlds - Vercel's excellent Next.js hosting and Firebase's powerful backend services!