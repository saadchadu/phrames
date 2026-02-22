# PDF Generation Fix - Final Solution

## Problem
PDF generation was failing on Vercel with error:
```
The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist
```

## Root Cause
The `puppeteer` package was not properly configured to work with `@sparticuz/chromium` on Vercel's serverless environment.

## Solution Applied

### 1. Switched to `puppeteer-core` ✅
**File:** `lib/pdf/generateInvoicePDF.ts`

Changed from:
```typescript
import puppeteer from 'puppeteer'
```

To:
```typescript
import puppeteer from 'puppeteer-core'
import type { Browser } from 'puppeteer-core'
```

**Why?**
- `puppeteer-core` doesn't bundle Chromium
- Works better with external Chromium binaries
- Smaller bundle size
- Better for serverless environments

### 2. Updated Chromium Configuration ✅
**File:** `lib/pdf/generateInvoicePDF.ts`

Key changes:
```typescript
// Use chromium defaults instead of hardcoded values
defaultViewport: chromium.default.defaultViewport,
headless: chromium.default.headless,

// Added critical flags for Vercel
args: [
  ...chromium.default.args,
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--single-process',  // Critical for Vercel
  '--disable-gpu',
]
```

### 3. Increased Vercel Function Limits ✅
**File:** `vercel.json`

Added:
```json
{
  "functions": {
    "app/api/invoice/[paymentId]/route.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

**Why?**
- PDF generation needs more memory
- Chromium requires significant resources
- 3008 MB is max for Vercel Pro
- 60 seconds timeout for slow connections

### 4. Added puppeteer-core Dependency ✅
**File:** `package.json`

Added:
```json
"puppeteer-core": "^24.37.5"
```

### 5. Updated Next.js Config ✅
**File:** `next.config.js`

Already configured:
```javascript
serverExternalPackages: ['firebase-admin', 'cashfree-pg', '@sparticuz/chromium', 'puppeteer-core'],
experimental: {
  serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
}
```

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Fix: PDF generation with puppeteer-core and Vercel config"
git push origin main
```

### 4. Verify Deployment
After Vercel deploys (2-3 minutes):
1. Go to a payment in dashboard
2. Click "Download Invoice"
3. PDF should download successfully

## What Changed

| File | Change | Reason |
|------|--------|--------|
| `lib/pdf/generateInvoicePDF.ts` | Import puppeteer-core | Better Vercel compatibility |
| `lib/pdf/generateInvoicePDF.ts` | Use chromium defaults | Proper configuration |
| `lib/pdf/generateInvoicePDF.ts` | Add --single-process flag | Required for Vercel |
| `vercel.json` | Increase memory to 3008 MB | PDF needs more resources |
| `vercel.json` | Set timeout to 60s | Allow time for generation |
| `package.json` | Add puppeteer-core | Explicit dependency |

## Why This Works

### puppeteer vs puppeteer-core
- **puppeteer**: Bundles Chromium (~300MB)
- **puppeteer-core**: No Chromium, uses external binary
- **Vercel**: Needs puppeteer-core + @sparticuz/chromium

### Memory Requirements
- Chromium: ~200-300 MB base
- PDF rendering: ~100-200 MB
- Node.js: ~50-100 MB
- **Total**: ~500-600 MB minimum
- **Allocated**: 3008 MB (safe margin)

### Critical Flags
- `--single-process`: Prevents multi-process issues on Vercel
- `--no-sandbox`: Required for containerized environments
- `--disable-dev-shm-usage`: Prevents /dev/shm issues
- `--no-zygote`: Disables zygote process (not needed)

## Testing

### Local Testing
```bash
npm run dev
# Test invoice download - should work
```

### Production Testing
After deployment:
1. Visit: https://phrames.cleffon.com/dashboard/payments
2. Click on any successful payment
3. Click "Download Invoice"
4. PDF should download within 5-10 seconds

## Monitoring

### Check Vercel Logs
1. Go to: https://vercel.com/dashboard
2. Click on latest deployment
3. Go to "Functions" tab
4. Look for `/api/invoice/[paymentId]`
5. Check for errors

### Success Indicators
✅ No "bin does not exist" errors
✅ PDF downloads successfully
✅ Function completes in <30 seconds
✅ Memory usage <2000 MB

### Failure Indicators
❌ Timeout errors (increase timeout)
❌ Out of memory (already at max)
❌ Chromium launch errors (check args)

## Fallback Options

If this still doesn't work:

### Option 1: Use Different PDF Library
Replace Puppeteer with:
- `jsPDF` - Pure JavaScript, no Chromium needed
- `pdfkit` - Node.js PDF generation
- `react-pdf` - React-based PDF generation

### Option 2: Move to Firebase Functions
- Deploy PDF generation to Firebase Functions
- More memory available (up to 8GB)
- Longer timeout (up to 9 minutes)

### Option 3: External PDF Service
Use a service:
- PDFShift (https://pdfshift.io)
- DocRaptor (https://docraptor.com)
- CloudConvert (https://cloudconvert.com)

## Cost Implications

### Vercel Pro Plan
- 3008 MB function: ~$0.000018 per second
- 60s timeout: ~$0.00108 per invoice
- 1000 invoices/month: ~$1.08

### Alternative: Firebase Functions
- 2GB memory: ~$0.000009 per second
- 60s timeout: ~$0.00054 per invoice
- 1000 invoices/month: ~$0.54

## Summary

✅ Switched to `puppeteer-core` for better Vercel compatibility
✅ Used chromium defaults for proper configuration
✅ Added `--single-process` flag (critical for Vercel)
✅ Increased memory to 3008 MB
✅ Set timeout to 60 seconds
✅ Added explicit `puppeteer-core` dependency

**Status:** Ready to deploy
**Expected Result:** PDF generation should work on Vercel

---

**Last Updated:** February 22, 2026
**Next Step:** Run `npm install` and push to GitHub
