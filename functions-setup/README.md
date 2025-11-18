# Firebase Cloud Functions Setup

This directory contains the Firebase Cloud Functions for automatic campaign expiry management.

## Setup Instructions

### 1. Initialize Firebase Functions

If you haven't already initialized Firebase Functions in your project:

```bash
firebase init functions
```

Select:
- TypeScript
- ESLint (optional)
- Install dependencies

### 2. Copy Function Files

Copy the files from this directory to your `functions` folder:

```bash
cp functions-setup/index.ts functions/src/index.ts
cp functions-setup/package.json functions/package.json
cp functions-setup/tsconfig.json functions/tsconfig.json
```

### 3. Install Dependencies

```bash
cd functions
npm install
```

### 4. Build and Test Locally

```bash
npm run build
firebase emulators:start --only functions
```

### 5. Deploy to Firebase

```bash
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

## Function Details

### scheduledCampaignExpiryCheck

- **Schedule**: Runs daily at midnight UTC (00:00)
- **Purpose**: Automatically deactivates campaigns that have expired
- **Process**:
  1. Queries all campaigns where `isActive == true` and `expiresAt < now`
  2. Updates each expired campaign to `isActive: false` and `status: 'Inactive'`
  3. Creates expiry log entries for audit purposes
  4. Processes campaigns in batches of 250 for efficiency

### manualCampaignExpiryCheck (Optional)

- **Type**: HTTP trigger
- **Purpose**: Manually trigger expiry check for testing
- **Authentication**: Requires `x-api-key` header
- **Usage**:
  ```bash
  curl -X POST https://your-region-your-project.cloudfunctions.net/manualCampaignExpiryCheck \
    -H "x-api-key: your-secret-key"
  ```

## Monitoring

### View Logs

```bash
firebase functions:log
```

### Check Expiry Logs in Firestore

The function creates logs in the `expiryLogs` collection:

- Individual campaign expiry logs
- Batch summary logs
- Error logs

## Troubleshooting

### Function Not Running

1. Check the function is deployed:
   ```bash
   firebase functions:list
   ```

2. Check the schedule is correct:
   ```bash
   firebase functions:config:get
   ```

3. View recent logs:
   ```bash
   firebase functions:log --only scheduledCampaignExpiryCheck
   ```

### Testing Locally

Use the Firebase Emulator Suite:

```bash
firebase emulators:start --only functions
```

Then trigger manually via the emulator UI or HTTP request.

## Cost Considerations

- The function runs once per day
- Processing time depends on number of expired campaigns
- Typical execution: < 1 minute for hundreds of campaigns
- Firestore reads: 1 per expired campaign
- Firestore writes: 2 per expired campaign (campaign update + log)

## Security

- Function runs with Firebase Admin privileges
- No public HTTP endpoint (scheduled function)
- Logs are stored in Firestore with restricted access
- Manual trigger requires API key authentication
