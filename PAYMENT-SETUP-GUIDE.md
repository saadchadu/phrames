# Payment & Invoice System - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

The `@react-pdf/renderer` package has been added to `package.json`.

### 2. Create Firestore Index (Required!)

The payment history page requires a composite index. You have 3 options:

**Option A: Click the error link** (Easiest)
- When you see the index error, click the link in the error message
- It will auto-create the index for you

**Option B: Deploy via CLI**
```bash
firebase deploy --only firestore:indexes
```

**Option C: Manual creation**
- See [FIRESTORE-INDEX-SETUP.md](FIRESTORE-INDEX-SETUP.md) for detailed instructions

The index typically builds in 1-5 minutes.

### 3. No Other Configuration Needed!

The payment and invoice system is fully integrated with your existing:
- Firebase setup
- Cashfree configuration
- Authentication system

### 3. Test the System

#### For Existing Payments
If you already have successful payments in Firestore, they won't have invoice data. You have two options:

**Option A: Make a new test payment**
1. Create a campaign
2. Make a payment (use Cashfree sandbox mode)
3. Payment webhook will automatically generate invoice
4. View in `/dashboard/payments`

**Option B: Manually add invoice data to existing payments**
Run this script to update existing successful payments:

```typescript
// scripts/add-invoices-to-existing-payments.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { generateInvoiceNumber, calculateGST, COMPANY_DETAILS } from '../lib/invoice'

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore()

async function addInvoicesToExistingPayments() {
  const paymentsSnapshot = await db.collection('payments')
    .where('status', '==', 'SUCCESS')
    .get()

  console.log(`Found ${paymentsSnapshot.size} successful payments`)

  for (const doc of paymentsSnapshot.docs) {
    const data = doc.data()
    
    // Skip if already has invoice number
    if (data.invoiceNumber) {
      console.log(`Payment ${doc.id} already has invoice`)
      continue
    }

    // Generate invoice data
    const invoiceNumber = await generateInvoiceNumber()
    const gstCalc = calculateGST(data.amount || 0, 18)

    // Update payment with invoice data
    await doc.ref.update({
      invoiceNumber,
      invoiceDate: data.completedAt || data.createdAt,
      gstPercentage: 18,
      gstAmount: gstCalc.gstAmount,
      totalAmount: gstCalc.totalAmount,
      baseAmount: data.amount,
      companyDetails: COMPANY_DETAILS
    })

    console.log(`Added invoice ${invoiceNumber} to payment ${doc.id}`)
  }

  console.log('Done!')
}

addInvoicesToExistingPayments()
```

### 4. Access the Payment System

#### As a User
1. Go to `/dashboard`
2. Click "Payments" button
3. View payment history
4. Click on any successful payment to see details
5. Download invoice PDF

#### As an Admin
- Access all user payments via admin panel
- Download any invoice for support purposes

## Features Available

### ✅ Payment History
- URL: `/dashboard/payments`
- View all your payments
- Filter by status
- Download invoices

### ✅ Payment Details
- URL: `/dashboard/payments/[paymentId]`
- Complete payment information
- Timeline view
- Download invoice

### ✅ Invoice Download
- API: `/api/invoice/[paymentId]`
- Professional PDF format
- GST-ready
- Secure access

## Testing Checklist

### Test Payment Flow
1. [ ] Create a new campaign
2. [ ] Initiate payment (sandbox mode)
3. [ ] Complete payment
4. [ ] Check webhook processed successfully
5. [ ] Verify invoice number generated
6. [ ] View payment in `/dashboard/payments`
7. [ ] Click to view payment details
8. [ ] Download invoice PDF
9. [ ] Verify PDF content is correct

### Test Security
1. [ ] Try accessing another user's payment (should fail)
2. [ ] Try downloading another user's invoice (should fail)
3. [ ] Verify authentication required
4. [ ] Test admin access (if admin)

### Test Edge Cases
1. [ ] View failed payment (no invoice button)
2. [ ] View pending payment (no invoice button)
3. [ ] Empty payment history
4. [ ] Mobile responsive design

## Firestore Setup

### Required Collections

The system uses these collections (auto-created):

#### `payments`
- Stores all payment records
- Updated by webhook on payment success
- Includes invoice data

#### `counters`
- Stores invoice number counters
- Auto-increments per year
- Format: `invoices-{year}`

### Firestore Rules

Add these rules to allow users to read their own payments:

```javascript
// In firestore.rules
match /payments/{paymentId} {
  // Users can read their own payments
  allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
  
  // Only server can write
  allow write: if false;
}

match /counters/{counterId} {
  // Only server can access
  allow read, write: if false;
}
```

## Webhook Configuration

The webhook is already configured to generate invoices automatically.

### Webhook URL
```
https://your-domain.com/api/payments/webhook
```

### What Happens on Successful Payment
1. Webhook receives payment success event
2. Generates invoice number (INV-YYYY-NNNN)
3. Calculates GST (18%)
4. Fetches user and campaign details
5. Updates payment record with invoice data
6. Activates campaign
7. User can now download invoice

## Company Details

Update company information in `lib/invoice.ts`:

```typescript
export const COMPANY_DETAILS = {
  name: 'Phrames',
  email: 'support@phrames.cleffon.com',
  address: 'Cleffon Technologies, India',
  gstin: '' // Add your GSTIN here
}
```

## Customization

### Change GST Percentage
In `lib/invoice.ts`:
```typescript
// Default is 18%
const gstCalculation = calculateGST(amount, 18)

// Change to different percentage
const gstCalculation = calculateGST(amount, 12)
```

### Customize Invoice Template
Edit `lib/invoice-pdf.tsx` to modify:
- Layout
- Colors
- Fonts
- Sections
- Branding

### Add More Payment Details
In webhook handler (`app/api/payments/webhook/route.ts`), add more fields to the payment update.

## Troubleshooting

### "Invoice not available"
- Payment status must be 'SUCCESS'
- Check webhook processed successfully
- Verify invoiceNumber field exists in payment document

### "Payment not found"
- Check payment ID is correct
- Verify user is authenticated
- Check Firestore permissions

### PDF Download Fails
- Check browser console for errors
- Verify API route is accessible
- Check server logs
- Ensure @react-pdf/renderer is installed

### Invoice Number Not Generating
- Check Firestore counters collection
- Verify transaction permissions
- Check server logs for errors

## Production Checklist

Before going live:

### Configuration
- [ ] Update COMPANY_DETAILS with real information
- [ ] Add GSTIN if applicable
- [ ] Set Cashfree to PRODUCTION mode
- [ ] Configure proper webhook URL

### Testing
- [ ] Test complete payment flow
- [ ] Verify invoice generation
- [ ] Test PDF download
- [ ] Check mobile responsiveness
- [ ] Verify security (ownership checks)

### Monitoring
- [ ] Set up error logging
- [ ] Monitor webhook processing
- [ ] Track invoice generation
- [ ] Monitor PDF generation performance

### Documentation
- [ ] Train support team
- [ ] Document common issues
- [ ] Create user guide
- [ ] Set up monitoring alerts

## Support

For issues:
1. Check Firestore logs collection
2. Review webhook logs
3. Check browser console
4. Contact: support@phrames.cleffon.com

## Next Steps

After setup:
1. Test with sandbox payments
2. Verify invoice generation
3. Review PDF format
4. Train team on new features
5. Deploy to production
6. Monitor for issues

---

**Setup Time:** ~5 minutes
**Complexity:** Low (fully integrated)
**Status:** Ready to use ✅
