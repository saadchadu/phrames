# Quick Fix: Inactive Campaign After Payment

## Immediate Solution

If you have campaigns that are stuck as inactive after successful payment, use this command:

```bash
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <campaignId> <orderId>
```

### How to Find the Information:

1. **Campaign ID**: Get from the URL when viewing the campaign, or from the admin campaigns page
2. **Order ID**: Get from the admin payments page at `/admin/payments`

### Example:

```bash
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts abc123def456 order_1732567890_abc12345
```

## Check Payment Status First

Before manually activating, check what's happening:

```bash
npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <campaignId>
```

This will show:
- Campaign current status
- Payment records and their status
- Webhook logs (or lack thereof)
- Detailed analysis of the issue

## Root Cause: Missing Webhooks

The most common reason campaigns stay inactive is that **Cashfree webhooks are not configured**.

### Fix for Future Payments:

1. Go to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Navigate to: **Developers** → **Webhooks**
3. Add webhook URL: `https://phrames.cleffon.com/api/payments/webhook`
4. Enable these events:
   - ✅ `PAYMENT_SUCCESS_WEBHOOK`
   - ✅ `PAYMENT_FAILED_WEBHOOK`
5. Save the configuration

### Verify Webhook Setup:

After configuring, test with a new payment. Check if webhooks are received:
- Go to `/admin/logs`
- Filter by event type: `payment_success` or `webhook_failure`
- You should see webhook logs appearing after payments

## Admin API Endpoint

There's also an admin API endpoint to fix campaigns programmatically:

```bash
POST /api/admin/fix-campaign
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "campaignId": "abc123def456",
  "orderId": "order_1732567890_abc12345"
}
```

This requires admin authentication.

## What Gets Updated

When a campaign is activated (either by webhook or manually), these fields are updated:

```javascript
{
  isActive: true,
  status: 'Active',
  isFreeCampaign: false,
  planType: 'month',        // from payment
  amountPaid: 299,          // from payment
  paymentId: 'order_...',   // order ID
  expiresAt: <timestamp>,   // calculated based on plan
  lastPaymentAt: <now>
}
```

## Need More Help?

See the full troubleshooting guide: `PAYMENT_TROUBLESHOOTING.md`
