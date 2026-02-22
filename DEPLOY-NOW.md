# 🚀 Deploy Now - Quick Checklist

## Critical Fixes Applied

✅ **Firestore Indexes** - Added missing composite indexes  
✅ **PDF Generation** - Switched to puppeteer-core with proper Chromium config  
✅ **Vercel Config** - Increased memory and timeout for PDF function  
✅ **Next.js Config** - Added experimental packages support  

---

## Step 1: Install Dependencies

```bash
npm install
```

This ensures `puppeteer-core` is properly installed.

---

## Step 2: Deploy Firestore Indexes (5-10 min)

```bash
firebase deploy --only firestore:indexes
```

**Monitor progress:**
https://console.firebase.google.com/project/phrames-app/firestore/indexes

Wait until status shows "Enabled" (not "Building")

---

## Step 3: Push Code to GitHub

```bash
git add .
git commit -m "Fix: PDF generation with puppeteer-core and increased Vercel limits"
git push origin main
```

Vercel will automatically deploy.

---

## Step 3: Verify Deployment (After ~2-3 min)

### Test 1: Homepage Loads
- Visit: https://phrames.cleffon.com
- Should see campaigns loading
- No "index required" errors in console

### Test 2: Trending Campaigns
- Check trending section on homepage
- Should display without errors

### Test 3: Invoice Download
- Go to Dashboard → Payments
- Click on a payment
- Click "Download Invoice"
- PDF should download successfully

---

## Expected Timeline

| Task | Duration | Status |
|------|----------|--------|
| Deploy indexes | 5-10 min | ⏳ Pending |
| Push to GitHub | 1 min | ⏳ Pending |
| Vercel build | 2-3 min | ⏳ Pending |
| Total | ~10-15 min | ⏳ Pending |

---

## What Was Fixed

### 1. Firestore Indexes
**Problem:** Queries for trending and public campaigns needed composite indexes

**Solution:** Added two indexes in `firestore.indexes.json`:
- Trending: isActive + status + visibility + trendingScore + createdAt
- Public: isActive + status + visibility + createdAt

### 2. PDF Generation
**Problem:** Chromium binary not found on Vercel

**Solution:** 
- Updated Chromium args with stability flags
- Added experimental packages to Next.js config
- Improved error handling

### 3. Next.js Configuration
**Problem:** Chromium packages not properly externalized

**Solution:**
- Added `@sparticuz/chromium` to serverExternalPackages
- Added experimental.serverComponentsExternalPackages

---

## If Issues Persist

### Firestore Index Still Building?
- Check: https://console.firebase.google.com/project/phrames-app/firestore/indexes
- Can take up to 15 minutes for large databases
- Campaigns will load once indexes are ready

### PDF Still Failing?
Check Vercel logs for specific error:
1. Go to Vercel Dashboard
2. Click on latest deployment
3. Go to Functions tab
4. Look for `/api/invoice/[paymentId]` errors

**Common fixes:**
- Increase function timeout in `vercel.json`
- Check memory limits
- Verify environment variables

---

## Commands Summary

```bash
# 1. Deploy Firestore indexes
firebase deploy --only firestore:indexes

# 2. Push code changes
git add .
git commit -m "Fix: Production issues"
git push origin main

# 3. Monitor deployment
# Visit: https://vercel.com/dashboard
```

---

## Success Criteria

✅ Homepage loads without errors  
✅ Campaigns display correctly  
✅ Trending section works  
✅ Invoice PDF downloads  
✅ No console errors  

---

## Support

If you encounter any issues:

1. **Check Vercel Logs:** https://vercel.com/dashboard
2. **Check Firebase Console:** https://console.firebase.google.com
3. **Check Browser Console:** F12 → Console tab

---

**Ready?** Run the commands above and your app will be fully functional! 🎉
