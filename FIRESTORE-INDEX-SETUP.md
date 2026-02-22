# Firestore Index Setup

## Quick Fix

You need to create a Firestore composite index for the payments query.

### Option 1: Click the Link (Easiest)

Click this link from the error message:
```
https://console.firebase.google.com/v1/r/project/phrames-app/firestore/indexes?create_composite=...
```

This will automatically create the required index.

### Option 2: Deploy via Firebase CLI

1. Make sure you have Firebase CLI installed:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Deploy the indexes:
```bash
firebase deploy --only firestore:indexes
```

The `firestore.indexes.json` file has been created with the required index configuration.

### Option 3: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (phrames-app)
3. Go to Firestore Database → Indexes
4. Click "Create Index"
5. Configure:
   - Collection ID: `payments`
   - Fields to index:
     - `userId` - Ascending
     - `createdAt` - Descending
   - Query scope: Collection
6. Click "Create"

## What This Index Does

This composite index allows the payment history page to query:
- All payments for a specific user (`userId`)
- Sorted by creation date (`createdAt` descending)

## Index Build Time

- Small databases: ~1 minute
- Large databases: May take longer
- You'll receive an email when the index is ready

## Verification

After the index is created:
1. Refresh the `/dashboard/payments` page
2. The error should be gone
3. Payments should load successfully

## firestore.indexes.json

The configuration file has been created at the root of your project:

```json
{
  "indexes": [
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### "Index already exists"
- The index is already created, just wait for it to build
- Check the Indexes tab in Firebase Console for status

### "Permission denied"
- Make sure you're logged in with the correct account
- Verify you have admin access to the Firebase project

### "Firebase CLI not found"
- Install it: `npm install -g firebase-tools`
- Or use the web console method instead

---

**Estimated Time:** 1-5 minutes
**Status:** Required for payment history to work
