# 🔧 Complete Authentication Fix

## Step 1: Debug Current State

Visit the debug page I just created:
```
http://localhost:3000/debug-auth
```

This will show you:
- ✅ Is Firebase Auth available?
- ✅ Are you logged in?
- ✅ Can you get a token?
- ✅ Can you call the API?

---

## Step 2: Based on Debug Results

### If "Firebase Auth Available: ❌ No"

**Problem:** Firebase client not initialized

**Fix:**
1. Check `.env` has these variables:
   ```env
   NUXT_PUBLIC_FIREBASE_API_KEY=...
   NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NUXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NUXT_PUBLIC_FIREBASE_APP_ID=...
   ```

2. Restart server:
   ```bash
   npm run dev
   ```

3. Refresh debug page

### If "Current User: ❌ Not logged in"

**Problem:** You're not logged in

**Fix:**
1. Click "Go to Sign Up" on debug page
2. Create an account
3. Should redirect to dashboard
4. Go back to debug page to verify

### If "User State: ❌ Not logged in" (but Firebase shows logged in)

**Problem:** Backend sync failed

**Fix:**
1. Click "Test Get Token" on debug page
2. If token shows, click "Test Campaigns API"
3. If API fails, check server logs
4. Try logging out and back in

---

## Step 3: Create Account Properly

### Method 1: Use the App (Recommended)

1. Visit http://localhost:3000/signup
2. Enter email: `your@email.com`
3. Enter password: `YourPassword123`
4. Click "Sign up"
5. Should redirect to `/dashboard`
6. Should see "No campaigns yet" (not "Unable to load campaigns")

### Method 2: Use Debug Page

1. Visit http://localhost:3000/debug-auth
2. Click "Go to Sign Up"
3. Create account
4. Return to debug page
5. Verify all checks are ✅

---

## Step 4: Verify Everything Works

After logging in, check:

1. **Debug Page** (http://localhost:3000/debug-auth)
   - [ ] Firebase Auth Available: ✅ Yes
   - [ ] Current User: ✅ Logged in
   - [ ] User State: ✅ Logged in
   - [ ] Test Get Token: Shows token
   - [ ] Test Campaigns API: Shows campaigns or empty array

2. **Dashboard** (http://localhost:3000/dashboard)
   - [ ] Loads without errors
   - [ ] Shows "No campaigns yet" or list of campaigns
   - [ ] "Create Campaign" button visible

3. **Create Campaign** (http://localhost:3000/dashboard/campaigns/new)
   - [ ] Form loads
   - [ ] Can upload PNG
   - [ ] Can submit
   - [ ] Redirects to campaign page

---

## Common Issues & Solutions

### Issue: "Firebase Auth Available: ❌ No"

**Cause:** Firebase client not initialized

**Solution:**
```bash
# 1. Check .env file
cat .env | grep NUXT_PUBLIC_FIREBASE

# 2. Should see 6 variables starting with NUXT_PUBLIC_FIREBASE_
# If not, add them from Firebase Console

# 3. Restart server
npm run dev
```

### Issue: Can't create account

**Cause:** Firebase Auth not enabled or wrong credentials

**Solution:**
1. Go to https://console.firebase.google.com
2. Select project: `phrames-app`
3. Click **Authentication**
4. Click **Sign-in method**
5. Enable **Email/Password**
6. Try signing up again

### Issue: "Invalid API key"

**Cause:** Wrong Firebase API key in `.env`

**Solution:**
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" → Web app
3. Copy the correct `apiKey`
4. Update `NUXT_PUBLIC_FIREBASE_API_KEY` in `.env`
5. Restart server

### Issue: Account created but dashboard shows 401

**Cause:** Token not being sent or backend can't verify it

**Solution:**
1. Visit debug page
2. Click "Test Get Token"
3. If token shows, the issue is backend
4. Check server logs for errors
5. Check Firebase Admin credentials in `.env`:
   ```env
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```

---

## Manual Account Creation (Last Resort)

If signup completely doesn't work:

### Step 1: Create in Firebase Auth
1. Firebase Console → Authentication
2. Click "Add user"
3. Email: `test@example.com`
4. Password: `Test123456`
5. Click "Add user"
6. Copy the UID

### Step 2: Create in Firestore
1. Firebase Console → Firestore
2. Create collection: `users`
3. Add document with auto-ID
4. Add fields:
   ```
   firebaseUid: [paste UID from step 1]
   email: test@example.com
   emailVerified: false
   status: active
   createdAt: [current timestamp]
   updatedAt: [current timestamp]
   ```
5. Save

### Step 3: Log In
1. Visit http://localhost:3000/login
2. Email: `test@example.com`
3. Password: `Test123456`
4. Submit
5. Should work!

---

## Complete Reset (Nuclear Option)

If absolutely nothing works:

```bash
# 1. Stop server
# Ctrl+C

# 2. Clear everything
rm -rf node_modules .nuxt .output

# 3. Clear browser
# Open browser DevTools (F12)
# Application → Clear storage → Clear site data

# 4. Reinstall
npm install

# 5. Verify .env
cat .env | grep FIREBASE
# Should see all Firebase variables

# 6. Start fresh
npm run dev

# 7. Visit debug page
# http://localhost:3000/debug-auth

# 8. Create new account
# Click "Go to Sign Up"
```

---

## Verification Steps

After fixing, verify in order:

1. **Debug Page**
   ```
   http://localhost:3000/debug-auth
   All checks should be ✅
   ```

2. **Dashboard**
   ```
   http://localhost:3000/dashboard
   Should load without 401 error
   ```

3. **Create Campaign**
   ```
   http://localhost:3000/dashboard/campaigns/new
   Should be able to create campaign
   ```

4. **View Campaign**
   ```
   Campaign should appear in dashboard
   Click to view details
   ```

5. **Share Link**
   ```
   Copy shareable link
   Open in incognito
   Should load campaign page
   ```

---

## Summary

**The auth system is working correctly in the code.**

The issue is one of:
1. ❌ Not logged in
2. ❌ Firebase client not initialized
3. ❌ Firebase Auth not enabled
4. ❌ Wrong credentials in `.env`

**Use the debug page to identify which one!**

Visit: http://localhost:3000/debug-auth

Then follow the appropriate fix above. 🔧
