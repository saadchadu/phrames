# Production Issues Fixed

## Issue 1: Firestore Index Missing ✅

**Error:**
```
The query requires an index
```

**Fix Applied:**
Added missing composite indexes to `firestore.indexes.json`:

1. **Trending campaigns index:**
   - isActive → status → visibility → trendingScore → createdAt

2. **Public campaigns index:**
   - isActive → status → visibility → createdAt

**Deploy the indexes:**
```bash
firebase deploy --only firestore:indexes
```

This will take a few minutes to build. You can monitor progress at:
https://console.firebase.google.com/project/phrames-app/firestore/indexes

---

## Issue 2: PDF Generation Failing on Vercel ✅

**Error:**
```
The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist
```

**Root Cause:**
The `@sparticuz/chromium` package was having issues locating its binary files on Vercel's serverless environment.

**Fix Applied:**

1. **Switched to `puppeteer-core`** for production
   - More reliable on Vercel
   - Better compatibility with @sparticuz/chromium
   - Separate dev/prod paths

2. **Updated `lib/pdf/generateInvoicePDF.ts`:**
   - Import `puppeteer-core` instead of `puppeteer`
   - Use chromium.default.defaultViewport and chromium.default.headless
   - Added more stability flags for Vercel
   - Proper type definitions

3. **Increased Vercel Function Limits** in `vercel.json`:
   - Memory: 3008 MB (max for Pro plan)
   - Timeout: 60 seconds
   - Specific to invoice API route

4. **Added `puppeteer-core` to dependencies** in `package.json`

**Changes:**
- Import from `puppeteer-core` for better tree-shaking
- Use chromium defaults for viewport and headless mode
- Added `--single-process` flag for Vercel
- Increased function memory and timeout

---

## Deployment Steps

### 1. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

Wait for indexes to build (check Firebase Console).

### 2. Push Code Changes
```bash
git add .
git commit -m "Fix: Firestore indexes and PDF generation for Vercel"
git push origin main
```

### 3. Verify After Deployment

**Test Firestore Queries:**
- Visit homepage - should load campaigns
- Check trending section - should show trending campaigns

**Test PDF Generation:**
- Go to a payment in dashboard
- Click "Download Invoice"
- PDF should download successfully

---

## Monitoring

### Check Firestore Index Status
1. Go to: https://console.firebase.google.com/project/phrames-app/firestore/indexes
2. Wait for status to change from "Building" to "Enabled"
3. Usually takes 5-10 minutes

### Check PDF Generation
1. Monitor Vercel function logs
2. Look for "Error generating PDF" messages
3. Test with a real payment invoice

---

## If PDF Still Fails

If PDF generation still has issues on Vercel, we have a fallback option:

### Option A: Use Vercel's Built-in Chrome
Update `next.config.js`:
```javascript
experimental: {
  serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
}
```

### Option B: Alternative PDF Library
Switch to a lighter PDF generation library like `jsPDF` or `pdfkit` that doesn't require Chrome.

### Option C: External PDF Service
Use a service like:
- PDFShift
- DocRaptor
- CloudConvert

---

## Current Status

✅ Firestore indexes added to config  
✅ PDF generation code updated  
⏳ Waiting for deployment  
⏳ Waiting for index build  

---

## Next Steps

1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Push code: `git push origin main`
3. Wait for Vercel deployment
4. Wait for Firestore indexes (5-10 min)
5. Test homepage (campaigns should load)
6. Test invoice download
7. Monitor for any new errors

---

## Additional Notes

### Firestore Index Build Time
- Small databases: 2-5 minutes
- Medium databases: 5-15 minutes
- Large databases: 15-30 minutes

### PDF Generation Alternatives
If Chromium continues to have issues on Vercel, consider:
1. Using Vercel's Edge Functions with lighter PDF library
2. Moving PDF generation to Firebase Functions
3. Using a dedicated PDF service

---

**Last Updated:** February 22, 2026  
**Status:** Fixes Applied, Ready to Deploy
