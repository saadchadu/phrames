# Setup Instructions for Next.js Phrames App

## Quick Start

1. **Navigate to the Next.js app directory:**
   ```bash
   cd next-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Add your Firebase credentials to `.env.local`:**
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=phrames-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=phrames-app
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=phrames-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=452206245013
   NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

   # Firebase Admin (Server-side)
   FIREBASE_PROJECT_ID=phrames-app
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@phrames-app.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

   # Session Secret
   SESSION_SECRET=your-session-secret

   # Site URL
   NEXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Troubleshooting

If you see TypeScript errors:
1. Make sure all dependencies are installed: `npm install`
2. Try deleting `.next` folder and restart: `rm -rf .next && npm run dev`
3. Check that `next-env.d.ts` exists in the project root

## What's Included

- ✅ Beautiful homepage matching your design
- ✅ Authentication with Google OAuth
- ✅ Dashboard page
- ✅ Untitled UI components
- ✅ Firebase integration
- ✅ Responsive design
- ✅ TypeScript support

The app should now display the exact homepage design you requested!