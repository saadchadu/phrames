# 🚀 Cloudflare R2 - Quick Start (10 Minutes)

## ✅ Code is Ready!

I've updated your app to use Cloudflare R2. Just get your credentials and you're done!

---

## Quick Steps

### 1️⃣ Create Cloudflare Account (2 min)
- Go to: https://dash.cloudflare.com/sign-up
- Sign up (no credit card!)
- Verify email

### 2️⃣ Enable R2 (1 min)
- Dashboard → R2
- Click "Purchase R2 Plan" (it's free!)
- Confirm

### 3️⃣ Create Bucket (2 min)
- Click "Create bucket"
- Name: `phrames-assets`
- Location: Automatic
- Create bucket
- Settings → Public access → Allow Access
- **Copy Public URL**: `https://pub-xxxxx.r2.dev`

### 4️⃣ Get API Credentials (3 min)
- R2 → Manage R2 API Tokens
- Create API token
- Name: `phrames-app`
- Permissions: Object Read & Write
- Create
- **Copy:**
  - Access Key ID
  - Secret Access Key
  - Endpoint URL

### 5️⃣ Update .env (1 min)
Add to your `.env` file:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=phrames-assets
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**Extract Account ID from endpoint:**
```
https://[ACCOUNT_ID].r2.cloudflarestorage.com
       ^^^^^^^^^^^
```

### 6️⃣ Restart & Test (1 min)
```bash
npm run dev
```
- Create a test campaign
- Upload PNG frame
- ✅ Done!

---

## What You Get (FREE)

- ✅ **10 GB storage** (2x Firebase!)
- ✅ **Unlimited downloads** (no bandwidth fees!)
- ✅ **No credit card** required
- ✅ **Production ready**

---

## Need Help?

See **CLOUDFLARE_R2_SETUP.md** for detailed instructions with screenshots.

---

## Summary

**Time:** 10 minutes
**Cost:** $0 forever
**Storage:** 10 GB
**Bandwidth:** Unlimited

**Your app is ready to go!** 🎉
