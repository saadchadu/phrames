# Admin Dashboard Troubleshooting Guide

## Table of Contents

1. [Access Issues](#access-issues)
2. [Authentication Problems](#authentication-problems)
3. [Data Display Issues](#data-display-issues)
4. [Action Failures](#action-failures)
5. [Performance Issues](#performance-issues)
6. [Export Problems](#export-problems)
7. [Logging Issues](#logging-issues)
8. [Firebase Errors](#firebase-errors)

## Access Issues

### Problem: 404 Error When Accessing `/admin`

**Symptoms**:
- Redirected to 404 page when visiting `/admin`
- Admin navigation links not visible

**Diagnosis**:
```bash
# Check if ADMIN_UID is set
echo $ADMIN_UID

# Check your Firebase Auth UID
# Go to Firebase Console → Authentication → Users → Copy your UID
```

**Solutions**:

1. **Verify ADMIN_UID is set**:
   ```bash
   # In .env.local
   ADMIN_UID=your-actual-firebase-auth-uid
   ```

2. **Ensure UID matches**:
   - Your Firebase Auth UID must exactly match `ADMIN_UID`
   - No extra spaces or characters
   - Case-sensitive

3. **Redeploy application**:
   ```bash
   # After adding ADMIN_UID
   vercel --prod
   ```

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

5. **Check server logs**:
   ```bash
   # In Vercel dashboard
   # Go to your project → Deployments → Latest → Functions → Logs
   ```

### Problem: Admin Links Not Showing in Navigation

**Symptoms**:
- Logged in but no admin menu items
- Can access `/admin` directly but no navigation

**Solutions**:

1. **Check custom claims**:
   ```typescript
   // In browser console on any page
   firebase.auth().currentUser.getIdTokenResult()
     .then(token => console.log(token.claims))
   ```

2. **Sync custom claims**:
   ```bash
   npx tsx scripts/setup-admin-claims.ts
   ```

3. **Log out and log back in**:
   - Custom claims are cached in the token
   - Logging out forces token refresh

## Authentication Problems

### Problem: "Unauthorized" Error on Admin Actions

**Symptoms**:
- Can access admin pages but actions fail
- Error: "Unauthorized: Admin access required"

**Diagnosis**:
```bash
# Check Firestore user document
# In Firebase Console → Firestore → users → [your-uid]
# Verify isAdmin: true exists
```

**Solutions**:

1. **Set isAdmin in Firestore**:
   ```bash
   # Via script
   npx tsx scripts/grant-admin-by-email.ts your@email.com
   ```

2. **Set custom claim**:
   ```typescript
   // The script above does this, but manually:
   admin.auth().setCustomUserClaims(uid, { isAdmin: true })
   ```

3. **Verify Firestore rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Problem: Custom Claims Not Updating

**Symptoms**:
- Set admin status but still not working
- Changes not reflecting immediately

**Solutions**:

1. **Force token refresh**:
   ```typescript
   // In browser console
   firebase.auth().currentUser.getIdToken(true)
     .then(token => console.log('Token refreshed'))
   ```

2. **Log out and log back in**:
   - Simplest solution
   - Forces complete token refresh

3. **Wait for token expiration**:
   - Firebase tokens expire after 1 hour
   - Changes will reflect automatically after expiration

4. **Check claim propagation**:
   ```bash
   # Run sync script
   npx tsx scripts/setup-admin-claims.ts
   ```

## Data Display Issues

### Problem: Statistics Not Updating

**Symptoms**:
- Dashboard shows old data
- Counts don't match reality

**Solutions**:

1. **Refresh the page**:
   - Hard refresh: Ctrl+Shift+R or Cmd+Shift+R

2. **Check Firestore indexes**:
   ```bash
   # Deploy indexes
   firebase deploy --only firestore:indexes
   
   # Check index status in Firebase Console
   # Firestore → Indexes
   ```

3. **Verify data in Firestore**:
   - Open Firebase Console
   - Check collections directly
   - Compare with dashboard numbers

4. **Check browser console**:
   - Look for JavaScript errors
   - Check network tab for failed requests

### Problem: Charts Not Rendering

**Symptoms**:
- Empty chart areas
- "Loading..." never completes

**Solutions**:

1. **Check data availability**:
   ```typescript
   // In browser console
   fetch('/api/admin/stats')
     .then(r => r.json())
     .then(data => console.log(data))
   ```

2. **Verify Recharts is loaded**:
   - Check browser console for errors
   - Look for "Recharts" related errors

3. **Check date ranges**:
   - Ensure there's data in the selected time period
   - Try different date ranges

4. **Clear browser cache**:
   - Cached JavaScript might be outdated

### Problem: Tables Show No Data

**Symptoms**:
- Empty tables despite data existing
- "No results found" message

**Solutions**:

1. **Check filters**:
   - Clear all filters
   - Reset search terms
   - Check date range filters

2. **Verify API response**:
   ```typescript
   // In browser console
   fetch('/api/admin/campaigns')
     .then(r => r.json())
     .then(data => console.log(data))
   ```

3. **Check pagination**:
   - Try different pages
   - Adjust items per page

4. **Verify Firestore queries**:
   - Check Firebase Console logs
   - Look for query errors

## Action Failures

### Problem: Campaign Actions Fail

**Symptoms**:
- Extend expiry doesn't work
- Activate/deactivate fails
- Delete operation fails

**Solutions**:

1. **Check error message**:
   - Look at the error toast/message
   - Check browser console for details

2. **Verify permissions**:
   ```bash
   # Check if you're still admin
   # In browser console
   firebase.auth().currentUser.getIdTokenResult()
     .then(token => console.log(token.claims.isAdmin))
   ```

3. **Check campaign state**:
   - Can't extend expired campaigns
   - Can't activate deleted campaigns
   - Verify campaign exists in Firestore

4. **Review system logs**:
   - Go to `/admin/logs`
   - Look for error entries
   - Check metadata for details

### Problem: User Actions Fail

**Symptoms**:
- Can't block/unblock users
- Set admin toggle doesn't work
- Delete user fails

**Solutions**:

1. **Check Firebase Auth**:
   - User must exist in Firebase Auth
   - Can't delete currently logged-in user
   - Can't remove your own admin status

2. **Verify Firestore document**:
   - User document must exist
   - Check for data consistency

3. **Check for dependencies**:
   - Users with campaigns can't be deleted
   - Must delete campaigns first

4. **Review error logs**:
   ```bash
   # Check Vercel function logs
   # Or check /admin/logs
   ```

### Problem: Settings Changes Don't Apply

**Symptoms**:
- Toggle switches don't save
- Pricing updates don't persist
- Feature toggles don't work

**Solutions**:

1. **Check save confirmation**:
   - Look for success message
   - Verify no error toasts

2. **Refresh and verify**:
   - Reload the page
   - Check if changes persisted

3. **Check Firestore directly**:
   ```bash
   # In Firebase Console
   # Firestore → settings → system
   # Firestore → settings → plans
   ```

4. **Verify write permissions**:
   - Check Firestore security rules
   - Ensure admin can write to `/settings`

## Performance Issues

### Problem: Slow Page Load

**Symptoms**:
- Admin pages take long to load
- Timeout errors
- Slow data fetching

**Solutions**:

1. **Check data volume**:
   - Large datasets slow down queries
   - Use pagination
   - Apply filters to reduce data

2. **Verify Firestore indexes**:
   ```bash
   # Check index status
   # Firebase Console → Firestore → Indexes
   # All indexes should be "Enabled"
   ```

3. **Optimize queries**:
   - Use date range filters
   - Limit results per page
   - Avoid fetching all data at once

4. **Check network**:
   - Slow internet connection
   - Firebase region latency
   - Use browser DevTools Network tab

### Problem: API Timeouts

**Symptoms**:
- Requests timeout
- "Request took too long" errors
- 504 Gateway Timeout

**Solutions**:

1. **Reduce query scope**:
   - Use more specific filters
   - Reduce date ranges
   - Limit result count

2. **Check Vercel function limits**:
   - Free tier: 10s timeout
   - Pro tier: 60s timeout
   - Upgrade if needed

3. **Optimize database queries**:
   - Add composite indexes
   - Use query cursors for pagination
   - Cache frequently accessed data

4. **Monitor function execution**:
   ```bash
   # In Vercel dashboard
   # Check function execution times
   # Look for slow queries
   ```

## Export Problems

### Problem: CSV Export Fails

**Symptoms**:
- Export button doesn't respond
- Download doesn't start
- Incomplete CSV file

**Solutions**:

1. **Reduce dataset size**:
   - Use date range filters
   - Export in smaller batches
   - Limit to specific status/type

2. **Check browser console**:
   - Look for JavaScript errors
   - Check network tab for failed requests

3. **Verify API response**:
   ```typescript
   // Test export endpoint
   fetch('/api/admin/actions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ action: 'exportPayments' })
   })
   ```

4. **Check file size limits**:
   - Very large exports may fail
   - Consider database export instead

### Problem: CSV Data Incomplete

**Symptoms**:
- Missing rows
- Truncated data
- Incorrect formatting

**Solutions**:

1. **Check filters**:
   - Ensure filters aren't excluding data
   - Clear all filters and try again

2. **Verify data in Firestore**:
   - Compare CSV row count with Firestore
   - Check if data exists

3. **Check CSV generation**:
   - Look for errors in server logs
   - Verify all fields are included

4. **Try different date ranges**:
   - Export in smaller time periods
   - Combine multiple exports

## Logging Issues

### Problem: Logs Not Appearing

**Symptoms**:
- Expected log entries missing
- Empty logs page
- Logs not created for actions

**Solutions**:

1. **Check Firestore collection**:
   ```bash
   # Firebase Console → Firestore → logs
   # Verify documents exist
   ```

2. **Verify logging is enabled**:
   - Check code for `createLog()` calls
   - Ensure logging service is imported

3. **Check Firestore indexes**:
   ```bash
   # Deploy indexes
   firebase deploy --only firestore:indexes
   ```

4. **Review error logs**:
   - Check Vercel function logs
   - Look for logging errors

### Problem: Log Metadata Not Showing

**Symptoms**:
- Logs appear but metadata is empty
- Can't expand log details
- Missing context information

**Solutions**:

1. **Check log document structure**:
   ```bash
   # In Firebase Console
   # Verify metadata field exists and is populated
   ```

2. **Verify JSON formatting**:
   - Metadata should be valid JSON
   - Check for serialization errors

3. **Check UI rendering**:
   - Browser console for errors
   - Verify JSON viewer component works

## Firebase Errors

### Problem: "Permission Denied" Errors

**Symptoms**:
- Can't read/write Firestore data
- "Missing or insufficient permissions"

**Solutions**:

1. **Check Firestore rules**:
   ```bash
   # View current rules
   firebase firestore:rules:get
   
   # Deploy rules
   firebase deploy --only firestore:rules
   ```

2. **Verify custom claims**:
   - Ensure `isAdmin` claim is set
   - Check token contains claim

3. **Check rule syntax**:
   ```javascript
   // Correct admin rule
   allow read, write: if request.auth.token.isAdmin == true;
   ```

4. **Test rules in simulator**:
   - Firebase Console → Firestore → Rules
   - Use Rules Playground to test

### Problem: "Quota Exceeded" Errors

**Symptoms**:
- Operations fail with quota error
- "Quota exceeded" message

**Solutions**:

1. **Check Firebase quotas**:
   - Firebase Console → Usage
   - Review read/write counts
   - Check storage usage

2. **Optimize queries**:
   - Reduce unnecessary reads
   - Use caching where possible
   - Batch operations

3. **Upgrade plan**:
   - Consider Blaze (pay-as-you-go) plan
   - Increase quotas

4. **Monitor usage**:
   - Set up usage alerts
   - Review query patterns

### Problem: "Index Required" Errors

**Symptoms**:
- Queries fail with index error
- Link to create index provided

**Solutions**:

1. **Create index via link**:
   - Click the link in error message
   - Firebase will create index automatically

2. **Deploy indexes manually**:
   ```bash
   # Add to firestore.indexes.json
   firebase deploy --only firestore:indexes
   ```

3. **Wait for index build**:
   - Indexes take time to build
   - Check status in Firebase Console

4. **Verify index configuration**:
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "logs",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "eventType", "order": "ASCENDING" },
           { "fieldPath": "createdAt", "order": "DESCENDING" }
         ]
       }
     ]
   }
   ```

## Getting Help

If you've tried the solutions above and still have issues:

1. **Collect information**:
   - Error messages (exact text)
   - Browser console logs
   - Network tab screenshots
   - Steps to reproduce

2. **Check system logs**:
   - `/admin/logs` for admin actions
   - Vercel function logs
   - Firebase Console logs

3. **Review documentation**:
   - [Admin Dashboard Guide](./ADMIN-DASHBOARD-GUIDE.md)
   - [Quick Reference](./ADMIN-QUICK-REFERENCE.md)

4. **Contact support**:
   - Provide collected information
   - Include environment details
   - Describe expected vs actual behavior

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
