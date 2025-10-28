# 🔥 Firebase Firestore Database

## ✅ Using Firestore Instead of PostgreSQL

Your app now uses **Firebase Firestore** as the database! No PostgreSQL setup required.

---

## 🎯 What Changed

### Before (PostgreSQL + Prisma)
- ❌ Required PostgreSQL installation
- ❌ Required database migrations
- ❌ Required `DATABASE_URL` environment variable
- ❌ Complex setup

### After (Firebase Firestore)
- ✅ No database installation needed
- ✅ No migrations required
- ✅ Automatic scaling
- ✅ Real-time capabilities
- ✅ Free tier: 1GB storage, 50K reads/day

---

## 📋 Setup Steps

### 1. Enable Firestore in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Click **Create database**
5. Choose **Start in production mode** (we'll add security rules later)
6. Select a location (choose closest to your users)
7. Click **Enable**

### 2. Configure Firebase Admin SDK

You already have this if you set up Firebase Authentication!

```env
# Firebase Admin (Server) - Already configured
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. That's It!

No database URL, no migrations, no setup. Firestore is ready to use!

---

## 📊 Firestore Collections

Your app uses these collections:

### `users`
```typescript
{
  id: string (auto-generated)
  firebaseUid: string
  email: string
  emailVerified: boolean
  status: 'active' | 'suspended'
  createdAt: string (ISO timestamp)
  updatedAt: string (ISO timestamp)
}
```

### `sessions`
```typescript
{
  id: string (auto-generated)
  userId: string
  createdAt: string (ISO timestamp)
  expiresAt: string (ISO timestamp)
}
```

### `campaigns`
```typescript
{
  id: string (auto-generated)
  userId: string
  name: string
  slug: string (unique)
  description?: string
  visibility: 'public' | 'unlisted'
  status: 'active' | 'archived' | 'suspended'
  frameAssetId: string
  thumbnailAssetId: string
  aspectRatio: string
  createdAt: string (ISO timestamp)
  updatedAt: string (ISO timestamp)
}
```

### `assets`
```typescript
{
  id: string (auto-generated)
  ownerUserId: string
  type: 'frame_png' | 'thumb_png'
  storageKey: string
  width: number
  height: number
  sizeBytes: number
  createdAt: string (ISO timestamp)
}
```

### `campaign_stats_daily`
```typescript
{
  id: string (auto-generated)
  campaignId: string
  date: string (YYYY-MM-DD)
  visits: number
  renders: number
  downloads: number
}
```

---

## 🔒 Security Rules

Add these Firestore security rules:

1. Go to **Firestore Database** → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId);
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read, write: if isAuthenticated();
    }
    
    // Campaigns collection
    match /campaigns/{campaignId} {
      allow read: if true; // Public read for campaign pages
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Assets collection
    match /assets/{assetId} {
      allow read: if true; // Public read for images
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        resource.data.ownerUserId == request.auth.uid;
    }
    
    // Campaign stats
    match /campaign_stats_daily/{statId} {
      allow read: if isAuthenticated();
      allow write: if true; // Allow public writes for metrics
    }
    
    // Audit logs
    match /audit_logs/{logId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Slug history
    match /campaign_slug_history/{historyId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

3. Click **Publish**

---

## 🚀 Running the App

### No Database Setup Required!

```bash
# Just start the server
npm run dev
```

That's it! Firestore is automatically connected via Firebase Admin SDK.

---

## 🧪 Testing

### 1. Test Authentication

```bash
# Start server
npm run dev

# Sign up with Google or email/password
# User will be automatically created in Firestore
```

### 2. View Data in Firebase Console

1. Go to **Firestore Database** in Firebase Console
2. You'll see collections appear as users sign up:
   - `users` - User accounts
   - `sessions` - Active sessions
   - `campaigns` - Created campaigns (when feature is implemented)

### 3. Query Data

```bash
# No Prisma Studio needed!
# Use Firebase Console to view and query data
```

---

## 📈 Advantages of Firestore

### vs PostgreSQL

| Feature | Firestore | PostgreSQL |
|---------|-----------|------------|
| Setup | ✅ Zero setup | ❌ Install + configure |
| Scaling | ✅ Automatic | ❌ Manual |
| Backups | ✅ Automatic | ❌ Manual |
| Real-time | ✅ Built-in | ❌ Requires setup |
| Free Tier | ✅ Generous | ❌ None |
| Maintenance | ✅ Zero | ❌ Regular |

### Free Tier Limits

- **Storage**: 1 GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day

Perfect for getting started!

---

## 💰 Pricing

### Free Tier (Spark Plan)
- 1 GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day
- 10 GB/month bandwidth

### Pay-as-you-go (Blaze Plan)
- $0.18/GB storage/month
- $0.06 per 100K reads
- $0.18 per 100K writes
- $0.02 per 100K deletes
- $0.12/GB bandwidth

**Estimated costs for 1000 users:**
- ~$5-10/month

---

## 🔧 Development Tips

### View Data
- Use Firebase Console → Firestore Database
- Real-time updates as data changes
- Easy filtering and querying

### Backup Data
```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups

# Import Firestore data
gcloud firestore import gs://your-bucket/backups
```

### Monitor Usage
- Go to Firebase Console → Usage and billing
- Set up budget alerts
- Monitor read/write operations

---

## 🐛 Troubleshooting

### "Firebase Admin not initialized"

**Cause:** Missing Firebase Admin SDK credentials

**Solution:**
1. Check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in `.env`
2. Restart server: `npm run dev`

### "Permission denied" errors

**Cause:** Firestore security rules too restrictive

**Solution:**
1. Go to Firestore Database → Rules
2. Update rules (see Security Rules section above)
3. Click Publish

### Data not appearing

**Cause:** Collection doesn't exist yet

**Solution:**
- Collections are created automatically when first document is added
- Sign up a user to create `users` collection
- Create a campaign to create `campaigns` collection

---

## 📚 Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Pricing Calculator](https://firebase.google.com/pricing)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## ✅ Checklist

- [ ] Firestore enabled in Firebase Console
- [ ] Firebase Admin SDK configured in `.env`
- [ ] Security rules published
- [ ] Server started successfully
- [ ] Can sign up/login
- [ ] User appears in Firestore Console
- [ ] Session created in Firestore

---

## 🎉 You're Ready!

Your app now uses **Firebase Firestore** as the database:
- ✅ No PostgreSQL needed
- ✅ No migrations needed
- ✅ Automatic scaling
- ✅ Real-time capabilities
- ✅ Free tier available

**Just configure Firebase Admin SDK and you're good to go!** 🚀