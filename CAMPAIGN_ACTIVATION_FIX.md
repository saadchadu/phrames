# Campaign Not Activating After Payment - Diagnostic & Fix Guide

## Problem
Campaigns are not activating automatically after successful payment completion.

## Root Causes

### 1. **Webhook Not Being Received** (Most Common)
The Cashfree webhook may not be reaching your server.

**Check:**
```bash
# Run diagnostic script
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>
```

**Possible Issues:**
- Webhook URL not configured in Cashfree dashboard
- Webhook URL is incorrect
- Cashfree is not sending webhooks
- Firewall blocking webhook requests

**Fix:**
1. Go to Cashfree Dashboard → Settings → Webhooks
2. Verify webhook URL is: `https://phrames.cleffon.com/api/payments/webhook`
3. Ensure webhook is enabled for "Payment Success" events
4. Test webhook from Cashfree dashboard

### 2. **Webhook Signature Verification Disabled**
In `app/api/payments/webhook/route.ts`, signature verification is currently disabled:

```typescript
// TEMPORARILY DISABLED FOR TESTING - RE-ENABLE AFTER FIXING WEBHOOK ISSUES
if (false && process.env.CASHFREE_ENV === 'PRODUCTION') {
```

**This is intentional for debugging** but should be re-enabled once webhooks are working.

### 3. **Payment Record Not Found**
The webhook handler looks up payments by `orderId`, but there might be a mismatch.

**Check:**
```bash
# Check payment records
npx ts-node -r tsconfig-paths/register scripts/check-specific-payment.ts <CAMPAIGN_ID>
```

### 4. **User is Blocked**
The webhook handler checks if user is blocked before activating:

```typescript
if (userData?.isBlocked === true) {
  // Campaign won't activate
}
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
```bash
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>
```

This will check:
- Campaign status
- Payment records
- Webhook logs
- Configuration

### Step 2: Check Cashfree Dashboard
1. Login to Cashfree Merchant Dashboard
2. Go to Orders → Find the order
3. Check payment status
4. Check webhook logs (if available)

### Step 3: Check Application Logs
Look for these log entries in Firestore `logs` collection:
- `webhook_received` - Webhook was received
- `payment_success` - Payment processed successfully
- `campaign_activated` - Campaign was activated
- `webhook_failure` - Webhook processing failed
- `webhook_error` - Error in webhook handler

### Step 4: Manual Activation (If Needed)
If payment succeeded but campaign didn't activate:

```bash
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <CAMPAIGN_ID>
```

## Quick Fixes

### Fix 1: Verify Webhook Configuration

**Cashfree Dashboard Settings:**
- Webhook URL: `https://phrames.cleffon.com/api/payments/webhook`
- Events: Enable "Payment Success Webhook"
- Method: POST
- Format: JSON

### Fix 2: Check Environment Variables

Verify in `.env.local`:
```bash
CASHFREE_CLIENT_ID=<your-client-id>
CASHFREE_CLIENT_SECRET=<your-client-secret>
CASHFREE_ENV=PRODUCTION
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com
```

### Fix 3: Test Webhook Locally

If testing locally, use ngrok or similar:
```bash
# Start ngrok
ngrok http 3000

# Update webhook URL in Cashfree to ngrok URL
# Example: https://abc123.ngrok.io/api/payments/webhook
```

### Fix 4: Enable Webhook Logging

The webhook handler already logs extensively. Check Firestore `logs` collection for:
```javascript
{
  eventType: 'webhook_received',
  description: 'Webhook received: PAYMENT_SUCCESS_WEBHOOK for order ...',
  metadata: {
    fullPayload: { ... }
  }
}
```

## Common Issues & Solutions

### Issue: "Payment record not found for order"
**Cause:** Order ID mismatch between payment initiation and webhook

**Solution:**
1. Check payment record in Firestore
2. Compare `orderId` and `cashfreeOrderId` fields
3. Webhook uses `data.order.order_id` to lookup payment

### Issue: "User is blocked"
**Cause:** User account is blocked

**Solution:**
1. Check user document in Firestore
2. Set `isBlocked: false` if needed
3. Re-process webhook or manually activate

### Issue: "No webhook logs found"
**Cause:** Webhooks not reaching server

**Solution:**
1. Verify webhook URL in Cashfree dashboard
2. Check server logs for incoming requests
3. Verify firewall/security settings
4. Test with Cashfree webhook testing tool

### Issue: "Webhook received but campaign not activated"
**Cause:** Error in webhook processing

**Solution:**
1. Check `webhook_failure` or `webhook_error` logs
2. Look for error details in log metadata
3. Fix underlying issue
4. Manually activate campaign

## Webhook Flow

```
1. User completes payment on Cashfree
   ↓
2. Cashfree sends webhook to: /api/payments/webhook
   ↓
3. Webhook handler verifies signature (currently disabled)
   ↓
4. Handler looks up payment by orderId
   ↓
5. Handler checks if user is blocked
   ↓
6. Handler updates campaign:
   - isActive: true
   - status: 'Active'
   - planType, amountPaid, expiresAt, etc.
   ↓
7. Handler updates payment record:
   - status: 'success'
   - completedAt, webhookReceivedAt
   ↓
8. Handler creates logs for tracking
```

## Prevention

### 1. Monitor Webhook Health
Create a monitoring dashboard to track:
- Webhook success rate
- Failed webhooks
- Processing time
- Campaign activation rate

### 2. Implement Retry Logic
Add retry mechanism for failed webhook processing

### 3. Add Alerting
Set up alerts for:
- Webhooks not received for X minutes
- High webhook failure rate
- Campaigns not activating after payment

### 4. Regular Audits
Run periodic checks:
```bash
# Check for successful payments with inactive campaigns
# This indicates webhook processing failures
```

## Testing Checklist

- [ ] Webhook URL configured in Cashfree
- [ ] Webhook events enabled (Payment Success)
- [ ] Environment variables set correctly
- [ ] Payment initiation works
- [ ] Payment record created in Firestore
- [ ] Webhook received (check logs)
- [ ] Campaign activated after payment
- [ ] Expiry date set correctly
- [ ] User can access active campaign

## Support Commands

```bash
# Diagnose payment issue
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>

# Check payment status
npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <CAMPAIGN_ID>

# Check specific payment
npx ts-node -r tsconfig-paths/register scripts/check-specific-payment.ts <CAMPAIGN_ID>

# Manually activate campaign
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <CAMPAIGN_ID>

# List all users
npx ts-node -r tsconfig-paths/register scripts/list-all-users.ts
```

## Next Steps

1. Run the diagnostic script with your campaign ID
2. Check the output for specific issues
3. Follow the recommended actions
4. If webhook is not being received, configure it in Cashfree dashboard
5. If payment succeeded but campaign not activated, use manual activation script
6. Monitor logs collection for future payments

## Contact Support

If issues persist:
1. Collect diagnostic output
2. Check Cashfree dashboard for webhook logs
3. Check Firestore logs collection
4. Provide campaign ID and order ID for investigation
