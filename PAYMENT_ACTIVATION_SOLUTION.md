# Solution: Campaigns Not Activating After Payment

## Problem Statement
After users complete payment successfully, their campaigns are not being activated automatically.

## Root Cause
The most likely cause is that **Cashfree webhooks are not reaching your server**. The webhook handler is properly implemented, but if Cashfree doesn't send the webhook (or it's not configured), the campaign won't activate.

## Immediate Solution (For Existing Stuck Campaigns)

### Option 1: Automated Fix (Recommended)
```bash
# First, check what would be fixed (dry run)
npx ts-node -r tsconfig-paths/register scripts/fix-stuck-campaigns.ts --dry-run

# If the output looks correct, run it for real
npx ts-node -r tsconfig-paths/register scripts/fix-stuck-campaigns.ts
```

This script will:
- Find all successful payments with inactive campaigns
- Activate each campaign with proper expiry dates
- Create audit logs for tracking

### Option 2: Manual Fix (For Single Campaign)
```bash
# Diagnose the issue first
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>

# Then manually activate
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <CAMPAIGN_ID>
```

## Long-Term Solution (Prevent Future Issues)

### Step 1: Configure Cashfree Webhooks ⚠️ CRITICAL

1. **Login to Cashfree Merchant Dashboard**
   - Production: https://merchant.cashfree.com/merchants/live
   - Sandbox: https://merchant.cashfree.com/merchants/test

2. **Navigate to Webhooks**
   - Go to: Developers → Webhooks (or Settings → Webhooks)

3. **Add Webhook Configuration**
   - Webhook URL: `https://phrames.cleffon.com/api/payments/webhook`
   - Events to enable:
     - ✅ Payment Success Webhook
     - ✅ Payment Failed Webhook (optional but recommended)
     - ✅ Payment Refund Webhook (optional but recommended)
   - Method: POST
   - Format: JSON

4. **Save and Test**
   - Save the configuration
   - Use Cashfree's "Test Webhook" feature to verify it works
   - Check your Firestore `logs` collection for `webhook_received` events

### Step 2: Verify Configuration

Run this command to check your setup:
```bash
npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <ANY_CAMPAIGN_ID>
```

Look for:
- ✅ Environment variables are set
- ✅ Webhook URL is correct
- ✅ Recent webhook activity in logs

### Step 3: Monitor Webhook Health

Create a simple monitoring dashboard or cron job to check:

```bash
# Check for stuck campaigns daily
npx ts-node -r tsconfig-paths/register scripts/fix-stuck-campaigns.ts --dry-run
```

If any stuck campaigns are found, investigate why webhooks aren't working.

## How It Works

### Normal Payment Flow
```
1. User clicks "Activate Campaign"
   ↓
2. Frontend calls /api/payments/initiate
   ↓
3. Server creates payment record in Firestore
   ↓
4. Server creates Cashfree order
   ↓
5. User redirected to Cashfree payment page
   ↓
6. User completes payment
   ↓
7. Cashfree sends webhook to /api/payments/webhook ← THIS IS THE CRITICAL STEP
   ↓
8. Webhook handler activates campaign
   ↓
9. User sees active campaign in dashboard
```

### What's Happening Now (Without Webhook)
```
Steps 1-6: ✅ Working
Step 7: ❌ Webhook not received
Steps 8-9: ❌ Never executed
```

## Verification Steps

After configuring webhooks, test with a real payment:

1. **Create a test campaign**
2. **Initiate payment** (use minimum amount plan)
3. **Complete payment** on Cashfree
4. **Check logs immediately**:
   ```bash
   # Check if webhook was received
   # Look in Firestore logs collection for:
   # - eventType: 'webhook_received'
   # - eventType: 'payment_success'
   # - eventType: 'campaign_activated'
   ```
5. **Verify campaign is active** in dashboard

## Troubleshooting

### Issue: Webhook URL Returns 404
**Cause:** Incorrect webhook URL or routing issue

**Fix:**
- Verify URL is exactly: `https://phrames.cleffon.com/api/payments/webhook`
- Test manually: `curl -X POST https://phrames.cleffon.com/api/payments/webhook`
- Should return 200 OK (even with empty body)

### Issue: Webhook Received But Campaign Not Activated
**Cause:** Error in webhook processing

**Fix:**
1. Check Firestore `logs` collection for `webhook_error` or `webhook_failure` events
2. Look at error details in log metadata
3. Common issues:
   - User is blocked
   - Payment record not found (order ID mismatch)
   - Campaign doesn't exist

### Issue: Webhooks Work Sometimes But Not Always
**Cause:** Timeout or server overload

**Fix:**
- Check server logs for errors
- Increase server timeout settings
- Optimize webhook handler performance

## Security Note

The webhook signature verification is currently disabled in the code:

```typescript
// In app/api/payments/webhook/route.ts
if (false && process.env.CASHFREE_ENV === 'PRODUCTION') {
```

**This is intentional for debugging.** Once webhooks are working reliably, you should:

1. Change `false` to `true` to enable verification
2. Test that webhooks still work
3. This prevents unauthorized webhook calls

## Monitoring & Alerts

### Set Up Daily Checks
Create a cron job (e.g., using Vercel Cron or GitHub Actions):

```yaml
# .github/workflows/check-stuck-campaigns.yml
name: Check Stuck Campaigns
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npx ts-node -r tsconfig-paths/register scripts/fix-stuck-campaigns.ts --dry-run
```

### Set Up Alerts
If stuck campaigns are found:
- Send email to admin
- Post to Slack channel
- Create GitHub issue

## Testing Webhooks Locally

If you need to test webhooks during development:

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Update webhook URL in Cashfree to: https://abc123.ngrok.io/api/payments/webhook
# Make a test payment
# Watch the ngrok web interface for webhook requests
```

## Support Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `diagnose-payment-issue.ts` | Comprehensive diagnostic | `npx ts-node -r tsconfig-paths/register scripts/diagnose-payment-issue.ts <CAMPAIGN_ID>` |
| `fix-stuck-campaigns.ts` | Find and fix all stuck campaigns | `npx ts-node -r tsconfig-paths/register scripts/fix-stuck-campaigns.ts [--dry-run]` |
| `manually-activate-campaign.ts` | Manually activate one campaign | `npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <CAMPAIGN_ID>` |
| `check-payment-status.ts` | Check payment and campaign status | `npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <CAMPAIGN_ID>` |

## Summary

**Immediate Action:**
1. Run `fix-stuck-campaigns.ts` to activate existing stuck campaigns
2. Configure webhook URL in Cashfree dashboard

**Long-term:**
1. Monitor webhook health daily
2. Set up alerts for stuck campaigns
3. Re-enable webhook signature verification once stable

**Prevention:**
- Webhooks are now properly configured
- Monitoring catches any future issues
- Automated recovery fixes stuck campaigns

## Questions?

If you need help:
1. Run the diagnostic script and share the output
2. Check Cashfree dashboard for webhook logs
3. Check Firestore `logs` collection for error details
4. Provide campaign ID and order ID for investigation
