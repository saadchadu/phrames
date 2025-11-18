# Payment System Testing Guide

This guide provides comprehensive testing procedures for the paid campaign system.

## Test Environment Setup

### Prerequisites
- Application running locally or on staging
- Cashfree sandbox credentials configured
- Firebase emulators running (optional)

### Test User Accounts
Create test accounts with different scenarios:
1. New user (never created campaign)
2. User with active campaigns
3. User with expired campaigns

## Test Scenarios

### 1. Campaign Creation and Payment Flow

#### Test 1.1: Create Campaign and Pay
**Steps:**
1. Log in as test user
2. Navigate to "Create Campaign"
3. Fill in campaign details:
   - Name: "Test Campaign 1"
   - Upload a valid PNG frame
   - Set visibility to "Public"
4. Click "Create Campaign"
5. Verify Payment Modal opens
6. Select "1 Week" plan (₹49)
7. Click "Continue to Checkout"
8. Complete payment with test card: 4111 1111 1111 1111

**Expected Results:**
- ✅ Payment Modal displays all 5 plans
- ✅ Selected plan is highlighted
- ✅ Redirects to Cashfree payment page
- ✅ Payment succeeds
- ✅ Redirects back to dashboard
- ✅ Campaign shows "Active" badge
- ✅ Expiry countdown shows "7 days left"
- ✅ Campaign is publicly accessible

**Verify in Firestore:**
```javascript
// Campaign document should have:
{
  isActive: true,
  status: "Active",
  planType: "week",
  amountPaid: 49,
  paymentId: "order_...",
  expiresAt: Timestamp (7 days from now)
}

// Payment record should exist:
{
  status: "success",
  amount: 49,
  planType: "week"
}
```

#### Test 1.2: Cancel Payment
**Steps:**
1. Create a new campaign
2. Open Payment Modal
3. Select any plan
4. Click "Continue to Checkout"
5. On Cashfree page, click "Cancel" or close window

**Expected Results:**
- ✅ Returns to dashboard
- ✅ Campaign remains inactive
- ✅ Campaign shows "Inactive" badge
- ✅ "Reactivate Campaign" button visible

#### Test 1.3: Payment Failure
**Steps:**
1. Create a new campaign
2. Select a plan
3. Use failure test card: 4007 0000 0027 8403

**Expected Results:**
- ✅ Payment fails
- ✅ Error message displayed
- ✅ Campaign remains inactive
- ✅ Payment record status: "failed"

### 2. All Pricing Plans

Test each plan individually:

#### Test 2.1: 1 Week Plan (₹49)
- Select plan
- Complete payment
- Verify expiry: 7 days from now

#### Test 2.2: 1 Month Plan (₹199)
- Select plan
- Complete payment
- Verify expiry: 30 days from now

#### Test 2.3: 3 Months Plan (₹499)
- Select plan
- Complete payment
- Verify expiry: 90 days from now

#### Test 2.4: 6 Months Plan (₹999)
- Select plan
- Complete payment
- Verify expiry: 180 days from now

#### Test 2.5: 1 Year Plan (₹1599)
- Select plan
- Complete payment
- Verify expiry: 365 days from now

### 3. Campaign Reactivation

#### Test 3.1: Reactivate Expired Campaign
**Setup:**
1. Create campaign with 1 Week plan
2. Manually set `expiresAt` to past date in Firestore
3. Manually set `isActive: false`

**Steps:**
1. Go to dashboard
2. Find expired campaign
3. Verify "Inactive" badge shown
4. Click "Reactivate Campaign" button
5. Select new plan
6. Complete payment

**Expected Results:**
- ✅ Payment Modal opens
- ✅ Payment succeeds
- ✅ Campaign becomes active again
- ✅ New expiry date set
- ✅ Success message displayed

### 4. Public Campaign Visibility

#### Test 4.1: Access Active Campaign
**Steps:**
1. Create and activate a campaign
2. Copy campaign URL
3. Open in incognito/private window
4. Try to use the campaign

**Expected Results:**
- ✅ Campaign page loads
- ✅ Can upload photo
- ✅ Can download framed image

#### Test 4.2: Access Inactive Campaign
**Steps:**
1. Create campaign but don't pay
2. Copy campaign URL
3. Open in incognito window

**Expected Results:**
- ✅ Shows "Campaign Inactive" message
- ✅ Cannot use campaign features
- ✅ Message: "Please contact the creator"

#### Test 4.3: Access Expired Campaign
**Steps:**
1. Create campaign with payment
2. Manually set `expiresAt` to past date
3. Access campaign URL

**Expected Results:**
- ✅ Shows "Campaign Inactive" message
- ✅ Cannot use campaign features

### 5. Dashboard Display

#### Test 5.1: Active Campaign Display
**Verify:**
- ✅ "Active" badge with green color
- ✅ Expiry countdown visible
- ✅ "Edit" button visible
- ✅ "View Campaign" link works
- ✅ QR code download works

#### Test 5.2: Inactive Campaign Display
**Verify:**
- ✅ "Inactive" badge with gray color
- ✅ No expiry countdown
- ✅ "Reactivate Campaign" button visible
- ✅ Edit button still works

### 6. Automatic Expiry System

#### Test 6.1: Manual Function Trigger
**Steps:**
1. Create campaign with 1 Week plan
2. Manually set `expiresAt` to 1 hour ago
3. Trigger Cloud Function manually:
   ```bash
   firebase functions:shell
   scheduledCampaignExpiryCheck()
   ```

**Expected Results:**
- ✅ Function executes successfully
- ✅ Campaign `isActive` set to false
- ✅ Campaign `status` set to "Inactive"
- ✅ Expiry log created in `expiryLogs` collection

**Verify Expiry Log:**
```javascript
{
  campaignId: "...",
  campaignName: "...",
  userId: "...",
  expiredAt: Timestamp,
  planType: "week",
  processedAt: Timestamp,
  batchId: "batch_..."
}
```

#### Test 6.2: Scheduled Execution
**Steps:**
1. Wait for scheduled run (midnight UTC)
2. Check function logs:
   ```bash
   firebase functions:log --only scheduledCampaignExpiryCheck
   ```

**Expected Results:**
- ✅ Function runs at scheduled time
- ✅ Processes all expired campaigns
- ✅ Logs show successful execution

### 7. Security Tests

#### Test 7.1: Prevent Client-Side Payment Field Modification
**Steps:**
1. Create inactive campaign
2. Try to update via Firestore client SDK:
   ```javascript
   await updateDoc(campaignRef, {
     isActive: true,
     expiresAt: futureDate
   })
   ```

**Expected Results:**
- ✅ Update fails with permission denied
- ✅ Campaign remains inactive

#### Test 7.2: Ownership Validation
**Steps:**
1. User A creates campaign
2. User B tries to initiate payment for User A's campaign

**Expected Results:**
- ✅ Payment initiation fails
- ✅ Error: "You do not have permission"

#### Test 7.3: Webhook Signature Verification
**Steps:**
1. Send fake webhook request without valid signature
2. Check webhook handler response

**Expected Results:**
- ✅ Request rejected (in production)
- ✅ Campaign not activated

### 8. Error Handling

#### Test 8.1: Network Failure During Payment
**Steps:**
1. Start payment process
2. Disconnect internet before payment completes
3. Reconnect and check status

**Expected Results:**
- ✅ Error message displayed
- ✅ Can retry payment
- ✅ No duplicate charges

#### Test 8.2: Webhook Delivery Failure
**Steps:**
1. Complete payment
2. Simulate webhook failure (return 500 error)
3. Check Cashfree retries webhook

**Expected Results:**
- ✅ Webhook retried by Cashfree
- ✅ Eventually processes successfully
- ✅ Idempotency prevents duplicate activation

#### Test 8.3: Missing Environment Variables
**Steps:**
1. Remove `CASHFREE_CLIENT_ID` from environment
2. Try to initiate payment

**Expected Results:**
- ✅ Error: "Payment system is not configured"
- ✅ User-friendly error message
- ✅ No crash or undefined behavior

### 9. Mobile Responsiveness

#### Test 9.1: Payment Modal on Mobile
**Steps:**
1. Open on mobile device or use Chrome DevTools mobile view
2. Create campaign
3. Open Payment Modal

**Expected Results:**
- ✅ Modal displays correctly
- ✅ All plans visible and selectable
- ✅ Buttons are tappable
- ✅ Text is readable

#### Test 9.2: Dashboard on Mobile
**Steps:**
1. View dashboard on mobile
2. Check campaign cards

**Expected Results:**
- ✅ Status badges visible
- ✅ Expiry countdown readable
- ✅ Reactivate button accessible
- ✅ All actions work

### 10. Edge Cases

#### Test 10.1: Concurrent Payment Attempts
**Steps:**
1. Open campaign in two browser tabs
2. Initiate payment in both tabs simultaneously

**Expected Results:**
- ✅ Both payments can be initiated
- ✅ Only one payment needed to activate
- ✅ Second payment also activates (extends expiry)

#### Test 10.2: Expired Campaign with Active Status
**Steps:**
1. Create campaign with payment
2. Manually set `expiresAt` to past but keep `isActive: true`
3. Try to access campaign

**Expected Results:**
- ✅ Campaign shows as inactive
- ✅ Public access denied
- ✅ Expiry function will fix on next run

#### Test 10.3: Very Long Campaign Name
**Steps:**
1. Create campaign with 100+ character name
2. Complete payment

**Expected Results:**
- ✅ Payment succeeds
- ✅ Name truncated in UI where needed
- ✅ Full name visible in details

## Performance Tests

### Test P1: Payment Initiation Speed
**Target:** < 2 seconds
**Steps:**
1. Measure time from "Continue to Checkout" click to Cashfree page load
2. Test with different network conditions

### Test P2: Webhook Processing Speed
**Target:** < 1 second
**Steps:**
1. Complete payment
2. Measure time from webhook receipt to campaign activation

### Test P3: Expiry Function Performance
**Target:** < 5 minutes for 1000 campaigns
**Steps:**
1. Create 1000 expired campaigns (use script)
2. Run expiry function
3. Measure execution time

## Automated Testing

### Unit Tests
```bash
npm run test
```

Test coverage should include:
- Payment calculation utilities
- Date formatting functions
- Signature verification
- Plan validation

### Integration Tests
```bash
npm run test:integration
```

Test:
- Payment API endpoints
- Webhook processing
- Campaign activation flow

## Test Data Cleanup

After testing:

```javascript
// Delete test campaigns
const testCampaigns = await getDocs(
  query(collection(db, 'campaigns'), 
  where('campaignName', '>=', 'Test'))
)
testCampaigns.forEach(doc => deleteDoc(doc.ref))

// Delete test payments
const testPayments = await getDocs(
  query(collection(db, 'payments'),
  where('status', '==', 'pending'))
)
testPayments.forEach(doc => deleteDoc(doc.ref))
```

## Test Checklist

Before going live, ensure all tests pass:

### Critical Tests
- [ ] All 5 pricing plans work
- [ ] Payment success activates campaign
- [ ] Payment failure keeps campaign inactive
- [ ] Expired campaigns become inactive
- [ ] Reactivation works
- [ ] Public access respects activation status
- [ ] Webhook signature verification works
- [ ] Security rules prevent unauthorized updates

### Important Tests
- [ ] Mobile responsiveness
- [ ] Error messages are user-friendly
- [ ] Dashboard displays correct status
- [ ] Expiry countdown is accurate
- [ ] Cloud Function runs on schedule

### Nice to Have
- [ ] Performance meets targets
- [ ] All edge cases handled
- [ ] Automated tests pass
- [ ] No console errors

## Reporting Issues

When reporting issues, include:
1. Test scenario name
2. Steps to reproduce
3. Expected vs actual result
4. Screenshots/videos
5. Browser/device information
6. Firestore data snapshots
7. Error logs

## Test Results Template

```markdown
## Test Run: [Date]

### Environment
- Environment: Sandbox/Production
- Tester: [Name]
- Browser: [Browser + Version]
- Device: [Device Type]

### Results
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

### Failed Tests
1. [Test Name]
   - Issue: [Description]
   - Severity: Critical/High/Medium/Low
   - Steps to Reproduce: [Steps]

### Notes
[Any additional observations]
```
