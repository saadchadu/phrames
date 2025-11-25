# Admin Dashboard Deployment Guide

## Overview

This guide covers the complete deployment process for the Phrames Admin Dashboard, including environment setup, security configuration, and production deployment.

## Prerequisites

Before deploying the admin dashboard, ensure you have:

- ✅ Firebase project with Admin SDK configured
- ✅ Vercel account for frontend deployment
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Node.js 18+ installed
- ✅ Admin user account created in Firebase Auth

## Deployment Checklist

### Phase 1: Environment Configuration

#### 1.1 Set Environment Variables

**Local Development** (`.env.local`):
```bash
# Admin Configuration
ADMIN_UID=your-firebase-auth-uid

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Payment Gateway (if applicable)
NEXT_PUBLIC_CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
```

**Production** (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from above
3. Set environment: Production, Preview, Development as needed
4. **Important**: Never commit `.env.local` to version control

#### 1.2 Get Your Firebase Auth UID

```bash
# Method 1: Firebase Console
# 1. Go to Firebase Console → Authentication → Users
# 2. Find your user account
# 3. Copy the UID

# Method 2: Browser Console (when logged in)
firebase.auth().currentUser.uid
```

### Phase 2: Database Configuration

#### 2.1 Initialize Admin Settings

Run the initialization script to create default settings:

```bash
npx tsx scripts/initialize-admin-settings.ts
```

This creates:
- `/settings/system` - Feature toggles (all enabled by default)
- `/settings/plans` - Plan pricing configuration

**Verify in Firebase Console**:
- Firestore → settings → system (should exist)
- Firestore → settings → plans (should exist)

#### 2.2 Create Firestore Indexes

Deploy the required composite indexes:

```bash
firebase deploy --only firestore:indexes
```

**Required Indexes** (defined in `firestore.indexes.json`):

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
    },
    {
      "collectionGroup": "logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "actorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "campaigns",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "campaigns",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "planType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Monitor Index Build**:
- Firebase Console → Firestore → Indexes
- Wait for all indexes to show "Enabled" status
- Large collections may take several minutes

#### 2.3 Deploy Firestore Security Rules

Deploy updated security rules that protect admin collections:

```bash
firebase deploy --only firestore:rules
```

**Key Admin Rules** (in `firestore.rules`):

```javascript
// Admin collections require isAdmin custom claim
match /logs/{logId} {
  allow read, write: if request.auth.token.isAdmin == true;
}

match /settings/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.isAdmin == true;
}

// User collection with admin checks
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId || request.auth.token.isAdmin == true;
}
```

**Verify Rules**:
```bash
npx tsx scripts/verify-firestore-rules.ts
```

### Phase 3: Admin Access Setup

#### 3.1 Grant Admin Access to Primary Admin

Run the grant admin script with your email:

```bash
npx tsx scripts/grant-admin-by-email.ts your@email.com
```

This script:
1. Finds your user in Firebase Auth by email
2. Sets `isAdmin = true` in Firestore `/users/{userId}`
3. Sets `isAdmin` custom claim on Firebase Auth token
4. Outputs your User ID for verification

**Verify Admin Access**:
```bash
# Check Firestore
# Firebase Console → Firestore → users → [your-uid]
# Verify: isAdmin: true

# Check Custom Claims (in browser console when logged in)
firebase.auth().currentUser.getIdTokenResult()
  .then(token => console.log('Admin:', token.claims.isAdmin))
```

#### 3.2 Grant Admin Access to Additional Users

**Method 1: Via Script** (before deployment)
```bash
npx tsx scripts/grant-admin-by-email.ts admin2@example.com
```

**Method 2: Via Admin Dashboard** (after deployment)
1. Log into admin dashboard
2. Navigate to `/admin/users`
3. Find the user
4. Toggle "Set Admin" switch
5. Confirm the action

#### 3.3 Sync Custom Claims

If custom claims are not updating, run the sync script:

```bash
npx tsx scripts/setup-admin-claims.ts sync-all
```

### Phase 4: Application Deployment

#### 4.1 Build and Test Locally

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm start

# Verify admin access
# Navigate to http://localhost:3000/admin
```

**Local Testing Checklist**:
- [ ] Can access `/admin` with admin account
- [ ] Non-admin users get 404 on `/admin`
- [ ] All admin pages load without errors
- [ ] Statistics display correctly
- [ ] Campaign/user actions work
- [ ] Settings can be modified
- [ ] Logs are created for actions

#### 4.2 Deploy to Vercel

**First-Time Deployment**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Subsequent Deployments**:
```bash
# Deploy to production
vercel --prod

# Or use Git integration
git push origin main  # Auto-deploys if connected
```

**Vercel Configuration**:

Ensure `vercel.json` includes:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

#### 4.3 Configure Vercel Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from Phase 1.1
3. Set for: Production, Preview, Development
4. **Critical Variables**:
   - `ADMIN_UID` - Your Firebase Auth UID
   - `FIREBASE_PRIVATE_KEY` - Service account private key
   - `CASHFREE_SECRET_KEY` - Payment gateway secret

**Important**: 
- Use "Sensitive" option for secrets
- Don't expose in client-side code
- Verify all variables are set before deployment

#### 4.4 Deploy Firebase Functions (if applicable)

If using Firebase Functions for cron jobs:

```bash
# Deploy functions
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

### Phase 5: Post-Deployment Verification

#### 5.1 Verify Admin Access

1. **Navigate to Admin Dashboard**:
   ```
   https://your-domain.com/admin
   ```

2. **Test Authentication**:
   - Log in with admin account
   - Verify redirect to admin dashboard
   - Check that non-admin users get 404

3. **Test Admin Features**:
   - [ ] Overview dashboard loads with statistics
   - [ ] Campaign management works
   - [ ] User management works
   - [ ] Payment analytics displays
   - [ ] System logs show entries
   - [ ] Settings can be modified

#### 5.2 Verify Security

1. **Test Non-Admin Access**:
   - Create test non-admin account
   - Try to access `/admin` → Should get 404
   - Try to call `/api/admin/**` → Should get 403

2. **Test Firestore Rules**:
   ```bash
   npx tsx scripts/verify-firestore-rules.ts
   ```

3. **Check Custom Claims**:
   - Log in as admin
   - Open browser console
   - Run: `firebase.auth().currentUser.getIdTokenResult()`
   - Verify `claims.isAdmin === true`

#### 5.3 Monitor Logs

1. **Check Vercel Function Logs**:
   - Vercel Dashboard → Your Project → Deployments
   - Click latest deployment → Functions → Logs
   - Look for errors or warnings

2. **Check Firebase Logs**:
   - Firebase Console → Functions → Logs (if using functions)
   - Look for errors in cron execution

3. **Check Admin System Logs**:
   - Navigate to `/admin/logs`
   - Verify log entries are being created
   - Check for any error events

#### 5.4 Performance Check

1. **Test Page Load Times**:
   - Admin dashboard should load in < 3 seconds
   - API routes should respond in < 1 second
   - Charts should render smoothly

2. **Check Firestore Queries**:
   - Firebase Console → Firestore → Usage
   - Monitor read/write counts
   - Ensure indexes are being used

3. **Monitor Memory Usage**:
   - Vercel Dashboard → Analytics
   - Check function execution times
   - Look for memory issues

### Phase 6: Ongoing Maintenance

#### 6.1 Regular Tasks

**Daily**:
- [ ] Check admin logs for errors
- [ ] Monitor payment transactions
- [ ] Review user signups

**Weekly**:
- [ ] Review system statistics
- [ ] Check for failed webhooks
- [ ] Audit admin actions

**Monthly**:
- [ ] Review admin user list
- [ ] Update dependencies
- [ ] Backup Firestore data
- [ ] Review security rules

#### 6.2 Backup Strategy

**Firestore Backup**:
```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)

# Or use Firebase Console
# Firestore → Import/Export → Export
```

**Environment Variables Backup**:
- Keep secure copy of all environment variables
- Document any changes
- Store in secure password manager

#### 6.3 Monitoring Setup

**Set Up Alerts**:
1. Vercel: Configure deployment notifications
2. Firebase: Set up budget alerts
3. Uptime monitoring: Use service like UptimeRobot

**Key Metrics to Monitor**:
- Admin dashboard uptime
- API response times
- Firestore read/write counts
- Error rates
- Payment success rates

## Troubleshooting Deployment Issues

### Issue: Admin Dashboard Shows 404

**Cause**: `ADMIN_UID` not set or incorrect

**Solution**:
1. Verify `ADMIN_UID` in Vercel environment variables
2. Ensure it matches your Firebase Auth UID exactly
3. Redeploy after setting variable
4. Clear browser cache

### Issue: "Permission Denied" Errors

**Cause**: Firestore rules not deployed or custom claims not set

**Solution**:
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Set custom claims: `npx tsx scripts/setup-admin-claims.ts sync-all`
3. Log out and log back in
4. Verify rules in Firebase Console

### Issue: Statistics Not Loading

**Cause**: Firestore indexes not built

**Solution**:
1. Check index status: Firebase Console → Firestore → Indexes
2. Wait for indexes to build (can take several minutes)
3. If stuck, delete and recreate indexes
4. Redeploy: `firebase deploy --only firestore:indexes`

### Issue: Build Fails on Vercel

**Cause**: Missing dependencies or environment variables

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors
5. Ensure all dependencies are in `package.json`

### Issue: API Routes Timeout

**Cause**: Large dataset queries or missing indexes

**Solution**:
1. Add date range filters to reduce query size
2. Verify Firestore indexes are created
3. Increase Vercel function timeout (Pro plan)
4. Optimize queries with pagination

## Security Checklist

Before going to production:

- [ ] `ADMIN_UID` set in production environment
- [ ] Firestore security rules deployed
- [ ] Custom claims configured for all admins
- [ ] Firebase Admin SDK credentials secured
- [ ] Payment gateway secrets not exposed
- [ ] HTTPS enforced on all routes
- [ ] Admin users have strong passwords
- [ ] 2FA enabled on admin Firebase accounts
- [ ] Regular security audits scheduled
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured
- [ ] Error tracking set up (e.g., Sentry)

## Rollback Procedure

If deployment issues occur:

1. **Revert Vercel Deployment**:
   ```bash
   # In Vercel Dashboard
   # Deployments → Previous Deployment → Promote to Production
   ```

2. **Revert Firestore Rules**:
   ```bash
   # Restore previous rules from git
   git checkout HEAD~1 firestore.rules
   firebase deploy --only firestore:rules
   ```

3. **Revert Environment Variables**:
   - Restore previous values in Vercel dashboard
   - Redeploy application

4. **Notify Team**:
   - Document the issue
   - Communicate rollback to team
   - Plan fix and redeployment

## Support and Resources

### Documentation
- [Admin Dashboard Guide](./ADMIN-DASHBOARD-GUIDE.md)
- [Quick Reference](./ADMIN-QUICK-REFERENCE.md)
- [Troubleshooting](./ADMIN-TROUBLESHOOTING.md)

### External Resources
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Getting Help
1. Check troubleshooting section above
2. Review system logs in `/admin/logs`
3. Check Firebase Console for errors
4. Review Vercel function logs
5. Contact development team with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Screenshots if applicable

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
**Deployment Status**: Production Ready ✅
