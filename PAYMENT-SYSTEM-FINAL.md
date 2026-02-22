# Payment & Invoice System - Final Implementation

## Overview

Complete payment history and invoice system with Puppeteer-based PDF generation, transaction-safe invoice numbering, and secure access control.

## ✅ Features Implemented

### 1. Payment History (`/dashboard/payments`)
- View all user payments
- Filter by status (All/Success/Failed)
- Responsive table/card layout
- Download invoice buttons
- Real-time Firestore data

### 2. Payment Detail Page (`/dashboard/payments/[paymentId]`)
- Complete payment information
- Campaign details with links
- Payment timeline
- GST breakdown
- Download invoice button
- Billing information

### 3. Invoice System
- **Format**: PHR-XXXXXX (e.g., PHR-000001)
- **Generation**: Transaction-safe using Firestore
- **Storage**: `/settings/invoiceCounter`
- **Auto-increment**: Atomic operations prevent duplicates

### 4. PDF Generation
- **Method**: Puppeteer + HTML template
- **Production**: @sparticuz/chromium for Vercel
- **Template**: `/invoice/[paymentId]/print`
- **API**: `/api/invoice/[paymentId]`
- **Format**: A4, print-optimized

### 5. Security
- Firebase authentication required
- Ownership verification
- Admin override capability
- Server-side PDF generation only
- No client-side invoice creation

## Data Structure

### Firestore: `/payments/{paymentId}`

```typescript
{
  // Payment Info
  paymentId: string
  orderId: string
  cashfreePaymentId: string
  userId: string
  campaignId: string
  campaignName: string
  
  // Plan Details
  planType: 'week' | 'month' | '3month' | '6month' | 'year'
  planName: string
  validityDays: number
  
  // Amounts
  amount: number          // Base amount
  baseAmount: number      // Same as amount
  gstRate: number         // 18
  gstAmount: number       // Calculated GST
  totalAmount: number     // Base + GST
  currency: 'INR'
  
  // Status
  status: 'SUCCESS' | 'FAILED' | 'pending'
  
  // Timestamps
  createdAt: Timestamp
  completedAt: Timestamp
  expiresAt: Timestamp
  invoiceDate: Timestamp
  
  // Invoice
  invoiceNumber: string   // PHR-000001
  
  // User Details
  userName: string
  userEmail: string
  
  // Company Details
  companyDetails: {
    name: 'Phrames'
    email: 'support@phrames.cleffon.com'
    address: 'Cleffon Technologies, India'
    gstin?: string
  }
  
  // Webhook Data
  webhookData: object
  webhookReceivedAt: Timestamp
}
```

### Firestore: `/settings/invoiceCounter`

```typescript
{
  lastInvoiceNumber: number  // Auto-increments
}
```

## Invoice Numbering

### Format
- **Pattern**: `PHR-XXXXXX`
- **Padding**: 6 digits, zero-padded
- **Examples**: 
  - PHR-000001
  - PHR-000042
  - PHR-123456

### Implementation
```typescript
// Transaction-safe increment
const invoiceNumber = await db.runTransaction(async (transaction) => {
  const counterDoc = await transaction.get(counterRef)
  const nextNumber = (counterDoc.data()?.lastInvoiceNumber || 0) + 1
  transaction.set(counterRef, { lastInvoiceNumber: nextNumber }, { merge: true })
  return `PHR-${String(nextNumber).padStart(6, '0')}`
})
```

### Safety Features
- Atomic transactions prevent race conditions
- Fallback to timestamp if transaction fails
- No duplicate numbers possible
- Survives concurrent requests

## PDF Generation Flow

### 1. User Clicks Download
```typescript
const response = await fetch(`/api/invoice/${paymentId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 2. API Validates Request
- Verify authentication
- Check payment ownership
- Validate payment status
- Confirm invoice exists

### 3. Puppeteer Generates PDF
```typescript
// Navigate to print page
await page.goto(`${baseUrl}/invoice/${paymentId}/print`)

// Wait for fonts
await page.evaluateHandle('document.fonts.ready')

// Generate PDF
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true
})
```

### 4. Return PDF
- Content-Type: application/pdf
- Content-Disposition: attachment
- Filename: Invoice-PHR-XXXXXX.pdf

## Routes

### User Pages
- `/dashboard/payments` - Payment history
- `/dashboard/payments/[paymentId]` - Payment details

### Print Route
- `/invoice/[paymentId]/print` - HTML invoice template (server-rendered)

### API Route
- `/api/invoice/[paymentId]` - PDF download endpoint

## Security Model

### Authentication
- Firebase ID token required
- Passed in Authorization header
- Verified on every request

### Authorization
```typescript
// Users can only access their own payments
if (!isAdmin && payment.userId !== currentUser.uid) {
  return 403 Forbidden
}

// Admins can access all payments
if (isAdmin) {
  // Allow access
}
```

### Invoice Generation Rules
1. Only successful payments get invoices
2. Only webhook can create invoices
3. Free campaigns don't get invoices
4. Failed payments don't get invoices
5. Client cannot manually create invoices

## Invoice Template

### Design System
- Matches Phrames branding
- Clean, professional layout
- Print-optimized
- Mobile-friendly

### Sections
1. **Header**
   - Company name
   - Company address
   - Support email
   - GSTIN (if available)

2. **Invoice Details**
   - Invoice number
   - Invoice date
   - Payment ID
   - Order ID

3. **Billing To**
   - User name
   - User email

4. **Service Details**
   - Campaign activation description
   - Campaign name
   - Validity period
   - Activation date
   - Expiry date
   - Base amount
   - GST breakdown
   - Total amount

5. **Footer**
   - System-generated notice
   - Thank you message

## Webhook Integration

### On Payment Success
1. Generate invoice number (PHR-XXXXXX)
2. Calculate GST (18%)
3. Fetch user details
4. Fetch campaign details
5. Update payment record with invoice data
6. Activate campaign
7. Set expiry date

### Invoice Data Stored
```typescript
{
  invoiceNumber: 'PHR-000001',
  invoiceDate: Timestamp.now(),
  gstRate: 18,
  gstAmount: 89.82,
  totalAmount: 588.82,
  userName: 'John Doe',
  userEmail: 'john@example.com',
  campaignName: 'My Campaign',
  planName: '3 Months',
  validityDays: 90,
  companyDetails: { ... }
}
```

## Environment Variables

### Required
```env
# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# App URL (for PDF generation)
NEXT_PUBLIC_APP_URL=https://your-domain.com
# OR
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Optional
```env
# Vercel (auto-set in production)
VERCEL=1
NODE_ENV=production
```

## Dependencies

```json
{
  "puppeteer": "^23.11.1",
  "@sparticuz/chromium": "^131.0.2"
}
```

## Deployment

### Vercel Configuration
```json
{
  "functions": {
    "app/api/invoice/[paymentId]/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

Required index:
- Collection: `payments`
- Fields: `userId` (ASC), `createdAt` (DESC)

### Firestore Rules
```javascript
match /payments/{paymentId} {
  allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
  allow write: if false; // Only server can write
}

match /settings/invoiceCounter {
  allow read, write: if false; // Only server can access
}
```

## Testing

### Test Payment Flow
1. Create campaign
2. Initiate payment (sandbox)
3. Complete payment
4. Verify webhook processed
5. Check invoice number generated
6. View in `/dashboard/payments`
7. Download PDF
8. Verify PDF content

### Test Security
1. Try accessing another user's payment (should fail)
2. Try downloading another user's invoice (should fail)
3. Verify authentication required
4. Test admin access

### Test Edge Cases
1. Failed payment (no invoice)
2. Free campaign (no invoice)
3. Concurrent payments (no duplicate numbers)
4. Expired campaign (invoice still downloadable)
5. Mobile download

## Performance

### PDF Generation
- Average time: 2-5 seconds
- Max duration: 30 seconds
- Cached: No (private data)

### Optimization
- Puppeteer reuses browser instances
- Fonts preloaded
- Minimal external resources
- A4 format optimized

## Troubleshooting

### PDF Generation Fails
- Check Puppeteer installation
- Verify @sparticuz/chromium in production
- Check maxDuration setting
- Verify base URL is correct

### Invoice Number Duplicates
- Check transaction is working
- Verify counter document exists
- Check for concurrent requests

### Download Fails
- Verify authentication
- Check payment ownership
- Verify payment status is SUCCESS
- Check invoice number exists

## Files Structure

```
app/
├── api/
│   └── invoice/
│       └── [paymentId]/
│           └── route.ts          # PDF download API
├── dashboard/
│   └── payments/
│       ├── page.tsx              # Payment history
│       └── [paymentId]/
│           └── page.tsx          # Payment details
└── invoice/
    └── [paymentId]/
        └── print/
            └── page.tsx          # HTML invoice template

components/
└── pdf/
    └── PaymentInvoiceTemplate.tsx # Invoice HTML component

lib/
├── invoice.ts                    # Invoice utilities
└── pdf/
    └── generateInvoicePDF.ts     # Puppeteer PDF generator
```

## Support

For issues:
1. Check Firestore logs
2. Review webhook logs
3. Check browser console
4. Contact: support@phrames.cleffon.com

---

**Status**: Production Ready ✅
**Version**: 2.0.0
**Last Updated**: February 22, 2026
