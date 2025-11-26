# Refund System Guide

## Overview
The refund system allows admins to process refunds for successful payments. When a refund is processed, the payment status is updated and the associated campaign is automatically deactivated.

## How It Works

### 1. Automatic Refund Tracking (via Webhook)
When you process a refund through the Cashfree dashboard:
- Cashfree sends a `PAYMENT_REFUND_WEBHOOK` to your app
- The webhook handler automatically:
  - Updates payment status to `refunded`
  - Deactivates the campaign (sets `isActive: false`, `status: 'Refunded'`)
  - Logs the refund in admin logs
  - Stores refund details (amount, refund ID, timestamp)

### 2. Manual Refund Processing (via Admin Panel)
Admins can process refunds directly from the admin payments page:

**Steps:**
1. Go to Admin → Payments
2. Find the successful payment you want to refund
3. Click the "Refund" button
4. A modal will open showing:
   - Refund amount
   - Warning that campaign will be deactivated
   - Optional text area for refund reason
5. Enter refund reason (optional)
6. Click "Process Refund" to confirm

**What happens:**
- Calls Cashfree Refunds API to process the refund
- Updates payment record with refund details
- Deactivates the associated campaign
- Creates an admin log entry
- Shows success toast notification with refund ID

## API Endpoint

### POST `/api/admin/refund`

**Headers:**
```
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentId": "payment-doc-id",
  "refundAmount": 299,  // Optional, defaults to full amount
  "refundNote": "Customer requested refund"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refundId": "cf_refund_id_from_cashfree",
  "refundAmount": 299
}
```

## Payment Status Flow

```
pending → success → refunded
         ↓
       failed
```

## Database Updates

### Payment Record
When refunded, the payment document is updated with:
- `status`: `'refunded'`
- `refundedAt`: Timestamp
- `refundAmount`: Number
- `refundId`: Cashfree refund ID
- `refundNote`: Reason for refund
- `refundedBy`: Admin UID (for manual refunds)
- `refundWebhookData`: Full webhook payload (for automatic refunds)

### Campaign Record
When refunded, the campaign is updated with:
- `isActive`: `false`
- `status`: `'Refunded'`
- `refundedAt`: Timestamp

### Admin Logs
A log entry is created with:
- `eventType`: `'payment_refunded'`
- `actorId`: Admin UID or 'system'
- `description`: Details about the refund
- `metadata`: Payment ID, order ID, campaign ID, refund amount, etc.

## Admin UI Changes

The admin payments page now shows:
- **Refund button** for successful payments (opens modal)
- **Purple badge** for refunded payments
- **Refund details** in expanded payment view
- **Toast notifications** for success/error messages
- **Copy to clipboard** with toast feedback (no more alerts)
- **RefundModal component** with:
  - Amount display
  - Warning message
  - Reason text area
  - Loading state during processing

## Cashfree Integration

The refund uses Cashfree's Refunds API:
- **Endpoint:** `POST https://api.cashfree.com/pg/orders/{order_id}/refunds`
- **Authentication:** Uses `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET`
- **API Version:** `2023-08-01`

## Testing

To test refunds:
1. Create a test payment in sandbox mode
2. Process refund via admin panel
3. Check that:
   - Payment status changes to "refunded"
   - Campaign becomes inactive
   - Admin log is created
   - Refund appears in Cashfree dashboard

## Notes

- Only successful payments can be refunded
- Refunds can be full or partial
- Campaign is automatically deactivated on refund
- All refunds are logged for audit purposes
- Refund processing is idempotent (won't refund twice)
