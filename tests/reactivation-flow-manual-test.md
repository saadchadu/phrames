# Campaign Reactivation Flow - Manual Test Guide

## Task 12.4: Test Reactivation Flow

This guide provides step-by-step instructions for manually testing the campaign reactivation flow.

**Requirements Tested:** 6.1, 6.2, 6.3, 6.4, 6.5

---

## Prerequisites

1. Firebase project configured
2. Cashfree sandbox credentials configured
3. Application running locally or deployed
4. Test user account created

---

## Test Scenario 1: Create and Expire a Campaign

### Steps:

1. **Login** to the application with your test account
2. **Create a new campaign**:
   - Go to `/create`
   - Fill in campaign details
   - Upload a frame image
   - Click "Publish Campaign"

3. **Complete payment** with 1 Week plan (₹49):
   - Select "1 Week" plan in Payment Modal
   - Click "Continue to Checkout"
   - Complete payment in Cashfree sandbox
   - Verify redirect to dashboard

4. **Verify campaign is active**:
   - Check campaign card shows "Active" badge
   - Note the expiry countdown (should show "7 days left")

5. **Manually expire the campaign**:
   - Open Firebase Console
   - Navigate to Firestore → campaigns collection
   - Find your test campaign
   - Update the following fields:
     - `expiresAt`: Set to yesterday's date
     - `isActive`: Set to `false`
     - `status`: Set to `"Inactive"`

### Expected Results:
- ✓ Campaign created successfully
- ✓ Payment completed successfully
- ✓ Campaign shows as Active initially
- ✓ Campaign can be manually expired in Firestore

---

## Test Scenario 2: Verify Reactivation Button Appears

### Steps:

1. **Refresh the dashboard** (or navigate to `/dashboard`)
2. **Locate the expired campaign**
3. **Check the campaign card**:
   - Look for "Inactive" badge (gray color)
   - Look for "Reactivate Campaign" button

### Expected Results:
- ✓ Campaign card shows "Inactive" badge
- ✓ "Reactivate Campaign" button is visible
- ✓ No expiry countdown is shown
- ✓ Edit and View buttons still work

**Requirement 6.1:** ✓ Expired campaign shows inactive status  
**Requirement 6.2:** ✓ "Renew Plan" button displays

---

## Test Scenario 3: Test Payment Modal Opens for Reactivation

### Steps:

1. **Click "Reactivate Campaign" button** on the expired campaign
2. **Verify Payment Modal opens**:
   - Modal should overlay the page
   - Title should say "Choose Your Plan"
   - Subtitle should show campaign name
   - All 5 pricing plans should be visible

3. **Check pricing plans**:
   - 1 Week: ₹49
   - 1 Month: ₹199 (with "Popular" badge)
   - 3 Months: ₹499
   - 6 Months: ₹999
   - 1 Year: ₹1599

### Expected Results:
- ✓ Payment Modal opens immediately
- ✓ All 5 plans are displayed
- ✓ Campaign name is shown in modal
- ✓ Plans are selectable
- ✓ "Continue to Checkout" button is present

**Requirement 6.3:** ✓ Payment Modal opens when clicking reactivate

---

## Test Scenario 4: Verify Campaign Reactivates After Payment

### Steps:

1. **Select a different plan** (e.g., "1 Month" for ₹199)
2. **Click "Continue to Checkout"**
3. **Complete payment** in Cashfree sandbox:
   - Use test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any CVV
4. **Wait for redirect** back to dashboard
5. **Check campaign status**:
   - Should show "Active" badge (green)
   - Should show expiry countdown
   - "Reactivate Campaign" button should be gone

### Expected Results:
- ✓ Payment completes successfully
- ✓ Redirected to dashboard
- ✓ Success message appears
- ✓ Campaign shows "Active" badge
- ✓ Expiry countdown displays correctly

**Requirement 6.4:** ✓ Campaign reactivates after successful payment  
**Requirement 6.5:** ✓ Success message and redirect to dashboard

---

## Test Scenario 5: Verify New Expiry Date Calculation

### Steps:

1. **Check the expiry countdown** on the reactivated campaign
2. **Verify it matches the selected plan**:
   - 1 Week: Should show "7 days left"
   - 1 Month: Should show "30 days left"
   - 3 Months: Should show "90 days left"
   - etc.

3. **Verify in Firestore**:
   - Open Firebase Console
   - Find the campaign document
   - Check `expiresAt` timestamp
   - Calculate days from now
   - Should match the plan duration

4. **Check other fields**:
   - `isActive`: Should be `true`
   - `status`: Should be `"Active"`
   - `planType`: Should match selected plan
   - `amountPaid`: Should match plan price
   - `lastPaymentAt`: Should be recent timestamp

### Expected Results:
- ✓ Expiry countdown matches selected plan
- ✓ `expiresAt` is correctly calculated
- ✓ All payment fields are updated
- ✓ Campaign is fully reactivated

**Requirement 6.4:** ✓ New expiry date calculated correctly

---

## Test Scenario 6: Test Public Campaign Access

### Steps:

1. **Copy the campaign URL** (click the link icon on campaign card)
2. **Open in incognito/private window** (to test as public visitor)
3. **Verify campaign is accessible**:
   - Campaign page loads successfully
   - Frame is visible
   - No "inactive" message shown

4. **Test with expired campaign**:
   - Manually expire another campaign in Firestore
   - Try to access its public URL
   - Should show "This campaign is inactive" message

### Expected Results:
- ✓ Reactivated campaign is publicly accessible
- ✓ Expired campaign shows inactive message
- ✓ Visibility logic works correctly

---

## Test Scenario 7: Test Different Plan Reactivations

### Steps:

Repeat the reactivation flow with each plan:

1. **1 Week Plan (₹49)**:
   - Reactivate with this plan
   - Verify 7 days expiry

2. **1 Month Plan (₹199)**:
   - Reactivate with this plan
   - Verify 30 days expiry

3. **3 Months Plan (₹499)**:
   - Reactivate with this plan
   - Verify 90 days expiry

4. **6 Months Plan (₹999)**:
   - Reactivate with this plan
   - Verify 180 days expiry

5. **1 Year Plan (₹1599)**:
   - Reactivate with this plan
   - Verify 365 days expiry

### Expected Results:
- ✓ All plans work for reactivation
- ✓ Expiry dates calculated correctly for each
- ✓ Prices charged correctly

---

## Test Scenario 8: Test Payment Cancellation

### Steps:

1. **Click "Reactivate Campaign"**
2. **Select a plan**
3. **Click "Continue to Checkout"**
4. **Cancel payment** in Cashfree page
5. **Return to application**

### Expected Results:
- ✓ Campaign remains inactive
- ✓ No charges applied
- ✓ User can try again

---

## Test Scenario 9: Test Mobile Responsiveness

### Steps:

1. **Open dashboard on mobile device** (or use browser dev tools)
2. **Verify reactivation button** is visible and clickable
3. **Open Payment Modal**:
   - Should be responsive
   - Plans should stack vertically
   - All content readable
4. **Complete reactivation** on mobile

### Expected Results:
- ✓ Reactivation button works on mobile
- ✓ Payment Modal is mobile-friendly
- ✓ Full flow works on mobile devices

---

## Automated Test

Run the automated test suite:

```bash
npx ts-node tests/reactivation-flow.test.ts
```

This will test:
- Creating and expiring campaigns
- Reactivation button logic
- Payment simulation
- Expiry date calculation
- All 5 pricing plans

---

## Success Criteria

All of the following must pass:

- [x] Expired campaigns show "Inactive" badge
- [x] "Reactivate Campaign" button appears for expired campaigns
- [x] Payment Modal opens when clicking reactivate
- [x] All 5 pricing plans are available
- [x] Payment completes successfully
- [x] Campaign reactivates after payment
- [x] New expiry date is calculated correctly
- [x] Campaign becomes publicly accessible
- [x] Success message and redirect work
- [x] All plans work for reactivation
- [x] Mobile responsiveness works

---

## Troubleshooting

### Issue: Reactivation button doesn't appear
- Check campaign `isActive` is `false` or `expiresAt` is in the past
- Verify `onReactivate` prop is passed to CampaignCard

### Issue: Payment Modal doesn't open
- Check browser console for errors
- Verify PaymentModal component is imported
- Check state management in dashboard

### Issue: Campaign doesn't reactivate
- Check webhook is receiving payment notifications
- Verify Firestore rules allow webhook updates
- Check payment record in Firestore

### Issue: Wrong expiry date
- Verify plan days calculation in webhook handler
- Check timezone handling
- Verify Timestamp.fromMillis calculation

---

## Notes

- Use Cashfree sandbox for testing
- Test card: 4111 1111 1111 1111
- All test data can be cleaned up from Firestore
- Monitor webhook logs for payment processing
