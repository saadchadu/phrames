# Campaign Expiry System - Manual Testing Guide

This guide provides step-by-step instructions for manually testing the campaign expiry system.

## Prerequisites

- Firebase project configured
- Firebase Admin SDK credentials available
- Access to Firebase Console
- Cloud Function deployed (optional for full testing)

## Test Scenarios

### Scenario 1: Automated Test Suite

Run the automated test suite to verify all expiry functionality:

```bash
# Install dependencies if needed
npm install

# Run the expiry system test
npx tsx tests/expiry-system.test.ts
```

**Expected Results:**
- ✓ 2 expired campaigns detected and processed
- ✓ Campaigns correctly deactivated (isActive = false, status = 'Inactive')
- ✓ Expiry logs created for each processed campaign
- ✓ Timezone handling works correctly
- ✓ Active campaigns remain unchanged

---

### Scenario 2: Manual Cloud Function Trigger

Test the deployed Cloud Function manually:

#### Step 1: Create Test Campaigns

1. Go to Firebase Console → Firestore Database
2. Create test campaigns with various expiry states:

**Expired Campaign 1:**
```json
{
  "campaignName": "Manual Test - Expired",
  "slug": "manual-test-expired-1",
  "createdBy": "test_user_123",
  "isActive": true,
  "status": "Active",
  "planType": "week",
  "expiresAt": [Timestamp 1 day ago],
  "createdAt": [Current Timestamp],
  "visibility": "Public",
  "frameURL": "https://example.com/frame.jpg",
  "supportersCount": 0
}
```

**Active Campaign:**
```json
{
  "campaignName": "Manual Test - Active",
  "slug": "manual-test-active-1",
  "createdBy": "test_user_123",
  "isActive": true,
  "status": "Active",
  "planType": "month",
  "expiresAt": [Timestamp 5 days from now],
  "createdAt": [Current Timestamp],
  "visibility": "Public",
  "frameURL": "https://example.com/frame.jpg",
  "supportersCount": 0
}
```

#### Step 2: Trigger Cloud Function

**Option A: Using Firebase Console**
1. Go to Firebase Console → Functions
2. Find `scheduledCampaignExpiryCheck`
3. Click "Logs" to monitor execution
4. Wait for scheduled execution or trigger manually if available

**Option B: Using Firebase CLI**
```bash
# Call the function directly (if HTTP trigger is enabled)
firebase functions:shell

# In the shell:
scheduledCampaignExpiryCheck()
```

**Option C: Using gcloud CLI**
```bash
gcloud functions call scheduledCampaignExpiryCheck \
  --project YOUR_PROJECT_ID
```

#### Step 3: Verify Results

1. **Check Campaign Status:**
   - Go to Firestore → campaigns collection
   - Find the expired test campaign
   - Verify: `isActive: false` and `status: 'Inactive'`
   - Verify active campaign remains unchanged

2. **Check Expiry Logs:**
   - Go to Firestore → expiryLogs collection
   - Find logs with matching batchId
   - Verify each log contains:
     - campaignId
     - campaignName
     - userId
     - expiredAt
     - planType
     - processedAt
     - batchId

3. **Check Function Logs:**
   - Go to Firebase Console → Functions → Logs
   - Look for execution logs showing:
     - "Starting campaign expiry check..."
     - "Found X expired campaigns"
     - "Successfully processed X expired campaigns"

---

### Scenario 3: Timezone Testing

Test that expiry works correctly across different timezones:

#### Test 1: UTC Midnight Expiry
1. Create a campaign that expires at UTC midnight
2. Set your local timezone to different zones (e.g., PST, IST, JST)
3. Verify the campaign expires at the correct UTC time regardless of local timezone

#### Test 2: Daylight Saving Time
1. Create campaigns during DST transition periods
2. Verify expiry calculations account for DST changes

#### Test 3: Edge Cases
1. Create a campaign expiring at 23:59:59 UTC
2. Create a campaign expiring at 00:00:01 UTC
3. Verify both are handled correctly

**Verification Steps:**
```bash
# Run timezone-specific test
npx tsx tests/expiry-system.test.ts
```

Check the "Testing timezone handling" section of the output.

---

### Scenario 4: Batch Processing Test

Test the system with a large number of expired campaigns:

#### Step 1: Create Multiple Campaigns
```javascript
// Run this in Firebase Console or a script
const db = admin.firestore();
const batch = db.batch();

for (let i = 0; i < 300; i++) {
  const ref = db.collection('campaigns').doc();
  batch.set(ref, {
    campaignName: `Batch Test Campaign ${i}`,
    slug: `batch-test-${i}-${Date.now()}`,
    createdBy: 'test_user_batch',
    isActive: true,
    status: 'Active',
    planType: 'week',
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() - 86400000), // 1 day ago
    createdAt: admin.firestore.Timestamp.now(),
    visibility: 'Public',
    frameURL: 'https://example.com/frame.jpg',
    supportersCount: 0
  });
}

await batch.commit();
```

#### Step 2: Run Expiry Check
Trigger the Cloud Function and monitor:
- Processing time
- Batch commit logs
- All campaigns processed successfully

#### Step 3: Verify
- All 300 campaigns should be deactivated
- 300 expiry logs should be created
- Function should complete within 5 minutes (Requirement 5.5)

---

### Scenario 5: Idempotency Test

Verify that running the expiry check multiple times doesn't cause issues:

#### Test Steps:
1. Create expired campaigns
2. Run expiry check (campaigns deactivated)
3. Run expiry check again immediately
4. Verify:
   - No duplicate logs created
   - Campaigns remain inactive
   - No errors in function logs

---

### Scenario 6: Public Campaign Visibility Test

Test that expired campaigns are not accessible publicly:

#### Test Steps:
1. Create a campaign and activate it with payment
2. Manually set `expiresAt` to a past date
3. Run expiry check to deactivate the campaign
4. Try to access the campaign via public URL: `/campaign/[slug]`
5. Verify:
   - Campaign shows "This campaign is inactive" message
   - Or returns 404 status
   - Campaign is not visible in public listings

---

## Verification Checklist

Use this checklist to ensure all requirements are met:

### Requirement 5.1: Daily Execution
- [ ] Cloud Function is scheduled to run daily at midnight UTC
- [ ] Function executes automatically without manual intervention
- [ ] Execution logs show regular daily runs

### Requirement 5.2: Query Expired Campaigns
- [ ] Function queries campaigns where `isActive == true`
- [ ] Function queries campaigns where `expiresAt < current timestamp`
- [ ] Only expired active campaigns are returned

### Requirement 5.3: Update Campaign Status
- [ ] Expired campaigns have `isActive` set to `false`
- [ ] Expired campaigns have `status` set to `'Inactive'`
- [ ] Active campaigns are not modified
- [ ] Already inactive campaigns are not processed

### Requirement 5.4: Create Expiry Logs
- [ ] Expiry log created for each processed campaign
- [ ] Logs contain: campaignId, userId, expiredAt, planType, processedAt, batchId
- [ ] Logs are stored in `expiryLogs` collection
- [ ] Batch summary log is created

### Requirement 5.5: Performance
- [ ] Expiry check completes within 5 minutes
- [ ] Batch operations used for efficiency
- [ ] Large numbers of campaigns handled correctly

---

## Troubleshooting

### Issue: No campaigns detected as expired

**Check:**
1. Verify campaigns have `isActive: true`
2. Verify `expiresAt` is a valid Timestamp
3. Verify `expiresAt` is in the past
4. Check Firestore indexes are created

### Issue: Function times out

**Check:**
1. Number of expired campaigns (may need optimization)
2. Batch size (currently 250 campaigns per batch)
3. Function timeout settings in Firebase Console

### Issue: Logs not created

**Check:**
1. Firestore permissions for Cloud Function
2. Error logs in Firebase Console
3. Batch commit success

### Issue: Timezone problems

**Check:**
1. All timestamps use Firestore Timestamp type
2. Function timezone is set to 'UTC'
3. Comparison uses `.toMillis()` for accuracy

---

## Clean Up Test Data

After testing, clean up test campaigns and logs:

```javascript
// Delete test campaigns
const testCampaigns = await db.collection('campaigns')
  .where('slug', '>=', 'test-')
  .where('slug', '<', 'test-\uf8ff')
  .get();

const batch = db.batch();
testCampaigns.forEach(doc => batch.delete(doc.ref));
await batch.commit();

// Delete test logs
const testLogs = await db.collection('expiryLogs')
  .where('batchId', '>=', 'test_')
  .where('batchId', '<', 'test_\uf8ff')
  .get();

const logBatch = db.batch();
testLogs.forEach(doc => logBatch.delete(doc.ref));
await logBatch.commit();
```

---

## Success Criteria

All tests pass when:
- ✅ Expired campaigns are automatically detected
- ✅ Campaigns are deactivated correctly (isActive = false, status = 'Inactive')
- ✅ Expiry logs are created with all required fields
- ✅ Active campaigns remain unchanged
- ✅ Timezone handling works correctly across all zones
- ✅ Function completes within 5 minutes
- ✅ Batch processing handles large numbers of campaigns
- ✅ Idempotency is maintained (no duplicate processing)
- ✅ Public campaign visibility respects expiry status
