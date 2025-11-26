# Quick Fix: Campaign Not Activating After Payment

## Immediate Action Steps

### Step 1: Identify the Campaign
Get the campaign ID from the user or dashboard.

### Step 2: Run Diagnostic
```bash
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>
```

This will tell you:
- ✅ If payment was successful
- ✅ If webhook was received
- ✅ Why campaign didn't activate

### Step 3: Manual Activation (If Needed)
If payment succeeded but campaign didn't activate:

```bash
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <CAMPAIGN_ID>
```

## Root Cause Analysis

Based on the code review, here are the most likely issues:

### Issue 1: Webhook Not Configured in Cashfree ⚠️ MOST COMMON
**Symptom:** No webhook logs in Firestore

**Fix:**
1. Login to Cashfree Merchant Dashboard
2. Go to: Developers → Webhooks
3. Add webhook URL: `https://phrames.cleffon.com/api/payments/webhook`
4. Enable events: "Payment Success Webhook"
5. Save configuration

### Issue 2: Order ID Mismatch
**Symptom:** "Payment record not found for order" in logs

**How it works:**
- Payment initiation creates: `orderId` and `cashfreeOrderId`
- Webhook sends: `data.order.order_id`
- Lookup tries both fields (should work)

**Fix:** Already handled in code - `getPaymentByOrderId` checks both fields

### Issue 3: Webhook Signature Verification Disabled
**Current State:** Intentionally disabled for debugging

```typescript
// In webhook route.ts line 68:
if (false && process.env.CASHFREE_ENV === 'PRODUCTION') {
```

**Action:** This is OK for now - helps with debugging. Re-enable after confirming webhooks work.

### Issue 4: User Blocked
**Symptom:** Payment succeeds but campaign not activated

**Check:**
```bash
# Check if user is blocked
firebase firestore:get users/<USER_ID>
```

**Fix:** Set `isBlocked: false` in user document

## Webhook Flow Diagram

```
User Pays → Cashfree → Webhook → Your Server
                          ↓
                    Verify Signature (disabled)
                          ↓
                    Log webhook_received
                          ↓
                    Find payment by orderId
                          ↓
                    Check user not blocked
                          ↓
                    Update campaign (isActive: true)
                          ↓
                    Update payment (status: success)
                          ↓
                    Log payment_success
```

## Debugging Checklist

- [ ] **Webhook URL configured in Cashfree?**
  - URL: `https://phrames.cleffon.com/api/payments/webhook`
  - Events: Payment Success enabled
  
- [ ] **Payment record exists in Firestore?**
  - Collection: `payments`
  - Check: `orderId` and `cashfreeOrderId` fields
  
- [ ] **Webhook received?**
  - Collection: `logs`
  - Event: `webhook_received`
  - Check: `metadata.orderId` matches payment
  
- [ ] **User not blocked?**
  - Collection: `users`
  - Check: `isBlocked` field is false or undefined
  
- [ ] **Campaign exists?**
  - Collection: `campaigns`
  - Check: Campaign ID is valid

## Common Scenarios

### Scenario A: No Webhook Logs
**Diagnosis:** Webhooks not reaching server

**Actions:**
1. Configure webhook URL in Cashfree dashboard
2. Test webhook from Cashfree dashboard
3. Check server logs for incoming requests
4. Verify no firewall blocking

### Scenario B: Webhook Received, Payment Not Found
**Diagnosis:** Order ID mismatch

**Actions:**
1. Check payment record `orderId` field
2. Check payment record `cashfreeOrderId` field
3. Compare with webhook `data.order.order_id`
4. Manually activate if payment is valid

### Scenario C: Webhook Received, User Blocked
**Diagnosis:** User account blocked

**Actions:**
1. Check user document `isBlocked` field
2. Unblock user if appropriate
3. Manually activate campaign

### Scenario D: Webhook Received, Processing Failed
**Diagnosis:** Error in webhook handler

**Actions:**
1. Check `webhook_failure` or `webhook_error` logs
2. Look for error message in log metadata
3. Fix underlying issue
4. Manually activate campaign

## Prevention Measures

### 1. Webhook Health Monitoring
Create a cron job to check:
- Successful payments without active campaigns
- Webhook success rate
- Processing time

### 2. Automated Recovery
Create a script to:
- Find successful payments with inactive campaigns
- Automatically activate them
- Send notification

### 3. User Notification
Add email notification when:
- Payment succeeds
- Campaign activates
- Activation fails (with support link)

## Testing Webhooks

### Test in Cashfree Dashboard
1. Go to Cashfree Dashboard → Developers → Webhooks
2. Click "Test Webhook"
3. Select "Payment Success"
4. Check if webhook is received in logs

### Test Locally with ngrok
```bash
# Start your dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Update webhook URL in Cashfree to ngrok URL
# Example: https://abc123.ngrok.io/api/payments/webhook

# Make a test payment
# Check ngrok web interface for webhook requests
```

## Support Scripts

All scripts are in the `scripts/` directory:

```bash
# Comprehensive diagnostic
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>

# Check payment status
npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <CAMPAIGN_ID>

# Check specific payment
npx ts-node -r tsconfig-paths/register scripts/check-specific-payment.ts <CAMPAIGN_ID>

# Manually activate campaign
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <CAMPAIGN_ID>

# Activate by webhook order (if you have order ID)
npx ts-node -r tsconfig-paths/register scripts/activate-by-webhook-order.ts <ORDER_ID>
```

## Quick Reference

### Firestore Collections
- `campaigns` - Campaign data
- `payments` - Payment records
- `logs` - System logs (webhooks, errors, etc.)
- `users` - User data

### Important Log Event Types
- `webhook_received` - Webhook was received
- `payment_success` - Payment processed successfully
- `campaign_activated` - Campaign was activated
- `webhook_failure` - Webhook processing failed
- `webhook_error` - Error in webhook handler
- `payment_initiated` - Payment was initiated

### Environment Variables
```bash
CASHFREE_CLIENT_ID=<your-client-id>
CASHFREE_CLIENT_SECRET=<your-client-secret>
CASHFREE_ENV=PRODUCTION
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com
```

## Next Steps

1. **Immediate:** Run diagnostic script for affected campaigns
2. **Short-term:** Configure webhook URL in Cashfree dashboard
3. **Medium-term:** Add webhook health monitoring
4. **Long-term:** Implement automated recovery and user notifications
