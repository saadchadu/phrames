# 🔍 Check Server Logs for the Real Error

## The 500 Error Means:

You ARE logged in ✅, but the server is crashing when trying to fetch campaigns.

## What to Do:

### Step 1: Restart Server with Logs Visible
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Try to Load Dashboard
1. Visit http://localhost:3000/dashboard
2. Watch the terminal where `npm run dev` is running
3. Look for error messages

### Step 3: Look for These Patterns:

#### Pattern 1: Firestore Error
```
❌ Failed to initialize Firestore: ...
```
**Means:** Firebase credentials are wrong

**Fix:**
- Check `.env` has correct `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Make sure private key has `\n` for newlines

#### Pattern 2: Missing Index
```
The query requires an index...
```
**Means:** Firestore needs an index created

**Fix:**
- Click the link in the error message
- It will open Firebase Console
- Click "Create Index"
- Wait 2-3 minutes
- Try again

#### Pattern 3: Permission Denied
```
Missing or insufficient permissions
```
**Means:** Firestore rules or service account permissions

**Fix:**
- Check Firebase Console → Firestore → Rules
- Make sure service account has permissions

#### Pattern 4: Asset Loading Error
```
Missing frame asset...
```
**Means:** Campaign has invalid asset reference

**Fix:**
- This happens if you created campaigns before fixing storage
- Delete old campaigns from Firestore
- Create new campaigns

### Step 4: Share the Error

Copy the error from terminal and share it. The logs now show:
- ✅ Which step is failing
- ✅ What user ID is being used
- ✅ How many campaigns were found
- ✅ What assets are being loaded

---

## Common Errors & Fixes

### Error: "Firebase Admin not initialized"

**Fix:**
```bash
# Check .env
cat .env | grep FIREBASE_

# Should see:
# FIREBASE_PROJECT_ID=phrames-app
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...
```

If missing, add them and restart server.

### Error: "The query requires an index"

**Fix:**
1. Click the URL in the error message
2. Opens Firebase Console
3. Click "Create Index"
4. Wait 2-3 minutes for index to build
5. Refresh dashboard

### Error: "Missing frame asset"

**Fix:**
1. Go to Firebase Console → Firestore
2. Find the `campaigns` collection
3. Delete all documents
4. Create a new campaign
5. Should work now

### Error: "ENOENT: no such file or directory"

**Fix:**
```bash
# Create uploads directory
mkdir -p public/uploads/frames
mkdir -p public/uploads/thumbs

# Restart server
npm run dev
```

---

## What the Logs Show Now:

```
[firestore] Listing campaigns for user: abc123
[firestore] Fetching campaigns with offset=0, limit=12
[firestore] Found 0 campaigns
[firestore] Processed 0 campaign records
[firestore] Loading 0 assets
[firestore] Fetching campaign totals
[firestore] Returning 0 campaigns
✅ Firestore initialized successfully
```

This tells you exactly where it's failing!

---

## Next Steps:

1. **Restart server** with `npm run dev`
2. **Visit dashboard** at http://localhost:3000/dashboard
3. **Watch terminal** for error messages
4. **Copy the error** and share it
5. **I'll tell you exactly what to fix!**

The logs will now show the exact line where it's failing. 🔍
