# Deploy Firebase Functions - Quick Guide

## Prerequisites

1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged in to Firebase**:
   ```bash
   firebase login
   ```

3. **Project initialized** (if not already done):
   ```bash
   firebase init functions
   ```

## Quick Deploy

### Option 1: Deploy All Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Option 2: Deploy Specific Function
```bash
cd functions
npm install
npm run build
firebase deploy --only functions:scheduledCampaignFix
```

## Functions Included

1. **scheduledCampaignFix** - Runs every 6 hours
   - Fixes stuck campaigns (both paid and free)
   - Recalculates supporters counts
   - Automatic background maintenance

2. **scheduledCampaignExpiryCheck** - Runs daily at midnight
   - Deactivates expired campaigns
   - Existing function, already working

3. **scheduledInactiveCampaignCleanup** - Runs daily at 1 AM
   - Cleans up old inactive campaigns
   - Existing function, already working

## Verify Deployment

1. **Check Firebase Console**:
   - Go to Firebase Console → Functions
   - Verify functions are listed and active

2. **Check Logs**:
   ```bash
   firebase functions:log --only scheduledCampaignFix
   ```

3. **Monitor Execution**:
   - Check Firestore `logs` collection
   - Look for `cronType: 'campaign_fix'` entries

## Manual Testing

You can manually trigger the campaign fix through the admin interface:
1. Go to Admin Panel → Settings
2. Click "Fix Stuck Campaigns"
3. Check the results

## Schedule Information

- **scheduledCampaignFix**: Every 6 hours (`0 */6 * * *`)
- **scheduledCampaignExpiryCheck**: Daily at midnight (`0 0 * * *`)
- **scheduledInactiveCampaignCleanup**: Daily at 1 AM (`0 1 * * *`)

The campaign fix function will automatically resolve supporters count issues and activate stuck campaigns without any manual intervention.