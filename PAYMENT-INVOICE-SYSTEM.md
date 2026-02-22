# Payment & Invoice System Documentation

## Overview

Complete payment history and invoice generation system for Phrames, integrated with Cashfree payment gateway and Firebase.

## Features Implemented

### ✅ 1. Payment History Page (`/dashboard/payments`)
- View all payments (successful, failed, pending)
- Filter by status (All, Success, Failed)
- Sortable table with invoice numbers, campaign names, plans, amounts, dates
- Download invoice button for successful payments
- Responsive design (desktop table + mobile cards)
- Real-time data from Firestore

### ✅ 2. Payment Detail Page (`/dashboard/payments/[paymentId]`)
- Detailed payment information
- Campaign details with link to campaign
- Payment breakdown (base amount + GST)
- Timeline of payment events
- Download invoice button
- Billing information
- Secure access (users can only view their own payments)

### ✅ 3. Invoice Generation System
- Professional PDF invoices using @react-pdf/renderer
- GST-ready format (18% GST calculation)
- Auto-generated invoice numbers (INV-YYYY-NNNN format)
- Company details and branding
- Detailed billing breakdown
- Computer-generated invoice footer

### ✅ 4. Secure Invoice Download API (`/api/invoice/[paymentId]`)
- Server-side PDF generation
- Authentication required (Firebase token)
- Ownership verification (users can only download their own invoices)
- Admin access to all invoices
- Proper PDF headers and file naming
- Rate limiting ready

### ✅ 5. Enhanced Webhook Integration
- Automatic invoice generation on successful payment
- Invoice number assignment
- GST calculation and storage
- User details capture for invoices
- Campaign details storage
- Expiry date calculation

### ✅ 6. Navigation Integration
- Payments link in dashboard
- Payments link in mobile menu
- Easy access from anywhere in the app

## Data Structure

### Firestore Collections

#### `payments/{paymentId}`
```typescript
{
  // Payment Info
  paymentId: string
  orderId: string
  cashfreePaymentId: string
  userId: string
  campaignId: string
  campaignName: string
  planType: 'week' | 'month' | '3month' | '6month' | 'year'
  planName: string
  validityDays: number
  
  // Amounts
  amount: number          // Base amount
  baseAmount: number      // Same as amount
  gstPercentage: number   // 18
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
  
  // Invoice Details
  invoiceNumber: string   // INV-2026-0001
  
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

#### `counters/invoices-{year}`
```typescript
{
  count: number
  year: number
}
```

## Invoice Number Logic

Format: `INV-YYYY-NNNN`

Examples:
- `INV-2026-0001`
- `INV-2026-0002`
- `INV-2026-9999`

Implementation:
- Auto-increments per year
- Uses Firestore transactions for atomicity
- Resets counter each year
- Fallback to timestamp-based if transaction fails

## API Routes

### GET `/api/invoice/[paymentId]`

**Authentication:** Required (Bearer token)

**Authorization:** 
- Users can only access their own invoices
- Admins can access all invoices

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Invoice-{invoiceNumber}.pdf"`

**Error Codes:**
- 401: Unauthorized (missing/invalid token)
- 403: Access denied (not owner)
- 404: Payment not found
- 400: Invoice not available (payment not successful)
- 500: Server error

## Security Features

### ✅ Authentication
- Firebase token verification required
- Token passed in Authorization header

### ✅ Authorization
- Users can only view/download their own payments
- Admin override for support purposes
- Payment ownership verified on every request

### ✅ Data Validation
- Payment status checked before invoice generation
- Invoice existence verified
- User ownership validated

### ✅ Rate Limiting Ready
- API route structured for rate limiting
- Can add rate limiting middleware easily

## Invoice PDF Format

### Header
- Company name (Phrames)
- Company address
- Support email
- GSTIN (if available)

### Invoice Details
- Invoice number
- Invoice date
- Payment ID
- Order ID

### Billing To
- User name
- User email

### Service Details Table
- Description: Campaign Activation - {Plan Name}
- Campaign name
- Validity period
- Base amount
- GST (18%)
- Total amount

### Footer
- Computer-generated invoice notice
- Thank you message

## Testing Checklist

### ✅ Payment History Page
- [x] Displays all user payments
- [x] Filters work correctly
- [x] Responsive on mobile
- [x] Download button works
- [x] View details link works
- [x] Empty state displays correctly

### ✅ Payment Detail Page
- [x] Shows complete payment info
- [x] Campaign link works
- [x] Timeline displays correctly
- [x] Download invoice works
- [x] Access control enforced

### ✅ Invoice Generation
- [x] PDF generates correctly
- [x] All data displays properly
- [x] GST calculation correct
- [x] Invoice number format correct
- [x] File downloads with correct name

### ✅ Webhook Integration
- [x] Invoice created on successful payment
- [x] Invoice number assigned
- [x] GST calculated and stored
- [x] User details captured
- [x] Failed payments don't generate invoices

### ✅ Security
- [x] Authentication required
- [x] Ownership verified
- [x] Admin access works
- [x] Proper error messages

## Usage Examples

### Download Invoice (Client-side)
```typescript
const handleDownloadInvoice = async (paymentId: string) => {
  const token = await user?.getIdToken()
  
  const response = await fetch(`/api/invoice/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Invoice-${invoiceNumber}.pdf`
  a.click()
}
```

### Generate Invoice Number (Server-side)
```typescript
import { generateInvoiceNumber } from '@/lib/invoice'

const invoiceNumber = await generateInvoiceNumber()
// Returns: "INV-2026-0001"
```

### Calculate GST
```typescript
import { calculateGST } from '@/lib/invoice'

const { baseAmount, gstAmount, totalAmount } = calculateGST(199, 18)
// baseAmount: 199
// gstAmount: 36
// totalAmount: 235
```

## Future Enhancements

### Recommended
- [ ] Email invoice automatically after payment
- [ ] "Resend Invoice" button
- [ ] Download all invoices as ZIP
- [ ] GST number input from user (B2B)
- [ ] Invoice preview before download
- [ ] Payment receipt (separate from invoice)

### Optional
- [ ] Multi-currency support
- [ ] Custom invoice templates
- [ ] Invoice customization per user
- [ ] Bulk invoice download
- [ ] Invoice search functionality
- [ ] Export to accounting software

## Troubleshooting

### Invoice not generating
1. Check payment status is 'SUCCESS'
2. Verify webhook processed successfully
3. Check Firestore logs collection
4. Verify invoice number counter exists

### Download fails
1. Check user authentication
2. Verify payment ownership
3. Check browser console for errors
4. Verify API route is accessible

### Invoice number duplicates
1. Check counter document in Firestore
2. Verify transaction is working
3. Check for concurrent requests

### PDF rendering issues
1. Verify @react-pdf/renderer is installed
2. Check PDF component syntax
3. Verify data is complete
4. Check server logs for errors

## Dependencies

```json
{
  "@react-pdf/renderer": "^4.2.0"
}
```

## Files Created/Modified

### New Files
- `lib/invoice.ts` - Invoice utilities
- `lib/invoice-pdf.tsx` - PDF template
- `app/api/invoice/[paymentId]/route.ts` - Invoice download API
- `app/dashboard/payments/page.tsx` - Payment history page
- `app/dashboard/payments/[paymentId]/page.tsx` - Payment detail page

### Modified Files
- `app/api/payments/webhook/route.ts` - Enhanced with invoice generation
- `app/dashboard/page.tsx` - Added payments link
- `components/Navbar.tsx` - Added payments link
- `package.json` - Added @react-pdf/renderer

## Support

For issues or questions:
- Check Firestore logs collection
- Review webhook processing logs
- Contact: support@phrames.cleffon.com

---

**Last Updated:** February 22, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
