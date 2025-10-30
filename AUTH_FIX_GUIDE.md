# 🔐 Authentication Issue - Complete Fix

## The Problem

You're seeing "401 Unauthorized" when trying to view campaigns. This means:

1. You're not logged in, OR
2. Firebase Auth isn't working, OR
3. The auth token isn't being sent with requests

## Quick Fix - Log In Again

### Step 1: Clear Browser Data

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear:
   - Local Storage
   - Session Storage
   - Cookies
4. Close DevTools

### Step 2: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Sign Up / Log In

1. Visit http://localhost:3000
2. Click **Sign up** (or **Sign in** if you have an account)
3. Enter email and password
4. Submit

### Step 4: Verify Login

After login, you should:

- ✅ Be redirected to `/dashboard`
- ✅ See "Dashboard" page
- ✅ See "Create Campaign" button
- ✅ NOT see "Unable to load campaigns" error

### Step 5: Create Campaign

1. Click "Create Campaign"
2. Fill in details
3. Upload PNG frame
4. Click "Create Campaign"
5. ✅ Should work!

---

## If Still Not Working

### Check 1: Firebase Auth is Configured

```bash
# Check .env file
cat .env | grep FIREBASE
```

You should see:

```
NUXT_PUBLIC_FIREBASE_API_KEY=...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NUXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### Check 2: Firebase Auth is Enabled

1. Go to https://console.firebase.google.com
2. Select your project: `phrames-app`
3. Click **Authentication**
4. Make sure **Email/Password** is enabled

### Check 3: Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors
4. Common errors:
   - "Firebase not initialized" → Check .env
   - "Invalid API key" → Check Firebase credentials
   - "Network error" → Check internet connection

### Check 4: Server Logs

Look at your terminal where `npm run dev` is running:

- Look for errors
- Look for "Firebase Admin not initialized"
- Look for "Token verification failed"

---

## Common Issues & Solutions

### Issue 1: "Firebase not initialized"

**Solution:**

1. Check `.env` has all Firebase variables
2. Restart server
3. Clear browser cache
4. Try again

### Issue 2: "Invalid API key"

**Solution:**

1. Go to Firebase Console
2. Project Settings → General
3. Copy the correct API key
4. Update `NUXT_PUBLIC_FIREBASE_API_KEY` in `.env`
5. Restart server

### Issue 3: "Token verification failed"

**Solution:**

1. Log out
2. Clear browser data
3. Log in again
4. Token should refresh

### Issue 4: "User not found"

**Solution:**

1. Sign up for a new account
2. Or check Firestore has user data
3. Firebase Console → Firestore → users collection

---

## Testing Auth Flow

### Test 1: Sign Up

```
1. Visit /signup
2. Enter email: test@example.com
3. Enter password: Test123456
4. Submit
5. Should redirect to /dashboard
```

### Test 2: Check User State

Open browser console and run:

```javascript
// Check if user is logged in
console.log("User:", window.$nuxt.$state.auth?.user?.value);

// Check if Firebase Auth is working
console.log("Firebase User:", window.$nuxt.$firebaseAuth?.currentUser);
```

### Test 3: Check Token

Open browser console and run:

```javascript
// Get current token
window.$nuxt.$firebaseAuth?.currentUser?.getIdToken().then((token) => {
  console.log("Token:", token);
});
```

### Test 4: Test API Call

Open browser console and run:

```javascript
// Test campaigns API
fetch("/api/campaigns?page=1&limit=12", {
  headers: {
    Authorization:
      "Bearer " + (await window.$nuxt.$firebaseAuth?.currentUser?.getIdToken()),
  },
})
  .then((r) => r.json())
  .then(console.log);
```

---

## Manual Fix: Create Test User

If auth is completely broken, let's create a test user manually:

### Step 1: Create User in Firebase

1. Go to Firebase Console → Authentication
2. Click **Add user**
3. Email: `test@example.com`
4. Password: `Test123456`
5. Click **Add user**

### Step 2: Create User in Firestore

1. Go to Firebase Console → Firestore
2. Click **Start collection**
3. Collection ID: `users`
4. Document ID: (auto-generate)
5. Add fields:
   ```
   firebaseUid: (copy from Authentication)
   email: test@example.com
   emailVerified: false
   status: active
   createdAt: (current timestamp)
   updatedAt: (current timestamp)
   ```
6. Click **Save**

### Step 3: Log In

1. Visit http://localhost:3000/login
2. Email: `test@example.com`
3. Password: `Test123456`
4. Submit
5. Should work!

---

## Debug Mode

Add this to your `.env` to see more logs:

```env
NODE_ENV=development
DEBUG=*
```

Then restart server and check logs.

---

## Complete Reset

If nothing works, do a complete reset:

### Step 1: Clear Everything

```bash
# Stop server
# Clear node_modules
rm -rf node_modules .nuxt .output

# Reinstall
npm install
```

### Step 2: Clear Browser

1. Clear all browser data
2. Close browser
3. Reopen browser

### Step 3: Restart

```bash
npm run dev
```

### Step 4: Sign Up Fresh

1. Visit http://localhost:3000/signup
2. Use a NEW email
3. Create account
4. Should work!

---

## Verification Checklist

After fixing, verify:

- [ ] Can visit homepage
- [ ] Can click "Sign up"
- [ ] Can create account
- [ ] Redirects to /dashboard
- [ ] Dashboard loads (no 401 error)
- [ ] Can click "Create Campaign"
- [ ] Can create campaign
- [ ] Campaign appears in dashboard
- [ ] Can click campaign to view details
- [ ] Can copy shareable link
- [ ] Shareable link works

---

## Summary

**Most Common Issue:** Not logged in or session expired

**Quick Fix:**

1. Clear browser data
2. Restart server
3. Log in again
4. Should work!

**If Still Broken:**

1. Check Firebase credentials in `.env`
2. Check Firebase Auth is enabled
3. Check browser console for errors
4. Check server logs for errors
5. Try creating user manually in Firebase

---

## Need More Help?

Check these files for errors:

- Browser Console (F12)
- Server logs (terminal)
- `.env` file (Firebase credentials)
- Firebase Console (Auth & Firestore)

The auth system is working correctly in the code. The issue is likely:

1. Not logged in
2. Session expired
3. Firebase credentials wrong
4. Firebase Auth not enabled

**Just log in again and it should work!** 🔐
