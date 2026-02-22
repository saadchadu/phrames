# Debugging Invoice 404 Issue

## Current Status
The invoice print route exists at `app/invoice/[paymentId]/print/page.tsx` but is returning 404.

## Possible Causes

### 1. Missing Invoice Data
The route calls `notFound()` if `paymentData.invoiceNumber` doesn't exist. I've updated the code to auto-generate invoice data if missing.

### 2. Build Cache Issue
Next.js might be serving a cached 404 page.

### 3. Environment Variables Not Set in Production
Firebase Admin credentials might not be properly configured in Vercel.

## Steps to Fix

### Step 1: Clear Build Cache and Rebuild

```bash
# Delete .next folder
rm -rf .next

# Rebuild
npm run build

# Test locally
npm run dev
```

Then visit: `http://localhost:3000/invoice/[ACTUAL_PAYMENT_ID]/print`

### Step 2: Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Click on the latest deployment
5. Go to "Functions" tab
6. Look for logs from the invoice print route

Look for these log messages:
- `[Invoice Print] Accessing print page for payment: [id]`
- `[Invoice Print] Payment status: [status]`
- `[Invoice Print] Has invoice number: [true/false]`

### Step 3: Test the Print Route Directly

Visit this URL in your browser (replace with actual payment ID):
```
https://phrames.cleffon.com/invoice/[PAYMENT_ID]/print
```

You should see the invoice template, NOT a 404 page.

### Step 4: Verify Environment Variables in Vercel

Make sure these are set in Vercel:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_APP_URL`

### Step 5: Redeploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Fix invoice PDF generation with logging and auto-generation"
git push

# Or use Vercel CLI
vercel --prod
```

## Testing Checklist

- [ ] Local dev server works (`npm run dev`)
- [ ] Print route accessible directly in browser
- [ ] Invoice template renders (not 404)
- [ ] PDF download works from payment detail page
- [ ] Toast countdown appears
- [ ] PDF contains actual invoice data (not 404 page)

## Quick Test Command

To test a specific payment ID locally:

```bash
# Start dev server
npm run dev

# In another terminal, test the route
curl http://localhost:3000/invoice/[PAYMENT_ID]/print
```

You should see HTML output, not a 404 error.

## If Still Getting 404

1. Check if the payment exists in Firestore
2. Check if payment status is "SUCCESS" or "success"
3. Check Vercel function logs for error messages
4. Verify Firebase Admin SDK is initialized correctly
5. Check if there's a middleware blocking the route

## Updated Files

The following files have been updated with fixes:
- `app/invoice/[paymentId]/print/page.tsx` - Added logging and auto-generation
- `lib/pdf/generateInvoicePDF.ts` - Added URL logging
- `app/api/invoice/[paymentId]/route.ts` - Added base URL logging
- `components/pdf/InvoiceDownloadToast.tsx` - New countdown toast
- `app/dashboard/payments/[paymentId]/page.tsx` - Integrated toast
- `app/globals.css` - Added slideIn animation
