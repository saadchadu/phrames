# Firebase Storage Setup

## Overview

Phrames now uses **Firebase Storage** by default for storing campaign frame images. This is simpler than S3 and requires no additional configuration beyond your existing Firebase setup.

## Why Firebase Storage?

- ✅ **Already configured** - Uses your existing Firebase project
- ✅ **No extra credentials** - Works with Firebase Admin SDK
- ✅ **Free tier** - 5GB storage, 1GB/day downloads
- ✅ **Automatic CDN** - Fast global delivery
- ✅ **Simple setup** - No additional environment variables

## Setup Instructions

### 1. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`phrames-app`)
3. Click **Storage** in the left sidebar
4. Click **Get Started**
5. Choose **Start in production mode**
6. Select a location (choose closest to your users)
7. Click **Done**

### 2. Configure Storage Rules

By default, Firebase Storage is locked down. You need to allow public read access for campaign images.

1. In Firebase Console → Storage
2. Click the **Rules** tab
3. Replace the rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;  // Only server can write
    }
  }
}
```

4. Click **Publish**

### 3. Verify Configuration

Your `.env` file should already have:
```env
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=phrames-app.firebasestorage.app
```

That's it! No additional configuration needed.

## How It Works

### Upload Flow:
1. User creates campaign with PNG frame
2. Server validates PNG (transparency, size)
3. Server uploads to Firebase Storage using Admin SDK
4. File is made publicly accessible
5. Public URL is stored in Firestore
6. Users can access images via public URL

### Storage Structure:
```
phrames-app.firebasestorage.app/
├── frames/
│   └── {userId}/
│       └── {timestamp}-{random}.png
└── thumbs/
    └── {userId}/
        └── {timestamp}-{random}.png
```

## Storage Limits (Free Tier)

- **Storage**: 5 GB
- **Downloads**: 1 GB/day
- **Uploads**: 20,000/day
- **Operations**: 50,000/day

For most use cases, this is more than enough!

## Upgrading to Paid Plan

If you exceed free tier limits:

1. Go to Firebase Console → Upgrade
2. Choose **Blaze (Pay as you go)**
3. Pricing:
   - Storage: $0.026/GB/month
   - Downloads: $0.12/GB
   - Uploads: $0.05/GB

Still very affordable for most applications.

## Monitoring Usage

1. Firebase Console → Storage
2. Click **Usage** tab
3. View storage size and bandwidth usage
4. Set up budget alerts if needed

## Public URLs

Images are served via:
```
https://storage.googleapis.com/{bucket-name}/{path}
```

Example:
```
https://storage.googleapis.com/phrames-app.firebasestorage.app/frames/user123/1234567890-abc123.png
```

## Security

- ✅ **Read-only public access** - Anyone can view images
- ✅ **Server-only writes** - Only your server can upload
- ✅ **No authentication required** - Users don't need Firebase accounts
- ✅ **Automatic HTTPS** - All URLs are secure

## Troubleshooting

### "Permission denied" errors
**Problem:** Storage rules not configured
**Solution:** Update storage rules to allow public read access (see step 2 above)

### Images not loading
**Problem:** Storage not enabled
**Solution:** Enable Firebase Storage in console (see step 1 above)

### "Bucket not found"
**Problem:** Wrong bucket name in environment
**Solution:** Check `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` matches your Firebase project

## Alternative: S3 Storage

If you prefer to use S3 instead of Firebase Storage:

1. Uncomment S3 variables in `.env`
2. Add your S3 credentials
3. The app will automatically use S3 if configured

But for most users, Firebase Storage is simpler and sufficient!

## Summary

✅ **No additional setup required** - Works with existing Firebase config
✅ **Free tier is generous** - 5GB storage, 1GB/day downloads
✅ **Simple rules** - Just allow public read access
✅ **Fast CDN** - Global content delivery
✅ **Secure** - Server-only uploads, public reads

Your campaign creation should now work perfectly!
