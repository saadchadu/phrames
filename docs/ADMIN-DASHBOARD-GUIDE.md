# Admin Dashboard Guide

## Table of Contents

1. [Overview](#overview)
2. [Admin Setup Process](#admin-setup-process)
3. [Granting Admin Access](#granting-admin-access)
4. [Admin Features](#admin-features)
5. [Troubleshooting](#troubleshooting)
6. [Security Best Practices](#security-best-practices)

## Overview

The Admin Dashboard is a comprehensive management interface for the Phrames platform. It provides administrators with complete visibility and control over:

- User management
- Campaign management
- Payment analytics
- System logs
- Platform settings and configuration

The dashboard is built with Next.js 13+ App Router, uses Firebase for authentication and data storage, and implements multiple layers of security to ensure only authorized administrators can access sensitive business data.

## Admin Setup Process

### Prerequisites

- Firebase project with Admin SDK configured
- Environment variables properly set
- Admin user account in Firebase Auth

### Step 1: Set the ADMIN_UID Environment Variable

The primary admin user is identified by their Firebase Auth UID stored in the `ADMIN_UID` environment variable.

1. **Get your Firebase Auth UID:**
   - Log into your Firebase Console
   - Navigate to Authentication > Users
   - Find your user account and copy the UID

2. **Add to environment variables:**

   In `.env.local`:
   ```bash
   ADMIN_UID=your-firebase-auth-uid-here
   ```

   In `.env.example` (for documentation):
   ```bash
   ADMIN_UID=your-admin-uid
   ```

3. **Deploy to production:**
   - Add the `ADMIN_UID` environment variable to your Vercel project settings
   - Redeploy the application

### Step 2: Initialize Admin Settings

Run the initialization script to create default system settings:

```bash
npx tsx scripts/initialize-admin-settings.ts
```

This creates:
- System settings document in `/settings/system`
- Plan pricing document in `/settings/plans`
- Default feature toggles

### Step 3: Verify Admin Access

1. Log into the application with your admin account
2. Navigate to `/admin`
3. You should see the admin dashboard overview

If you see a 404 page, verify:
- `ADMIN_UID` matches your Firebase Auth UID
- Environment variables are loaded correctly
- Application has been redeployed after adding the variable

## Granting Admin Access

There are two ways to grant admin access to additional users:

### Method 1: Using the Admin Dashboard (Recommended)

1. Log into the admin dashboard
2. Navigate to **Users** page
3. Find the user you want to make an admin
4. Click the **Set Admin** toggle
5. Confirm the action

This method:
- Updates the user's `isAdmin` field in Firestore
- Sets the `isAdmin` custom claim on their Firebase Auth token
- Creates an audit log entry

### Method 2: Using the Setup Script

Run the grant admin script with the user's email:

```bash
npx tsx scripts/grant-admin-by-email.ts user@example.com
```

This script:
- Finds the user by email in Firebase Auth
- Sets `isAdmin = true` in Firestore
- Sets the `isAdmin` custom claim
- Logs the action

### Revoking Admin Access

To revoke admin access:

1. Navigate to **Users** page in admin dashboard
2. Find the admin user
3. Click the **Set Admin** toggle to turn it off
4. Confirm the action

## Admin Features

### 1. Overview Dashboard (`/admin`)

**Purpose**: High-level view of platform health and metrics

**Features**:
- Total users, campaigns, and revenue statistics
- Revenue trends (last 30 days)
- User growth chart
- Campaign trends (active vs expired)
- Plan distribution
- Recent activity (campaigns, payments, signups)

**Use Cases**:
- Daily platform health check
- Monitoring growth trends
- Identifying issues or anomalies

### 2. Campaign Management (`/admin/campaigns`)

**Purpose**: Manage all campaigns on the platform

**Features**:
- Search campaigns by name, ID, or user ID
- Filter by status (active, inactive, expired)
- Filter by payment type (free, paid)
- Filter by date range
- View campaign details
- Extend campaign expiry
- Activate/deactivate campaigns
- Delete campaigns
- View associated user

**Use Cases**:
- Handle support requests for campaign extensions
- Investigate reported campaigns
- Clean up test or spam campaigns
- Monitor campaign activity

**Actions**:
- **Extend Expiry**: Add 7, 30, or 90 days, or set custom date
- **Deactivate**: Make campaign inactive (can be reactivated)
- **Activate**: Reactivate an inactive campaign
- **Delete**: Permanently remove campaign (use with caution)

### 3. User Management (`/admin/users`)

**Purpose**: Manage user accounts and permissions

**Features**:
- View all users with campaign counts
- Filter by free campaign usage status
- Filter by campaign count thresholds
- Filter by blocked status
- Set/unset admin privileges
- Reset free campaign eligibility
- Block/unblock users
- Delete user accounts
- View user's campaigns

**Use Cases**:
- Grant admin access to team members
- Handle abuse reports
- Reset free campaigns for special cases
- Investigate user issues

**Actions**:
- **Set Admin**: Grant or revoke admin privileges
- **Reset Free Campaign**: Allow user to create another free campaign
- **Block User**: Prevent user from creating or activating campaigns
- **Unblock User**: Restore user's ability to create campaigns
- **Delete**: Permanently remove user account

### 4. Payment Analytics (`/admin/payments`)

**Purpose**: Track revenue and payment transactions

**Features**:
- View all payment transactions
- Filter by status (success, failed)
- Filter by time range
- Filter by plan type
- View complete webhook data
- Revenue by plan chart
- Revenue trend over time
- Export to CSV

**Use Cases**:
- Financial reporting
- Troubleshoot payment issues
- Analyze revenue trends
- Verify webhook data

**Data Displayed**:
- Payment ID
- User ID
- Campaign ID
- Amount
- Plan type
- Status
- Cashfree order ID
- Complete webhook JSON

### 5. System Logs (`/admin/logs`)

**Purpose**: Audit trail of system events and admin actions

**Features**:
- View all system logs
- Filter by event type
- Filter by date range
- View detailed metadata
- Color-coded event types

**Event Types**:
- `admin_action`: Manual admin operations
- `cron_execution`: Automated cron job runs
- `webhook_failure`: Failed payment webhooks
- `campaign_expiry`: Campaign expiration events
- `user_blocked`: User blocking actions
- `settings_changed`: System settings modifications

**Use Cases**:
- Audit admin actions
- Troubleshoot system issues
- Monitor automated processes
- Investigate errors

### 6. System Settings (`/admin/settings`)

**Purpose**: Configure platform-wide settings and pricing

**Features**:
- Toggle free first campaign feature
- Enable/disable new campaign creation
- Enable/disable new user signups
- Enable/disable specific plans
- Update plan pricing
- Manually trigger expiry cron
- Export data to CSV

**Settings**:
- **Free Campaign Enabled**: Allow users to create one free campaign
- **New Campaigns Enabled**: Allow creation of new campaigns
- **New Signups Enabled**: Allow new user registrations
- **Enabled Plans**: Control which subscription plans are available

**Manual Actions**:
- **Trigger Expiry Cron**: Manually run campaign expiration check
- **Export Payments**: Download all payments as CSV
- **Export Campaigns**: Download all campaigns as CSV

**Use Cases**:
- Adjust pricing without code changes
- Temporarily disable features for maintenance
- Control platform growth
- Emergency shutdowns

## Troubleshooting

### Cannot Access Admin Dashboard

**Symptom**: Redirected to 404 when visiting `/admin`

**Solutions**:
1. Verify `ADMIN_UID` environment variable is set correctly
2. Check that your Firebase Auth UID matches the `ADMIN_UID`
3. Ensure application has been redeployed after adding the variable
4. Check browser console for errors
5. Verify you're logged in with the correct account

### Admin Actions Not Working

**Symptom**: Actions fail or show errors

**Solutions**:
1. Check browser console for specific error messages
2. Verify Firebase Admin SDK is properly configured
3. Check Firestore security rules are deployed
4. Ensure custom claims are set correctly
5. Check system logs for error details

### Custom Claims Not Updating

**Symptom**: Admin status not reflecting immediately

**Solutions**:
1. Custom claims are cached in the user's token
2. User needs to log out and log back in
3. Or wait for token to expire (1 hour)
4. Use the sync admin claim script to force update

### Statistics Not Updating

**Symptom**: Dashboard shows stale data

**Solutions**:
1. Refresh the page
2. Check if Firestore indexes are built
3. Verify data is being written to Firestore correctly
4. Check for JavaScript errors in console

### CSV Export Fails

**Symptom**: Export button doesn't work or times out

**Solutions**:
1. Check for large datasets (>10,000 records)
2. Use date range filters to reduce dataset size
3. Check browser console for errors
4. Verify API route is responding

### Logs Not Appearing

**Symptom**: Expected log entries are missing

**Solutions**:
1. Verify logging is enabled in the code
2. Check Firestore `/logs` collection directly
3. Ensure Firestore indexes for logs are created
4. Check for errors in the logging service

## Security Best Practices

### Protecting Admin Access

1. **Use Strong Passwords**: Admin accounts should have strong, unique passwords
2. **Enable 2FA**: Enable two-factor authentication on admin Firebase accounts
3. **Limit Admin Users**: Only grant admin access to trusted team members
4. **Regular Audits**: Review admin users periodically and remove unnecessary access
5. **Monitor Logs**: Regularly check system logs for suspicious activity

### Environment Variables

1. **Never Commit**: Never commit `.env.local` to version control
2. **Secure Storage**: Store production environment variables securely in Vercel
3. **Rotate Regularly**: Periodically rotate sensitive credentials
4. **Limit Access**: Restrict who can view/edit environment variables

### API Security

1. **Server-Side Only**: All admin operations are server-side only
2. **Multiple Layers**: Security checks at route, API, and database levels
3. **Custom Claims**: Use Firebase custom claims for efficient verification
4. **Audit Trail**: All admin actions are logged

### Data Protection

1. **Sensitive Data**: Admin dashboard displays sensitive user and payment data
2. **Screen Sharing**: Be cautious when screen sharing with admin dashboard open
3. **Public Networks**: Avoid accessing admin dashboard on public WiFi
4. **Session Management**: Log out when finished with admin tasks

### Firestore Security Rules

The admin dashboard relies on Firestore security rules to prevent unauthorized access:

```javascript
// Admin collections require isAdmin custom claim
match /logs/{logId} {
  allow read: if request.auth.token.isAdmin == true;
  allow write: if request.auth.token.isAdmin == true;
}

match /settings/{document=**} {
  allow read: if true; // Settings can be read by all
  allow write: if request.auth.token.isAdmin == true;
}
```

Ensure these rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### Regular Maintenance

1. **Update Dependencies**: Keep Firebase SDK and other dependencies updated
2. **Review Logs**: Regularly review system logs for errors or anomalies
3. **Test Features**: Periodically test admin features to ensure they work
4. **Backup Data**: Regularly backup Firestore data
5. **Monitor Performance**: Watch for slow queries or performance issues

## Additional Resources

### Internal Documentation
- [Admin Deployment Guide](./ADMIN-DEPLOYMENT-GUIDE.md) - Complete deployment process
- [Admin Features Reference](./ADMIN-FEATURES-REFERENCE.md) - Detailed feature documentation
- [Admin Quick Reference](./ADMIN-QUICK-REFERENCE.md) - Common tasks and shortcuts
- [Admin Troubleshooting](./ADMIN-TROUBLESHOOTING.md) - Solutions to common issues

### External Resources
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review system logs in the admin dashboard
3. Check Firebase Console for errors
4. Contact the development team

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
