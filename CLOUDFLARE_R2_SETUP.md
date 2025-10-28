# Cloudflare R2 Setup Guide

## ✅ Code Updated!

Your app now uses Cloudflare R2 instead of Firebase Storage. Just follow these steps to get your credentials.

---

## Step 1: Create Cloudflare Account (2 minutes)

### 1.1 Sign Up
1. Go to https://dash.cloudflare.com/sign-up
2. Enter your email and password
3. Verify your email
4. **No credit card required!**

---

## Step 2: Enable R2 (1 minute)

### 2.1 Access R2
1. Log in to Cloudflare Dashboard
2. Click **R2** in the left sidebar
3. Click **Purchase R2 Plan**
4. Confirm the free plan (no payment needed)

**Free Tier Includes:**
- ✅ 10 GB storage/month
- ✅ 1 million Class A operations (uploads)
- ✅ 10 million Class B operations (downloads)
- ✅ **Unlimited egress (downloads)** - No bandwidth fees!

---

## Step 3: Create R2 Bucket (2 minutes)

### 3.1 Create Bucket
1. In R2 dashboard, click **Create bucket**
2. **Bucket name**: `phrames-assets` (or any name you like)
3. **Location**: Choose **Automatic** (or closest to you)
4. Click **Create bucket**

### 3.2 Make Bucket Public
1. Click on your bucket: `phrames-assets`
2. Click **Settings** tab
3. Scroll to **Public access**
4. Click **Allow Access**
5. **Copy the Public bucket URL** - looks like:
   ```
   https://pub-xxxxxxxxxxxxx.r2.dev
   ```
   Save this! You'll need it for `.env`

---

## Step 4: Get API Credentials (3 minutes)

### 4.1 Create API Token
1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API token**
3. **Token name**: `phrames-app`
4. **Permissions**: Select **Object Read & Write**
5. **TTL**: Leave as default (forever)
6. **Bucket**: Select `phrames-assets` (or leave "Apply to all buckets")
7. Click **Create API Token**

### 4.2 Copy Credentials
You'll see a screen with:
- **Access Key ID** - looks like: `abc123def456...`
- **Secret Access Key** - looks like: `xyz789uvw012...`
- **Endpoint** - looks like: `https://xxxxxxxxxxxxx.r2.cloudflarestorage.com`

**⚠️ IMPORTANT:** Copy these NOW! You won't see them again.

### 4.3 Extract Account ID
From the endpoint URL, extract your account ID:
```
https://[ACCOUNT_ID].r2.cloudflarestorage.com
```
For example, if endpoint is:
```
https://abc123def456.r2.cloudflarestorage.com
```
Your account ID is: `abc123def456`

---

## Step 5: Update Your .env File (1 minute)

### 5.1 Open .env
Open your `.env` file and add these lines:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=phrames-assets
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

### 5.2 Replace with Your Values
- **R2_ACCOUNT_ID**: Extract from endpoint URL (see Step 4.3)
- **R2_ACCESS_KEY_ID**: From Step 4.2
- **R2_SECRET_ACCESS_KEY**: From Step 4.2
- **R2_BUCKET_NAME**: Your bucket name (e.g., `phrames-assets`)
- **R2_PUBLIC_URL**: Public bucket URL from Step 3.2

### Example:
```env
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=1a2b3c4d5e6f7g8h9i0j
R2_SECRET_ACCESS_KEY=k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
R2_BUCKET_NAME=phrames-assets
R2_PUBLIC_URL=https://pub-1234567890abcdef.r2.dev
```

---

## Step 6: Restart Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

---

## Step 7: Test Campaign Creation (2 minutes)

### 7.1 Create Test Campaign
1. Visit http://localhost:3000
2. Log in
3. Go to Dashboard → Create Campaign
4. Fill in details
5. Upload PNG frame (≥1080x1080px with transparency)
6. Click "Create Campaign"

### 7.2 Verify Success
You should see:
- ✅ "Campaign created successfully!"
- ✅ Frame image displays
- ✅ Shareable link works
- ✅ Images load from R2 (check URL in browser)

---

## Troubleshooting

### "R2 credentials not configured"
**Problem:** Missing environment variables
**Solution:** 
1. Check `.env` file has all R2 variables
2. Restart server after updating `.env`

### "Access Denied" errors
**Problem:** API token doesn't have correct permissions
**Solution:**
1. Go to R2 → Manage R2 API Tokens
2. Delete old token
3. Create new token with **Object Read & Write** permissions

### Images not loading
**Problem:** Bucket not public or wrong public URL
**Solution:**
1. Go to bucket → Settings → Public access
2. Click "Allow Access"
3. Copy the correct public URL
4. Update `R2_PUBLIC_URL` in `.env`

### "Bucket not found"
**Problem:** Wrong bucket name
**Solution:**
1. Check bucket name in R2 dashboard
2. Update `R2_BUCKET_NAME` in `.env`
3. Restart server

---

## What You Get (FREE Forever)

### Cloudflare R2 Free Tier:
- **Storage**: 10 GB/month
- **Class A operations**: 1 million/month (uploads, lists)
- **Class B operations**: 10 million/month (downloads)
- **Egress**: **UNLIMITED** (no bandwidth fees!)

### This is Enough For:
- ✅ 1,000+ campaigns (at ~5MB per frame)
- ✅ Unlimited downloads (no bandwidth costs!)
- ✅ 30,000+ uploads per day
- ✅ 300,000+ downloads per day

**You won't hit these limits!**

---

## Monitoring Usage

### Check Your Usage:
1. Go to Cloudflare Dashboard
2. Click **R2**
3. Click **Usage** tab
4. See storage and operations used

### Set Up Alerts:
1. Go to **Notifications**
2. Create alert for R2 usage
3. Get notified at 80% of free tier

---

## Advantages of R2

### vs Firebase Storage:
- ✅ **2x storage** (10 GB vs 5 GB)
- ✅ **Unlimited downloads** (vs 1 GB/day)
- ✅ **No credit card** required
- ✅ **S3-compatible** API

### vs S3:
- ✅ **No egress fees** (S3 charges for downloads)
- ✅ **Simpler pricing**
- ✅ **Better free tier**

---

## Production Deployment

When deploying to production:

1. **Same credentials work** - No changes needed
2. **Update NUXT_PUBLIC_SITE_URL** in `.env`
3. **R2 works with any hosting**:
   - ✅ Vercel
   - ✅ Netlify
   - ✅ Cloudflare Pages
   - ✅ Any VPS

---

## Security Notes

- ✅ **Read-only public access** - Anyone can view images
- ✅ **Server-only writes** - Only your server can upload
- ✅ **API tokens** - Keep secret, never commit to git
- ✅ **Automatic HTTPS** - All URLs are secure

---

## Summary

**What you did:**
1. ✅ Created Cloudflare account (free)
2. ✅ Enabled R2 (free)
3. ✅ Created bucket
4. ✅ Made bucket public
5. ✅ Got API credentials
6. ✅ Updated `.env` file
7. ✅ Restarted server

**What you get:**
- ✅ 10 GB storage
- ✅ Unlimited downloads
- ✅ No credit card needed
- ✅ Production-ready
- ✅ Works with any hosting

**Cost:** $0 forever! 🎉

---

## Next Steps

1. ✅ Test campaign creation
2. ✅ Verify images load from R2
3. ✅ Create real campaigns
4. ✅ Deploy to production

Your app is now using Cloudflare R2 for storage! 🚀
