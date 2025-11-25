# Payment Troubleshooting Guide

## Problem: Campaign Stays Inactive After Payment

If a campaign remains inactive after payment completion, follow these steps to diagnose and fix the issue.

## Common Causes

1. **Webhooks not configured in Cashfree dashboard**
2. **Webhook signature verification failing**
3. **Webhook URL not accessible**
4. **Payment still pending at Cashfree**

## Step 1: Check Payment Status

Run the diagnostic script to check the payment and campaign status:

```bash
npx ts-node -r tsconfig-paths/register scripts/check-payment-status.ts <campaignId>
```

Replace `<campaignId>` with the actual campaign ID. This will show:
- Campaign activation status
- Payment records and their status
- Webhook logs
- Detailed analysis of the issue

## Step 2: Verify Cashfree Webhook Configuration

1. Log in to [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Go to **Developers** → **Webhooks**
3. Verify the webhook URL is set to: `https://phrames.cleffon.com/api/payments/webhook`
4. Ensure these events are enabled:
   - `PAYMENT_SUCCESS_WEBHOOK`
   - `PAYMENT_FAILED_WEBHOOK`
5. Check the webhook logs in Cashfree dashboard to see if webhooks were sent

## Step 3: Check Application Logs

Visit the admin panel to check logs:
- Go to: https://phrames.cleffon.com/admin/logs
- Filter by event type: `webhook_failure`, `payment_success`, `payment_failure`
- Look for any error messages

## Step 4: Manual Activation (If Needed)

If the payment was successful but the campaign wasn't activated due to webhook issues, you can manually activate it:

```bash
npx ts-node -r tsconfig-paths/register scripts/manually-activate-campaign.ts <campaignId> <orderId>
```

You can find the `orderId` from:
- Admin payments page: https://phrames.cleffon.com/admin/payments
- Or from the diagnostic script output

## Step 5: Test Webhook Endpoint

You can test if the webhook endpoint is accessible:

```bash
curl -X POST https://phrames.cleffon.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"TEST","data":{}}'
```

This should return `{"success":true}` if the endpoint is working.

## How the Payment Flow Works

1. **User initiates payment** → PaymentModal calls `/api/payments/initiate`
2. **Payment session created** → Cashfree SDK opens checkout
3. **User completes payment** → Cashfree processes payment
4. **Cashfree sends webhook** → POST to `/api/payments/webhook`
5. **Webhook handler activates campaign** → Updates campaign status to active

## Webhook Handler Logic

The webhook handler (`app/api/payments/webhook/route.ts`) does the following:

1. Verifies webhook signature (in production mode)
2. Gets payment record from database
3. Checks if user is blocked
4. Calculates expiry date based on plan type
5. Updates campaign with:
   - `isActive: true`
   - `status: 'Active'`
   - `isFreeCampaign: false`
   - `planType`, `amountPaid`, `paymentId`, `expiresAt`
6. Updates payment record to `success`
7. Creates admin logs

## Environment Variables to Check

Ensure these are set in `.env.local`:

```bash
# Cashfree Configuration
CASHFREE_CLIENT_ID=your_client_id
CASHFREE_CLIENT_SECRET=your_client_secret
CASHFREE_ENV=PRODUCTION

# Public variables
NEXT_PUBLIC_CASHFREE_ENV=PRODUCTION
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com
```

## Common Issues and Solutions

### Issue: "Webhook signature verification failed"
**Solution:** Check that `CASHFREE_CLIENT_SECRET` matches the one in Cashfree dashboard

### Issue: "Payment record not found"
**Solution:** The payment initiation might have failed. Check `/api/payments/initiate` logs

### Issue: "User is blocked"
**Solution:** Unblock the user in admin panel before activating campaign

### Issue: No webhook logs found
**Solution:** 
1. Verify webhook URL in Cashfree dashboard
2. Check if webhook URL is accessible from internet
3. Ensure Vercel deployment is successful

## Testing in Development

For local testing, you'll need to:
1. Use ngrok or similar tool to expose local server
2. Update webhook URL in Cashfree sandbox dashboard
3. Use sandbox credentials in `.env.local`

## Need Help?

If the issue persists:
1. Check Cashfree dashboard for payment status
2. Review admin logs for detailed error messages
3. Contact Cashfree support if webhooks are not being sent
