# Admin Authentication Fix

## Problem
You're getting "403 Forbidden - Admin access required" when trying to use admin features like refunds.

This means your current logged-in user's UID doesn't match the `ADMIN_UID` in `.env.local`.

## Solution

### Option 1: Check Your Current User ID (Recommended)

Run this command with your admin email and password:

```bash
npm run check-user your-email@example.com your-password
```

This will show you:
- Your current user's UID
- The expected admin UID from .env.local
- Whether they match

If they don't match, the script will tell you exactly what to update in `.env.local`.

### Option 2: Manual Check

1. **Open browser console** while logged into the admin panel
2. **Run this code:**
   ```javascript
   firebase.auth().currentUser.uid
   ```
3. **Copy the UID** that's displayed
4. **Update `.env.local`:**
   ```
   ADMIN_UID=<paste-your-uid-here>
   ```
5. **Restart your dev server** (if running locally)
6. **Redeploy** (if on production)

### Option 3: Check Server Logs

The refund API now logs the UIDs for debugging. Check your server logs for:
```
Refund API - User UID: <your-uid>
Refund API - Expected Admin UID: <expected-uid>
```

Compare these two values.

## Current Configuration

Your `.env.local` currently has:
```
ADMIN_UID=l9DaWNDuK9bWZ3erfM9sqAHA0D12
```

Make sure this matches your actual admin user's UID.

## After Fixing

1. **Update `.env.local`** with the correct UID
2. **Restart the server** (local) or **redeploy** (production)
3. **Clear browser cache** and **reload** the page
4. **Try the refund again**

## Verification

Once fixed, you should be able to:
- ✅ Process refunds
- ✅ Access all admin features
- ✅ See success toasts instead of error toasts

## Common Issues

### Issue: "Still getting 403 after updating .env"
**Solution:** Make sure you restarted the server after changing .env.local

### Issue: "Don't know my admin password"
**Solution:** Reset it via Firebase Console → Authentication → Users → Click user → Reset password

### Issue: "Multiple admin users"
**Solution:** The ADMIN_UID only supports one user. To add multiple admins, you'll need to modify the auth check to use an array or check a custom claim.

## Need Help?

Run the check-user script first:
```bash
npm run check-user your-email@example.com your-password
```

This will give you the exact UID to use.
