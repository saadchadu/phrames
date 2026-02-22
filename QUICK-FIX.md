# Quick Fix - Deploy Firestore Index

## The Error

```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Quick Fix (Choose One)

### Option 1: Click the Link (Easiest) ⭐

1. Click the link in the error message
2. It will open Firebase Console
3. Click "Create Index"
4. Wait 1-5 minutes for it to build
5. Refresh your page

### Option 2: Deploy via CLI

```bash
firebase deploy --only firestore:indexes
```

Wait 1-5 minutes for the index to build.

### Option 3: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **phrames-app**
3. Go to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Configure:
   - Collection ID: `payments`
   - Field 1: `userId` - Ascending
   - Field 2: `createdAt` - Descending
   - Query scope: Collection
6. Click **Create**
7. Wait 1-5 minutes

## Verify It's Working

After the index is built:

1. Go to `/dashboard/payments`
2. The page should load without errors
3. You should see your payments (if any)

## Why This Happens

The payment history page queries:
```typescript
where('userId', '==', user.uid)
orderBy('createdAt', 'desc')
```

This requires a composite index in Firestore.

## Status Check

Check index status in Firebase Console:
- **Building** 🟡 - Wait a few more minutes
- **Enabled** 🟢 - Ready to use!
- **Error** 🔴 - Try creating again

---

**Time to Fix:** 1-5 minutes
**Required:** Yes, payment history won't work without it
