# Restore Environment Variables from Vercel

## Quick Steps

### Option 1: Using Vercel CLI (Recommended)

```bash
# 1. Link your project
vercel link

# 2. Pull environment variables
vercel env pull .env.local
```

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (phrames)
3. Go to Settings → Environment Variables
4. Copy each variable and paste into `.env.local`

### Option 3: Manual Entry

If you know your Firebase project name, get credentials from:
1. [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Project Settings (gear icon) → General
4. Scroll to "Your apps" → Web app
5. Copy the config values

## Environment Variables Needed

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Other
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_ENV=
NEXT_PUBLIC_APP_URL=
ADMIN_UID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

## After Restoring

```bash
# Restart dev server
npm run dev
```

---

**Sorry for the inconvenience!** The `.env.local` was accidentally overwritten during the update process.
