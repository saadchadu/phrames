# Firebase Cloud Functions Deployment Guide

This guide provides comprehensive instructions for deploying and managing the Firebase Cloud Function that handles automatic campaign expiry.

## Overview

The `scheduledCampaignExpiryCheck` function:
- Runs daily at midnight UTC (00:00)
- Queries campaigns where `isActive == true` AND `expiresAt < now`
- Updates expired campaigns to `isActive: false` and `status: 'Inactive'`
- Creates audit logs in the `expiryLogs` collection
- Processes campaigns in batches for efficiency

## Prerequisites

1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project configured**:
   - Firebase project created
   - Firestore database enabled
   - Billing enabled (required for Cloud Functions)

3. **Logged in to Firebase**:
   ```bash
   firebase login
   ```

4. **Project initialized**:
   ```bash
   firebase use --add
   # Select your project
   ```

## Quick Deployment

Use the automated deployment script:

```bash
./scripts/deploy-firebase-functions.sh
```

This script will:
1. Check prerequisites
2. Initialize functions directory (if needed)
3. Copy function code
4. Install dependencies
5. Build functions
6. Deploy to Firebase
7. Verify deployment

## Manual Deployment

If you prefer to deploy manually:

### Step 1: Initialize Firebase Functions

```bash
firebase init functions
```

Select:
- Language: TypeScript
- ESLint: Yes (recommended)
- Install dependencies: Yes

### Step 2: Copy Function Code

```bash
# Copy the function implementation
cp functions-setup/index.ts functions/src/index.ts

# Copy configuration files (if needed)
cp functions-setup/package.json functions/package.json
cp functions-setup/tsconfig.json functions/tsconfig.json
```

### Step 3: Install Dependencies

```bash
cd functions
npm install
```

Required dependencies:
- `firebase-functions`: Cloud Functions SDK
- `firebase-admin`: Admin SDK for Firestore access

### Step 4: Build Functions

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `lib` directory.

### Step 5: Deploy Function

```bash
# Deploy specific function
firebase deploy --only functions:scheduledCampaignExpiryCheck

# Or deploy all functions
firebase deploy --only functions
```

### Step 6: Verify Deployment

```bash
# List deployed functions
firebase functions:list

# View recent logs
firebase functions:log --only scheduledCampaignExpiryCheck --limit 10
```

## Function Configuration

### Schedule Configuration

The function runs on a cron schedule:

```typescript
.schedule('0 0 * * *') // Daily at midnight UTC
.timeZone('UTC')
```

**Cron format**: `minute hour day month dayOfWeek`
- `0 0 * * *`: Every day at 00:00 (midnight)
- Timezone: UTC

**To change schedule**:
1. Edit `functions/src/index.ts`
2. Modify the schedule string
3. Redeploy: `firebase deploy --only functions:scheduledCampaignExpiryCheck`

**Common schedules**:
- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Every day at 2 AM: `0 2 * * *`
- Twice daily (midnight and noon): `0 0,12 * * *`

### Memory and Timeout

Default configuration:
- Memory: 256 MB
- Timeout: 60 seconds

**To increase limits** (if processing many campaigns):

```typescript
export const scheduledCampaignExpiryCheck = functions
  .runWith({
    memory: '512MB',
    timeoutSeconds: 300 // 5 minutes
  })
  .pubsub
  .schedule('0 0 * * *')
  // ... rest of configuration
```

### Region Configuration

Default region: `us-central1`

**To specify region**:

```typescript
export const scheduledCampaignExpiryCheck = functions
  .region('asia-south1') // Mumbai
  .pubsub
  .schedule('0 0 * * *')
  // ... rest of configuration
```

## Monitoring Function Execution

### View Logs

**Real-time logs**:
```bash
firebase functions:log --only scheduledCampaignExpiryCheck --follow
```

**Recent logs**:
```bash
firebase functions:log --only scheduledCampaignExpiryCheck --limit 50
```

**Logs from specific time**:
```bash
firebase functions:log --only scheduledCampaignExpiryCheck --since 2h
```

### Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project
3. Navigate to Functions
4. Click on `scheduledCampaignExpiryCheck`
5. View:
   - Execution count
   - Error rate
   - Execution time
   - Logs

### Check Execution History

Query the `expiryLogs` collection in Firestore:

```javascript
// Get batch summaries
db.collection('expiryLogs')
  .where('type', '==', 'batch_summary')
  .orderBy('processedAt', 'desc')
  .limit(10)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data()
      console.log(`Batch ${data.batchId}: ${data.totalProcessed} campaigns`)
    })
  })
```

### Monitor Metrics

Key metrics to track:
1. **Execution frequency**: Should run daily
2. **Execution time**: Should be < 5 minutes
3. **Campaigns processed**: Track daily count
4. **Error rate**: Should be 0%
5. **Success rate**: Should be 100%

## Testing the Function

### Manual Trigger (Recommended)

Use the provided test script:

```bash
npx ts-node tests/trigger-expiry-check.ts
```

This script:
1. Connects to Firestore
2. Finds expired campaigns
3. Simulates the expiry check
4. Shows what would be processed

### Test with Firebase Emulator

```bash
# Start emulator
firebase emulators:start --only functions,firestore

# In another terminal, trigger function
curl http://localhost:5001/YOUR_PROJECT_ID/us-central1/scheduledCampaignExpiryCheck
```

### Create Test Data

Create a campaign that expires immediately:

```javascript
const testCampaign = {
  campaignName: 'Test Expiry Campaign',
  slug: 'test-expiry',
  isActive: true,
  status: 'Active',
  planType: 'week',
  expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
  createdBy: 'test-user-id',
  createdAt: new Date()
}

db.collection('campaigns').add(testCampaign)
```

Then manually trigger the function to verify it processes the test campaign.

## Troubleshooting

### Function Not Executing

**Check deployment status**:
```bash
firebase functions:list
```

Verify `scheduledCampaignExpiryCheck` is listed and status is "ACTIVE".

**Check logs for errors**:
```bash
firebase functions:log --only scheduledCampaignExpiryCheck --limit 20
```

**Verify schedule**:
- Go to Firebase Console → Functions
- Check the function's trigger configuration
- Ensure schedule is correct

### Function Timing Out

**Symptoms**: Function execution exceeds timeout limit

**Solutions**:
1. Increase timeout:
   ```typescript
   .runWith({ timeoutSeconds: 300 })
   ```

2. Optimize batch size:
   ```typescript
   // Reduce batch size if processing too many campaigns
   if (batchCount >= 100) { // Instead of 250
     await batch.commit()
   }
   ```

3. Add pagination:
   ```typescript
   // Process in chunks
   const CHUNK_SIZE = 500
   let lastDoc = null
   
   while (true) {
     let query = db.collection('campaigns')
       .where('isActive', '==', true)
       .where('expiresAt', '<', now)
       .limit(CHUNK_SIZE)
     
     if (lastDoc) {
       query = query.startAfter(lastDoc)
     }
     
     const snapshot = await query.get()
     if (snapshot.empty) break
     
     // Process batch
     // ...
     
     lastDoc = snapshot.docs[snapshot.docs.length - 1]
   }
   ```

### Campaigns Not Being Deactivated

**Check Firestore indexes**:

Required composite index:
- Collection: `campaigns`
- Fields: `isActive` (Ascending), `expiresAt` (Ascending)

Create index:
1. Go to Firebase Console → Firestore → Indexes
2. Click "Create Index"
3. Add fields: `isActive` (Ascending), `expiresAt` (Ascending)
4. Create index

Or use the error message link from function logs to auto-create.

**Verify query**:
```javascript
// Test query manually
db.collection('campaigns')
  .where('isActive', '==', true)
  .where('expiresAt', '<', new Date())
  .get()
  .then(snapshot => {
    console.log(`Found ${snapshot.size} expired campaigns`)
  })
```

**Check permissions**:

Ensure Firebase Admin has write access to Firestore.

### High Execution Cost

**Monitor costs**:
- Go to Firebase Console → Usage and billing
- Check Cloud Functions invocations
- Review Firestore read/write operations

**Optimize costs**:
1. Reduce unnecessary reads:
   - Only query expired campaigns
   - Use efficient indexes

2. Batch operations:
   - Process multiple campaigns per batch
   - Reduce write operations

3. Adjust schedule:
   - Run less frequently if acceptable
   - Run during off-peak hours

### Permission Errors

**Error**: "Missing or insufficient permissions"

**Solution**:
1. Check Firestore security rules allow admin access
2. Verify Firebase Admin is initialized correctly
3. Ensure service account has proper roles

**Grant required permissions**:
```bash
# In Firebase Console → Project Settings → Service Accounts
# Ensure service account has:
# - Cloud Datastore User
# - Firebase Admin SDK Administrator Service Agent
```

## Best Practices

### 1. Error Handling

The function includes comprehensive error handling:
- Try-catch blocks
- Error logging to Firestore
- Graceful failure handling

### 2. Logging

Log important events:
- Function start
- Campaigns found
- Batch commits
- Completion summary
- Errors

### 3. Idempotency

The function is idempotent:
- Can be run multiple times safely
- Only processes campaigns that are still active and expired
- Creates unique batch IDs for tracking

### 4. Monitoring

Set up monitoring:
- Enable Cloud Functions monitoring
- Set up error alerts
- Track execution metrics
- Review logs regularly

### 5. Testing

Test thoroughly:
- Test with emulator
- Test with small dataset
- Test with large dataset
- Test error scenarios

## Maintenance

### Regular Tasks

**Daily**:
- Check function executed successfully
- Verify campaigns were processed
- Review error logs

**Weekly**:
- Analyze execution metrics
- Review processing times
- Check for optimization opportunities

**Monthly**:
- Review costs
- Update dependencies
- Optimize performance

### Updating the Function

1. **Make changes** to `functions/src/index.ts`

2. **Test locally**:
   ```bash
   cd functions
   npm run build
   ```

3. **Deploy update**:
   ```bash
   firebase deploy --only functions:scheduledCampaignExpiryCheck
   ```

4. **Verify update**:
   ```bash
   firebase functions:log --only scheduledCampaignExpiryCheck --limit 5
   ```

### Rollback

If issues occur after deployment:

```bash
# View deployment history
firebase functions:list

# Rollback to previous version
# (Note: Firebase doesn't have built-in rollback)
# You need to redeploy the previous code

# 1. Revert code changes
git checkout HEAD~1 functions/src/index.ts

# 2. Redeploy
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

## Cost Estimation

### Pricing Factors

1. **Function invocations**: 1 per day
2. **Compute time**: ~1-5 seconds per execution
3. **Memory**: 256 MB
4. **Firestore reads**: Number of expired campaigns
5. **Firestore writes**: 2x number of expired campaigns

### Example Cost (Monthly)

Assuming 10 campaigns expire per day:

- Function invocations: 30/month (free tier: 2M/month)
- Compute time: 150 seconds/month (free tier: 400,000 GB-seconds/month)
- Firestore reads: 300/month (free tier: 50,000/day)
- Firestore writes: 600/month (free tier: 20,000/day)

**Estimated cost**: $0.00 (within free tier)

For larger scale:
- 100 campaigns/day: Still within free tier
- 1000 campaigns/day: ~$0.50/month

## Security

### Function Security

1. **Admin SDK**: Function uses Firebase Admin SDK with full access
2. **No public endpoint**: Scheduled function, not HTTP-triggered
3. **Audit logging**: All actions logged to Firestore

### Best Practices

- Keep function code in private repository
- Review logs for suspicious activity
- Monitor for unexpected execution patterns
- Limit access to Firebase Console

## Support Resources

- **Firebase Functions Docs**: https://firebase.google.com/docs/functions
- **Cloud Scheduler Docs**: https://cloud.google.com/scheduler/docs
- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **Firebase Support**: https://firebase.google.com/support

## Appendix

### Function Code Structure

```
functions/
├── src/
│   └── index.ts              # Main function code
├── lib/                      # Compiled JavaScript (generated)
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .gitignore               # Git ignore rules
```

### Environment Variables

Functions automatically have access to:
- Firebase project configuration
- Firestore database
- Firebase Admin credentials

No additional environment variables needed.

### Debugging Tips

1. **Add detailed logging**:
   ```typescript
   console.log('Processing campaign:', campaignId)
   console.log('Expiry date:', expiresAt.toDate())
   ```

2. **Use structured logging**:
   ```typescript
   console.log(JSON.stringify({
     event: 'campaign_expired',
     campaignId,
     userId,
     planType
   }))
   ```

3. **Test queries separately**:
   ```typescript
   // Test in Firebase Console or local script
   db.collection('campaigns')
     .where('isActive', '==', true)
     .where('expiresAt', '<', new Date())
     .get()
   ```

---

**Deployment Complete!** 🎉

Your Firebase Cloud Function is now deployed and will automatically deactivate expired campaigns daily at midnight UTC.

For monitoring and troubleshooting, refer to the MONITORING-GUIDE.md document.
