# Test Payment Record Creation

## Steps to Test:

### 1. Check Vercel Deployment Status
Go to: https://vercel.com/saadchadu/phrames/deployments

Look for the most recent deployment with commit message:
"Fix payment record creation to use Firebase Admin SDK"

Wait until it shows "Ready" status.

### 2. Make a Test Payment

1. Go to: https://phrames.cleffon.com/dashboard
2. Create a new test campaign (or use existing inactive one)
3. Click "Activate" button
4. Select any plan (e.g., "1 Week")
5. Click "Continue to Checkout"
6. Complete the payment using Cashfree test card:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: Any future date
   - OTP: 123456

### 3. Verify Payment Record Created

**Immediately after payment:**

1. Go to: https://phrames.cleffon.com/admin/payments
2. You should see a new payment record appear
3. It should show:
   - Order ID
   - Campaign ID  
   - Amount
   - Status: "pending" (initially)

### 4. Wait for Webhook (5-10 seconds)

1. Refresh the payments page
2. Status should change to "SUCCESS" or "success"
3. Go to: https://phrames.cleffon.com/admin/logs
4. You should see:
   - `webhook_received` event
   - `payment_success` event
   - `campaign_activated` event

### 5. Verify Campaign Activated

1. Go back to: https://phrames.cleffon.com/dashboard
2. The campaign should now show as "Active"
3. Status badge should be green

## If Payment Record Still Not Created:

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to initiate payment again
4. Look for any errors

### Check Network Tab:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Initiate payment
4. Look for `/api/payments/initiate` request
5. Check the response - should include `paymentSessionId`

### Manual Check via API:
```bash
# This will show if ANY payments exist
curl -s "https://phrames.cleffon.com/api/admin/payments" | grep -i "totalPayments"
```

Should show: `"totalPayments": 1` (or more) after making a payment

## Expected Timeline:

- **T+0s**: Click "Continue to Checkout"
- **T+1s**: Payment record created in Firestore
- **T+2s**: Cashfree checkout opens
- **T+30s**: Complete payment
- **T+35s**: Webhook received
- **T+36s**: Campaign activated
- **T+40s**: See "Active" status on dashboard

## If It Still Doesn't Work:

1. Check Vercel deployment logs for errors
2. Check browser console for JavaScript errors
3. Try in incognito mode
4. Clear browser cache
5. Share screenshot of:
   - Browser console errors
   - Network tab showing `/api/payments/initiate` response
   - Admin logs page

## Contact Info:

If automatic activation still fails after following all steps, the issue might be:
- Vercel deployment not completed
- Firebase permissions issue
- Cashfree configuration issue

Share the following for debugging:
1. Screenshot of Vercel deployment status
2. Screenshot of browser console during payment
3. Screenshot of admin logs page
4. Screenshot of admin payments page
