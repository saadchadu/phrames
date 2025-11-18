# Payment Flow Test Guide

## Test Environment Setup

### Prerequisites
- Cashfree sandbox account configured
- Environment variables set:
  - `CASHFREE_ENV=SANDBOX`
  - `CASHFREE_CLIENT_ID` (sandbox credentials)
  - `CASHFREE_CLIENT_SECRET` (sandbox credentials)
  - `NEXT_PUBLIC_APP_URL` set correctly

### Cashfree Test Cards
Use these test cards in sandbox mode:

**Successful Payment:**
- Card Number: `4111111111111111`
- CVV: `123`
- Expiry: Any future date
- OTP: `123456`

**Failed Payment:**
- Card Number: `4007000000027`
- CVV: `123`
- Expiry: Any future date

## Test 12.1: Payment Flow with Cashfree Sandbox

### Test Case 1.1: Test 1 Week Plan (₹49)
**Steps:**
1. Navigate to `/create` and create a new campaign
2. Fill in campaign details and click "Publish"
3. Payment Modal should open automatically
4. Select "1 Week" plan (₹49)
5. Click "Continue to Checkout"
6. Verify redirect to Cashfree payment page
7. Use test card `4111111111111111` to complete payment
8. Verify redirect back to dashboard with success message

**Expected Results:**
- ✓ Payment Modal displays with all 5 plans
- ✓ 1 Week plan shows ₹49 price
- ✓ Cashfree checkout page loads
- ✓ Payment completes successfully
- ✓ Redirected to `/dashboard?payment=success&campaignId=...`
- ✓ Campaign shows "Active" status
- ✓ Expiry date is 7 days from now

**Verification Queries:**
```javascript
// Check campaign in Firestore
const campaign = await getCampaign(campaignId)
console.assert(campaign.isActive === true)
console.assert(campaign.status === 'Active')
console.assert(campaign.planType === 'week')
console.assert(campaign.amountPaid === 49)
console.assert(campaign.expiresAt !== null)

// Check payment record
const payment = await getPaymentByOrderId(orderId)
console.assert(payment.status === 'success')
console.assert(payment.amount === 49)
```

### Test Case 1.2: Test 1 Month Plan (₹199)
**Steps:**
1. Create a new campaign
2. Select "1 Month" plan (₹199) - marked as "Popular"
3. Complete payment with test card
4. Verify campaign activation

**Expected Results:**
- ✓ "Popular" badge displays on 1 Month plan
- ✓ Payment amount is ₹199
- ✓ Campaign expires 30 days from now
- ✓ All campaign fields updated correctly

### Test Case 1.3: Test 3 Months Plan (₹499)
**Steps:**
1. Create a new campaign
2. Select "3 Months" plan (₹499)
3. Complete payment
4. Verify expiry date is 90 days from now

**Expected Results:**
- ✓ Payment processes for ₹499
- ✓ Campaign expires 90 days from now

### Test Case 1.4: Test 6 Months Plan (₹999)
**Steps:**
1. Create a new campaign
2. Select "6 Months" plan (₹999)
3. Complete payment
4. Verify expiry date is 180 days from now

**Expected Results:**
- ✓ Payment processes for ₹999
- ✓ Campaign expires 180 days from now

### Test Case 1.5: Test 1 Year Plan (₹1599)
**Steps:**
1. Create a new campaign
2. Select "1 Year" plan (₹1599)
3. Complete payment
4. Verify expiry date is 365 days from now

**Expected Results:**
- ✓ Payment processes for ₹1599
- ✓ Campaign expires 365 days from now

### Test Case 1.6: Payment Cancellation Flow
**Steps:**
1. Create a new campaign
2. Select any plan
3. Click "Continue to Checkout"
4. On Cashfree page, click "Cancel" or close the window
5. Navigate back to dashboard manually

**Expected Results:**
- ✓ Campaign remains inactive (isActive: false)
- ✓ No payment record created with "success" status
- ✓ User can retry payment later

### Test Case 1.7: Payment Failure Flow
**Steps:**
1. Create a new campaign
2. Select any plan
3. Use failed payment test card: `4007000000027`
4. Attempt to complete payment

**Expected Results:**
- ✓ Payment fails on Cashfree
- ✓ Campaign remains inactive
- ✓ Payment record status is "failed"
- ✓ User can retry with different card

### Test Case 1.8: Multiple Plan Selection
**Steps:**
1. Open Payment Modal
2. Click on "1 Week" plan
3. Verify visual selection (checkmark, border highlight)
4. Click on "1 Month" plan
5. Verify selection changes
6. Click "Continue to Checkout"

**Expected Results:**
- ✓ Only one plan can be selected at a time
- ✓ Selected plan shows checkmark icon
- ✓ Selected plan has highlighted border
- ✓ Correct plan is sent to payment API

## Test Results Log

### Test Run: [Date]
| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 - 1 Week Plan | ⬜ | |
| 1.2 - 1 Month Plan | ⬜ | |
| 1.3 - 3 Months Plan | ⬜ | |
| 1.4 - 6 Months Plan | ⬜ | |
| 1.5 - 1 Year Plan | ⬜ | |
| 1.6 - Payment Cancellation | ⬜ | |
| 1.7 - Payment Failure | ⬜ | |
| 1.8 - Multiple Plan Selection | ⬜ | |

## Troubleshooting

### Issue: Payment Modal doesn't open
- Check browser console for errors
- Verify campaign was created successfully
- Check if PaymentModal component is imported correctly

### Issue: Cashfree page doesn't load
- Verify `CASHFREE_ENV=SANDBOX`
- Check Cashfree credentials are correct
- Verify `NEXT_PUBLIC_APP_URL` is set
- Check network tab for API errors

### Issue: Payment succeeds but campaign not activated
- Check webhook is being received (check server logs)
- Verify webhook URL is accessible from internet
- Check Firestore security rules allow updates
- Verify webhook signature validation (disable in sandbox if needed)

### Issue: Wrong expiry date
- Check `calculateExpiryDate` function
- Verify timezone handling
- Check Firestore timestamp conversion

## Requirements Coverage

This test suite covers:
- ✓ Requirement 1.1: All 5 pricing plans display correctly
- ✓ Requirement 2.1: Payment Modal displays on publish
- ✓ Requirement 2.3: Payment initiation works
- ✓ Requirement 2.4: Campaign activates after payment
- ✓ Requirement 2.5: Error handling for failed payments
