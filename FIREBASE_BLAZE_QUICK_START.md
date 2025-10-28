# 🚀 Firebase Blaze - Quick Start (10 Minutes)

## ✅ Code is Ready!

Your app is configured for Firebase Storage. Just upgrade to Blaze and enable Storage!

---

## Quick Steps

### 1️⃣ Upgrade to Blaze (3 min)
1. Go to: https://console.firebase.google.com
2. Select: **phrames-app**
3. Settings → Usage and billing → Modify plan
4. Select: **Blaze (Pay as you go)**
5. Add credit card (required, but won't be charged unless you exceed free tier)
6. Purchase

### 2️⃣ Set Budget Alert (1 min)
1. Usage and billing → Details & settings
2. Budget alerts → Set budget
3. Set to: **$1**
4. Add your email
5. Save

### 3️⃣ Enable Storage (2 min)
1. Click **Storage** in sidebar
2. Get Started
3. Start in production mode
4. Select location
5. Done

### 4️⃣ Update Rules (1 min)
1. Click **Rules** tab
2. Paste:
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
3. Publish

### 5️⃣ Restart & Test (1 min)
```bash
npm run dev
```
- Create a test campaign
- Upload PNG frame
- ✅ Done!

---

## What You Get (FREE)

- ✅ **5 GB storage**
- ✅ **1 GB/day downloads** (30 GB/month)
- ✅ **20,000 uploads/day**
- ✅ **Integrated with Firebase**
- ✅ **Google infrastructure**

---

## Cost

**Free Tier:**
- Storage: 5 GB
- Downloads: 1 GB/day
- Uploads: 20,000/day

**You'll stay at $0 unless you:**
- Store 100+ GB
- Get 100,000+ users
- Have millions of downloads

**Budget alert at $1 keeps you safe!**

---

## Why Blaze is Still FREE

You only pay if you exceed free tier:
- Most apps never exceed it
- Budget alert notifies you
- You can always downgrade

**For a Twibbonize clone, you'll stay at $0!**

---

## Need Help?

See **FIREBASE_BLAZE_SETUP.md** for detailed instructions.

---

## Summary

**Time:** 10 minutes
**Cost:** $0 (free tier)
**Storage:** 5 GB
**Bandwidth:** 1 GB/day

**Your app is ready!** 🎉
