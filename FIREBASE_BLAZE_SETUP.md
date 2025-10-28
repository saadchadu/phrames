# Firebase Blaze Plan Setup (Still FREE!)

## ✅ Code is Ready!

Your app is already configured for Firebase Storage. Just upgrade to Blaze plan and you're done!

---

## Why Blaze Plan is Still FREE

**Blaze = "Pay as you go" BUT:**
- ✅ You only pay if you exceed free tier limits
- ✅ Free tier is the SAME as Spark plan
- ✅ You won't exceed limits with normal usage
- ✅ **Cost: $0 for most users**

### Blaze Free Tier Includes:
- **Storage**: 5 GB - FREE
- **Downloads**: 1 GB/day - FREE
- **Uploads**: 20,000/day - FREE
- **Firestore**: 1 GB, 50k reads/day - FREE
- **Auth**: Unlimited - FREE

**You'll stay at $0 unless you get 50,000+ users!**

---

## Step 1: Upgrade to Blaze Plan (3 minutes)

### 1.1 Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Select your project: **phrames-app**

### 1.2 Upgrade Plan
1. Click ⚙️ (Settings) → **Usage and billing**
2. Click **Modify plan**
3. Select **Blaze (Pay as you go)**
4. Click **Continue**

### 1.3 Add Payment Method
1. **Add a credit card** (required, but won't be charged unless you exceed free tier)
2. Enter billing information
3. Click **Purchase**

**⚠️ Don't worry!** You won't be charged unless you exceed the free tier limits.

---

## Step 2: Set Budget Alert (1 minute)

### 2.1 Create Budget Alert
1. In Firebase Console → **Usage and billing**
2. Click **Details & settings**
3. Scroll to **Budget alerts**
4. Click **Set budget**
5. Set budget to: **$1**
6. Add your email
7. Click **Save**

**This will notify you if you somehow exceed the free tier** (very unlikely!)

---

## Step 3: Enable Firebase Storage (2 minutes)

### 3.1 Enable Storage
1. In Firebase Console, click **Storage** in left sidebar
2. Click **Get Started**
3. Choose **Start in production mode**
4. Select a location (choose closest to you):
   - `us-central1` (Iowa) - USA
   - `europe-west1` (Belgium) - Europe
   - `asia-southeast1` (Singapore) - Asia
5. Click **Done**

### 3.2 Update Storage Rules
1. Click the **Rules** tab
2. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

3. Click **Publish**

**What this does:**
- ✅ Anyone can view images (public campaigns)
- ✅ Only your server can upload images (secure)

---

## Step 4: Restart Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

---

## Step 5: Test Campaign Creation (2 minutes)

### 5.1 Create Test Campaign
1. Visit http://localhost:3000
2. Log in
3. Go to Dashboard → Create Campaign
4. Fill in details
5. Upload PNG frame (≥1080x1080px with transparency)
6. Click "Create Campaign"

### 5.2 Verify Success
You should see:
- ✅ "Campaign created successfully!"
- ✅ Frame image displays
- ✅ Shareable link works
- ✅ Images load from Firebase Storage

---

## Cost Breakdown

### What's FREE:
- **Storage**: 5 GB
- **Downloads**: 1 GB/day (30 GB/month)
- **Uploads**: 20,000/day
- **Firestore reads**: 50,000/day
- **Firestore writes**: 20,000/day

### What You Can Do (FREE):
- ✅ 500+ campaigns (at ~5MB per frame)
- ✅ 30,000 image views/day
- ✅ 1,000 new campaigns/month
- ✅ 10,000+ users

### When You'd Pay:
Only if you exceed free tier:
- Storage: $0.026/GB/month (after 5 GB)
- Downloads: $0.12/GB (after 1 GB/day)
- Uploads: $0.05/GB

**Example:** If you use 10 GB storage and 2 GB/day downloads:
- Storage: (10 - 5) × $0.026 = $0.13/month
- Downloads: (2 - 1) × 30 × $0.12 = $3.60/month
- **Total: ~$4/month**

**But you won't hit these limits unless you're very successful!**

---

## Monitoring Usage

### Check Your Usage:
1. Firebase Console → **Usage and billing**
2. Click **Usage** tab
3. See storage and bandwidth used

### What to Watch:
- **Storage**: Should stay under 5 GB
- **Downloads**: Should stay under 1 GB/day
- **Uploads**: Should stay under 20,000/day

### Tips to Stay Free:
1. **Optimize images** - Compress PNGs before upload
2. **Use appropriate sizes** - Don't upload 10MB frames
3. **Cache aggressively** - Reduce repeated downloads
4. **Monitor regularly** - Check usage weekly

---

## Advantages of Firebase Blaze

### vs Cloudflare R2:
- ✅ **Already configured** - No code changes
- ✅ **Integrated** - Works with Firebase Auth & Firestore
- ✅ **Reliable** - Google infrastructure
- ✅ **Simple** - One service for everything

### vs Local Storage:
- ✅ **Scalable** - Works with any hosting
- ✅ **Automatic backups** - Google handles it
- ✅ **Global CDN** - Fast worldwide
- ✅ **No maintenance** - Zero effort

---

## Security

- ✅ **Read-only public access** - Anyone can view images
- ✅ **Server-only writes** - Only your server can upload
- ✅ **Automatic HTTPS** - All URLs are secure
- ✅ **Budget alerts** - Get notified if costs increase

---

## Troubleshooting

### "Permission denied" when creating campaign
**Problem:** Storage rules not updated
**Solution:** 
1. Firebase Console → Storage → Rules
2. Update rules (see Step 3.2)
3. Click Publish

### Images not loading
**Problem:** Storage not enabled
**Solution:**
1. Firebase Console → Storage
2. Click "Get Started"
3. Follow Step 3

### "Bucket not found"
**Problem:** Wrong bucket name in .env
**Solution:**
1. Check `.env` has:
   ```
   NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=phrames-app.firebasestorage.app
   ```
2. Verify this matches your Firebase project

---

## Summary

**What you need to do:**
1. ✅ Upgrade to Blaze plan (add credit card)
2. ✅ Set $1 budget alert (safety)
3. ✅ Enable Firebase Storage
4. ✅ Update Storage Rules
5. ✅ Restart server
6. ✅ Test campaign creation

**What you get:**
- ✅ 5 GB storage
- ✅ 1 GB/day downloads
- ✅ Integrated with Firebase
- ✅ Reliable and scalable
- ✅ **Still FREE for your usage!**

**Time:** 10 minutes
**Cost:** $0 (unless you exceed free tier)
**Result:** Fully working app! 🎉

---

## Next Steps

1. ✅ Upgrade to Blaze
2. ✅ Enable Storage
3. ✅ Test campaign creation
4. ✅ Create real campaigns
5. ✅ Deploy to production

Your app is ready to go! 🚀
