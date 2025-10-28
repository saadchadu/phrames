# 🔥 Production Firebase Fix

## The Problem

Your production app at `phrames.cleffon.com` shows "Firebase not initialized" because the Firebase environment variables are not configured in production.

---

## Quick Fix

### Step 1: Check Your Production Environment Variables

Your production deployment needs these environment variables:

```env
# Firebase Client (Public - these are safe to expose)
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA5tamwShPZ2be9aaXQNso547qDVeOI1aw
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=phrames-app.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=phrames-app
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=phrames-app.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=452206245013
NUXT_PUBLIC_FIREBASE_APP_ID=1:452206245013:web:209a1883f3caba9f7c979c

# Firebase Admin (Server - keep these secret)
FIREBASE_PROJECT_ID=phrames-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@phrames-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY]\n-----END PRIVATE KEY-----\n"

# Session Secret
SESSION_SECRET=your-production-session-secret
```

### Step 2: Add to Your Hosting Platform

**If using Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above
3. Redeploy

**If using Netlify:**
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add each variable above
3. Redeploy

**If using DigitalOcean App Platform:**
1. Go to Apps → Your App → Settings → App-Level Environment Variables
2. Add each variable above
3. Redeploy

**If using Railway:**
1. Go to Railway Dashboard → Your Project → Variables
2. Add each variable above
3. Redeploy

**If using your own server:**
1. Create `.env` file on server with variables above
2. Restart your app

---

## Step 3: Test Production

After adding environment variables:

1. **Redeploy your app**
2. **Visit**: https://phrames.cleffon.com
3. **Try to sign up/login**
4. **Should work now!**

---

## Debug Production Issues

### Check if Variables are Set

Add this temporary debug page to check if variables are loaded:

```vue
<!-- pages/debug-env.vue -->
<template>
  <div class="p-8">
    <h1 class="text-2xl mb-4">Environment Debug</h1>
    <div class="space-y-2">
      <p><strong>API Key:</strong> {{ config.public.firebaseApiKey ? '✅ Set' : '❌ Missing' }}</p>
      <p><strong>Auth Domain:</strong> {{ config.public.firebaseAuthDomain ? '✅ Set' : '❌ Missing' }}</p>
      <p><strong>Project ID:</strong> {{ config.public.firebaseProjectId ? '✅ Set' : '❌ Missing' }}</p>
      <p><strong>Storage Bucket:</strong> {{ config.public.firebaseStorageBucket ? '✅ Set' : '❌ Missing' }}</p>
      <p><strong>Messaging Sender ID:</strong> {{ config.public.firebaseMessagingSenderId ? '✅ Set' : '❌ Missing' }}</p>
      <p><strong>App ID:</strong> {{ config.public.firebaseAppId ? '✅ Set' : '❌ Missing' }}</p>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
```

Visit: https://phrames.cleffon.com/debug-env

### Common Issues:

**Issue 1: Variables not set**
- Solution: Add all NUXT_PUBLIC_FIREBASE_* variables to hosting platform

**Issue 2: Wrong Firebase project**
- Solution: Make sure PROJECT_ID matches your Firebase project

**Issue 3: Invalid API key**
- Solution: Get fresh API key from Firebase Console

**Issue 4: Domain mismatch**
- Solution: Add `phrames.cleffon.com` to Firebase Auth authorized domains

---

## Step 4: Add Your Domain to Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select project**: phrames-app
3. **Authentication** → **Settings** → **Authorized domains**
4. **Add domain**: `phrames.cleffon.com`
5. **Save**

---

## Step 5: Update CORS if Needed

If you get CORS errors, add your domain to Firebase Storage CORS:

1. **Firebase Console** → **Storage** → **Rules**
2. Make sure rules allow your domain
3. Or use wildcard for testing: `allow read: if true;`

---

## Environment Variables Checklist

Make sure your hosting platform has:

### Required (Client):
- [ ] `NUXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NUXT_PUBLIC_FIREBASE_APP_ID`

### Required (Server):
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `SESSION_SECRET`

### Optional:
- [ ] `NUXT_PUBLIC_SITE_URL=https://phrames.cleffon.com`

---

## Quick Test

After setting variables, test:

1. **Visit**: https://phrames.cleffon.com/debug-env
2. **All should show**: ✅ Set
3. **Try signup**: Should work
4. **Try login**: Should work

---

## Most Likely Issue

**Missing NUXT_PUBLIC_FIREBASE_API_KEY in production environment variables.**

Add all the NUXT_PUBLIC_FIREBASE_* variables to your hosting platform and redeploy.

---

## Need Help?

1. **Check hosting platform docs** for environment variables
2. **Verify Firebase project settings** in console
3. **Test with debug page** first
4. **Check browser console** for specific errors

The fix is usually just adding the missing environment variables to your hosting platform! 🔥