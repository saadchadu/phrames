# Manual Payment Flow Test Execution - Task 12.1

**Test Date:** [To be filled during execution]
**Tester:** [To be filled]
**Environment:** Cashfree Sandbox
**Application URL:** http://localhost:3000

## Pre-Test Checklist

Before starting tests, verify:
- [ ] Application is running locally (`npm run dev`)
- [ ] Environment variables are configured:
  - [ ] `CASHFREE_ENV=SANDBOX`
  - [ ] `CASHFREE_CLIENT_ID` is set
  - [ ] `CASHFREE_CLIENT_SECRET` is set
  - [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] User is logged in to the application
- [ ] Browser console is open for debugging
- [ ] Network tab is open to monitor API calls

## Cashfree Test Cards

### Success Card
- **Card Number:** 4111 1111 1111 1111
- **CVV:** 123
- **Expiry:** Any future date (e.g., 12/25)
- **OTP:** 123456

### Failure Card
- **Card Number:** 4007 0000 0027 8403
- **CVV:** 123
- **Expiry:** Any future date

---

## Test Case 1: 1 Week Plan (₹49)

### Steps:
1. Navigate to `/create`
2. Fill in campaign details:
   - **Name:** "Test Campaign - 1 Week"
   - **Description:** "Testing 1 week plan"
   - **Upload Frame:** Any valid PNG file
   - **Visibility:** Public
3. Click "Create Campaign"
4. **Verify:** Payment Modal opens automatically
5. **Verify:** All 5 plans are displayed
6. Click on "1 Week" plan (₹49)
7. **Verify:** Plan is highlighted with checkmark
8. Click "Continue to Checkout"
9. **Verify:** Redirects to Cashfree payment page
10. Enter test card details (success card)
11. Complete payment with OTP 123456
12. **Verify:** Redirects to dashboard with success message

### Expected Results:
- ✅ Payment Modal displays correctly
- ✅ 1 Week plan shows ₹49 price
- ✅ Cashfree checkout loads
- ✅ Payment completes successfully
- ✅ Redirected to `/dashboard?payment=success&campaignId=...`
- ✅ Campaign shows "Active" badge
- ✅ Expiry shows "7 days left" or similar

### Firestore Verification:
```javascript
// Check in Firebase Console > Firestore > campaigns > [campaignId]
{
  isActive: true,
  status: "Active",
  planType: "week",
  amountPaid: 49,
  paymentId: "order_...",
  expiresAt: [Timestamp ~7 days from now]
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 2: 1 Month Plan (₹199)

### Steps:
1. Navigate to `/create`
2. Fill in campaign details:
   - **Name:** "Test Campaign - 1 Month"
   - **Description:** "Testing 1 month plan"
   - **Upload Frame:** Any valid PNG file
3. Click "Create Campaign"
4. **Verify:** "Popular" badge shows on 1 Month plan
5. Click on "1 Month" plan (₹199)
6. Click "Continue to Checkout"
7. Complete payment with success card
8. **Verify:** Campaign activates with 30-day expiry

### Expected Results:
- ✅ "Popular" badge visible on 1 Month plan
- ✅ Payment amount is ₹199
- ✅ Campaign expires 30 days from now
- ✅ All fields updated correctly

### Firestore Verification:
```javascript
{
  planType: "month",
  amountPaid: 199,
  expiresAt: [Timestamp ~30 days from now]
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 3: 3 Months Plan (₹499)

### Steps:
1. Create new campaign: "Test Campaign - 3 Months"
2. Select "3 Months" plan (₹499)
3. Complete payment
4. Verify expiry is 90 days from now

### Expected Results:
- ✅ Payment processes for ₹499
- ✅ Campaign expires 90 days from now

### Firestore Verification:
```javascript
{
  planType: "3month",
  amountPaid: 499,
  expiresAt: [Timestamp ~90 days from now]
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 4: 6 Months Plan (₹999)

### Steps:
1. Create new campaign: "Test Campaign - 6 Months"
2. Select "6 Months" plan (₹999)
3. Complete payment
4. Verify expiry is 180 days from now

### Expected Results:
- ✅ Payment processes for ₹999
- ✅ Campaign expires 180 days from now

### Firestore Verification:
```javascript
{
  planType: "6month",
  amountPaid: 999,
  expiresAt: [Timestamp ~180 days from now]
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 5: 1 Year Plan (₹1599)

### Steps:
1. Create new campaign: "Test Campaign - 1 Year"
2. Select "1 Year" plan (₹1599)
3. Complete payment
4. Verify expiry is 365 days from now

### Expected Results:
- ✅ Payment processes for ₹1599
- ✅ Campaign expires 365 days from now

### Firestore Verification:
```javascript
{
  planType: "year",
  amountPaid: 1599,
  expiresAt: [Timestamp ~365 days from now]
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 6: Payment Cancellation Flow

### Steps:
1. Create new campaign: "Test Campaign - Cancellation"
2. Select any plan
3. Click "Continue to Checkout"
4. On Cashfree page, click "Cancel" or close the window
5. Navigate back to `/dashboard` manually

### Expected Results:
- ✅ Campaign remains inactive (isActive: false)
- ✅ Campaign shows "Inactive" badge
- ✅ "Reactivate Campaign" button is visible
- ✅ No payment record with "success" status

### Firestore Verification:
```javascript
{
  isActive: false,
  status: "Inactive",
  planType: undefined,
  amountPaid: undefined
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 7: Payment Failure Flow

### Steps:
1. Create new campaign: "Test Campaign - Failure"
2. Select any plan
3. Click "Continue to Checkout"
4. Use **failure test card**: 4007 0000 0027 8403
5. Attempt to complete payment

### Expected Results:
- ✅ Payment fails on Cashfree
- ✅ Campaign remains inactive
- ✅ Payment record status is "failed" (if created)
- ✅ User can retry with different card

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 8: Multiple Plan Selection

### Steps:
1. Create new campaign
2. Open Payment Modal
3. Click on "1 Week" plan
4. **Verify:** Visual selection (checkmark, border highlight)
5. Click on "1 Month" plan
6. **Verify:** Selection changes to 1 Month
7. **Verify:** Only one plan selected at a time
8. Click "Continue to Checkout"
9. **Verify:** Correct plan (1 Month) is sent to API

### Expected Results:
- ✅ Only one plan can be selected at a time
- ✅ Selected plan shows checkmark icon
- ✅ Selected plan has highlighted border (secondary color)
- ✅ Correct plan is sent to payment API

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 9: Payment Initiation Verification

### Steps:
1. Create new campaign
2. Select any plan
3. Open browser Network tab
4. Click "Continue to Checkout"
5. Monitor API call to `/api/payments/initiate`

### Expected Results:
- ✅ POST request to `/api/payments/initiate`
- ✅ Request includes: campaignId, planType
- ✅ Response includes: paymentLink, orderId
- ✅ Response status: 200 OK
- ✅ Redirect to Cashfree URL

### Network Response Example:
```json
{
  "success": true,
  "paymentLink": "https://sandbox.cashfree.com/pay/...",
  "orderId": "order_...",
  "paymentSessionId": "session_..."
}
```

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test Case 10: Campaign Activation After Payment

### Steps:
1. Complete payment for any plan
2. After redirect to dashboard, locate the campaign
3. Verify campaign status and details

### Expected Results:
- ✅ Campaign card shows "Active" badge (green)
- ✅ Expiry countdown is visible
- ✅ "Edit" button is available
- ✅ "View Campaign" link works
- ✅ Campaign is accessible at public URL

### Test Result:
- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Summary

### Test Results Overview
- **Total Tests:** 10
- **Passed:** ___
- **Failed:** ___
- **Skipped:** ___

### Critical Issues Found
1. _______________
2. _______________

### Non-Critical Issues
1. _______________
2. _______________

### Requirements Coverage
- ✅ Requirement 1.1: All 5 pricing plans display correctly
- ✅ Requirement 2.1: Payment Modal displays on publish
- ✅ Requirement 2.3: Payment initiation works correctly
- ✅ Requirement 2.4: Campaign activates after successful payment

### Notes
_______________________________________________
_______________________________________________
_______________________________________________

### Recommendations
_______________________________________________
_______________________________________________
_______________________________________________

---

## Cleanup

After testing, clean up test campaigns:

1. Go to Firebase Console > Firestore
2. Delete test campaigns:
   - "Test Campaign - 1 Week"
   - "Test Campaign - 1 Month"
   - "Test Campaign - 3 Months"
   - "Test Campaign - 6 Months"
   - "Test Campaign - 1 Year"
   - "Test Campaign - Cancellation"
   - "Test Campaign - Failure"

3. Delete test payment records in `payments` collection

---

**Test Completed By:** _______________
**Date:** _______________
**Sign-off:** _______________
