# Firebase Cloud Function - Quick Reference

## Function Status

✅ **DEPLOYED AND ACTIVE**

- **Name**: scheduledCampaignExpiryCheck
- **Schedule**: Daily at midnight UTC (0 0 * * *)
- **Runtime**: Node.js 20
- **Location**: us-central1

---

## Quick Commands

### View Function Status
```bash
firebase functions:list
```

### View Logs
```bash
# Recent logs
firebase functions:log --only scheduledCampaignExpiryCheck

# Follow logs in real-time
firebase functions:log --only scheduledCampaignExpiryCheck --follow
```

### Redeploy Function
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

### Test Manually
```bash
npx ts-node tests/trigger-expiry-check.ts
```

---

## Console Links

- **Functions**: https://console.firebase.google.com/project/phrames-app/functions
- **Scheduler**: https://console.cloud.google.com/cloudscheduler?project=phrames-app
- **Logs**: https://console.cloud.google.com/logs/query?project=phrames-app

---

## What It Does

1. Runs daily at midnight UTC
2. Finds campaigns where `isActive == true` AND `expiresAt < now`
3. Sets `isActive: false` and `status: 'Inactive'`
4. Creates logs in `expiryLogs` collection

---

## Monitoring

### Check if it ran today
```bash
firebase functions:log --only scheduledCampaignExpiryCheck | grep "Starting campaign expiry check"
```

### Check for errors
```bash
firebase functions:log --only scheduledCampaignExpiryCheck | grep "Error"
```

### View Firestore logs
Check the `expiryLogs` collection in Firestore Console

---

## Troubleshooting

**Function not running?**
1. Check status: `firebase functions:list`
2. View logs: `firebase functions:log --only scheduledCampaignExpiryCheck`
3. Check Cloud Scheduler console

**Errors in logs?**
1. Check Firestore permissions
2. Verify service account access
3. Review error details in logs

**Need to redeploy?**
```bash
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

---

## Files Location

- **Function Code**: `functions/src/index.ts`
- **Config**: `firebase.json`
- **Project**: `.firebaserc`

---

## Next Execution

The function runs at **00:00 UTC** every day.

To check next run time, visit:
https://console.cloud.google.com/cloudscheduler?project=phrames-app
