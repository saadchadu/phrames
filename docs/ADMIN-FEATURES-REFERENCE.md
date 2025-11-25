# Admin Dashboard Features Reference

## Complete Feature Documentation

This document provides detailed information about every feature available in the Phrames Admin Dashboard.

## Table of Contents

1. [Overview Dashboard](#overview-dashboard)
2. [Campaign Management](#campaign-management)
3. [User Management](#user-management)
4. [Payment Analytics](#payment-analytics)
5. [System Logs](#system-logs)
6. [Platform Settings](#platform-settings)
7. [Data Export](#data-export)
8. [Security Features](#security-features)

---

## Overview Dashboard

**Route**: `/admin`

### Purpose
Provides a high-level view of platform health, growth metrics, and recent activity.

### Key Metrics

#### User Statistics
- **Total Users**: Count of all registered users
- **New Users Today**: Users who signed up in the last 24 hours
- **New Users This Month**: Users who signed up in the current month
- **Active Users**: Users with at least one active campaign

#### Campaign Statistics
- **Total Campaigns**: All campaigns ever created
- **Active Campaigns**: Campaigns currently active and not expired
- **Expired Campaigns**: Campaigns past their expiration date
- **Free Campaigns Used**: Count of free campaigns created

#### Revenue Statistics
- **Total Revenue**: Sum of all successful payments (all time)
- **Revenue Today**: Payments received in the last 24 hours
- **Revenue This Month**: Payments received in the current month
- **Average Order Value**: Total revenue / number of successful payments

### Charts and Visualizations

#### Revenue Trend Chart
- **Type**: Line chart
- **Time Range**: Last 30 days
- **Data Points**: Daily revenue totals
- **Use Case**: Track revenue patterns and identify trends
- **Interactive**: Hover to see exact values

#### User Growth Chart
- **Type**: Line chart
- **Time Range**: Last 30 days
- **Data Points**: Daily new user signups
- **Use Case**: Monitor user acquisition trends
- **Interactive**: Hover to see exact counts

#### Campaign Trends Chart
- **Type**: Stacked area chart
- **Time Range**: Last 30 days
- **Data Points**: Active vs expired campaigns over time
- **Use Case**: Understand campaign lifecycle patterns
- **Interactive**: Click legend to toggle series

#### Plan Distribution Chart
- **Type**: Bar chart
- **Data**: Count of campaigns by plan type
- **Plans**: Week, Month, 3-Month, 6-Month, Year
- **Use Case**: Identify most popular subscription plans
- **Interactive**: Hover to see exact counts

### Recent Activity

#### Recent Campaigns
- **Display**: Last 5 campaigns created
- **Columns**: Name, Creator, Plan Type, Status, Created Date
- **Actions**: Quick link to campaign details

#### Recent Payments
- **Display**: Last 10 successful payments
- **Columns**: User, Amount, Plan, Date
- **Actions**: Quick link to payment details

#### Recent Signups
- **Display**: Last 10 new users
- **Columns**: Name, Email, Signup Date
- **Actions**: Quick link to user profile

### Refresh Behavior
- **Auto-refresh**: No (manual refresh required)
- **Cache**: Server-side data fetching on each page load
- **Performance**: Optimized queries with Firestore indexes

---

## Campaign Management

**Route**: `/admin/campaigns`

### Purpose
Comprehensive campaign management with search, filtering, and administrative actions.

### Campaign Table

#### Displayed Columns
1. **Campaign ID**: Unique identifier (clickable to view)
2. **Name**: Campaign title
3. **Creator**: User who created the campaign (clickable to user profile)
4. **Plan Type**: Free, Week, Month, 3-Month, 6-Month, Year
5. **Amount Paid**: Payment amount (₹0 for free campaigns)
6. **Status**: Active, Inactive, Expired
7. **Expiry Date**: When campaign expires
8. **Created Date**: When campaign was created
9. **Actions**: Action buttons (see below)

#### Status Indicators
- **Active** (Green): Campaign is live and accessible
- **Inactive** (Gray): Campaign is disabled by admin or user
- **Expired** (Red): Campaign has passed expiration date

### Search and Filtering

#### Search Functionality
- **Search by**: Campaign name, Campaign ID, User ID
- **Behavior**: Real-time filtering as you type
- **Case**: Case-insensitive
- **Partial Match**: Supports partial string matching

#### Filter Options

**Status Filter**:
- All Campaigns
- Active Only
- Inactive Only
- Expired Only

**Payment Type Filter**:
- All Types
- Free Campaigns
- Paid Campaigns

**Date Range Filter**:
- All Time
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Custom Range (date picker)

**User Filter**:
- Filter by specific User ID
- Shows all campaigns by that user

#### Filter Behavior
- **Combination**: All filters work together (AND logic)
- **URL Params**: Filters are saved in URL for sharing
- **Persistence**: Filters persist on page refresh
- **Clear**: "Clear Filters" button resets all

### Campaign Actions

#### View Campaign
- **Action**: Opens campaign in new tab
- **URL**: `/campaign/[slug]`
- **Purpose**: See campaign as public users see it
- **Permission**: Available to all admins

#### View User
- **Action**: Opens user profile in new tab
- **URL**: `/user/[username]`
- **Purpose**: See all campaigns by this user
- **Permission**: Available to all admins

#### Extend Expiry
- **Action**: Add time to campaign expiration
- **Options**:
  - Add 7 days
  - Add 30 days
  - Add 90 days
  - Custom date (date picker)
- **Behavior**: Updates `expiresAt` timestamp
- **Logging**: Creates log entry with old and new dates
- **Use Case**: Handle support requests, promotional extensions
- **Confirmation**: Requires confirmation modal

#### Activate Campaign
- **Action**: Set campaign status to active
- **Availability**: Only for inactive campaigns
- **Behavior**: Sets `isActive = true`
- **Logging**: Creates log entry
- **Use Case**: Reactivate campaigns after issues resolved
- **Confirmation**: Requires confirmation modal

#### Deactivate Campaign
- **Action**: Set campaign status to inactive
- **Availability**: Only for active campaigns
- **Behavior**: Sets `isActive = false`
- **Effect**: Campaign becomes inaccessible to public
- **Logging**: Creates log entry
- **Use Case**: Handle policy violations, temporary suspension
- **Confirmation**: Requires confirmation modal with reason

#### Delete Campaign
- **Action**: Permanently remove campaign
- **Availability**: All campaigns
- **Behavior**: Deletes Firestore document
- **Warning**: Cannot be undone
- **Logging**: Creates log entry with campaign details
- **Use Case**: Remove spam, test campaigns, or user requests
- **Confirmation**: Requires double confirmation with warning

### Pagination
- **Items per page**: 50 campaigns
- **Navigation**: Previous/Next buttons
- **Page indicator**: Shows current page and total pages
- **Performance**: Cursor-based pagination for efficiency

### Bulk Actions
- **Status**: Not yet implemented
- **Future**: Bulk extend, bulk deactivate, bulk delete

---

## User Management

**Route**: `/admin/users`

### Purpose
Manage user accounts, permissions, and access control.

### User Table

#### Displayed Columns
1. **User ID**: Firebase Auth UID
2. **Name**: User's display name
3. **Email**: User's email address
4. **Username**: Unique username (if set)
5. **Total Campaigns**: Count of campaigns created
6. **Free Campaign Used**: Yes/No indicator
7. **Admin Status**: Admin badge if applicable
8. **Blocked Status**: Blocked badge if applicable
9. **Joined Date**: Account creation date
10. **Actions**: Action buttons (see below)

### Search and Filtering

#### Search Functionality
- **Search by**: Name, Email, User ID, Username
- **Behavior**: Real-time filtering
- **Case**: Case-insensitive

#### Filter Options

**Free Campaign Status**:
- All Users
- Free Campaign Used
- Free Campaign Available

**Campaign Count**:
- All Users
- Users with 0 campaigns
- Users with 1-5 campaigns
- Users with 6+ campaigns

**Admin Status**:
- All Users
- Admins Only
- Non-Admins Only

**Blocked Status**:
- All Users
- Blocked Users Only
- Active Users Only

**Date Range**:
- All Time
- Joined Last 7 Days
- Joined Last 30 Days
- Custom Range

### User Actions

#### Set Admin
- **Action**: Grant or revoke admin privileges
- **Toggle**: On/Off switch
- **Behavior**: 
  - Updates `isAdmin` field in Firestore
  - Sets `isAdmin` custom claim on Firebase Auth token
  - User must log out and back in for claim to take effect
- **Logging**: Creates log entry with admin ID and action
- **Use Case**: Grant admin access to team members
- **Confirmation**: Requires confirmation modal
- **Restriction**: Cannot remove your own admin status

#### Reset Free Campaign
- **Action**: Allow user to create another free campaign
- **Availability**: Only for users who have used free campaign
- **Behavior**: Sets `freeCampaignUsed = false`
- **Logging**: Creates log entry with reason
- **Use Case**: Customer service, promotional offers, error correction
- **Confirmation**: Requires confirmation modal with reason

#### Block User
- **Action**: Prevent user from creating or activating campaigns
- **Toggle**: Block/Unblock
- **Behavior**:
  - Sets `isBlocked = true`
  - Records `blockedAt`, `blockedBy`, `blockedReason`
  - Prevents campaign creation
  - Deactivates existing active campaigns (optional)
- **Logging**: Creates log entry with reason
- **Use Case**: Handle abuse, policy violations, spam
- **Confirmation**: Requires confirmation modal with reason field
- **Effect**: User can still log in but cannot create campaigns

#### Unblock User
- **Action**: Restore user's ability to create campaigns
- **Availability**: Only for blocked users
- **Behavior**: Sets `isBlocked = false`
- **Logging**: Creates log entry
- **Use Case**: Restore access after issue resolved
- **Confirmation**: Requires confirmation modal

#### Delete User
- **Action**: Permanently remove user account
- **Behavior**:
  - Deletes Firestore user document
  - Does NOT delete Firebase Auth account (manual step)
  - Does NOT delete user's campaigns (must be done separately)
- **Warning**: Cannot be undone
- **Logging**: Creates log entry with user details
- **Use Case**: GDPR requests, account cleanup
- **Confirmation**: Requires double confirmation with warning
- **Restriction**: Cannot delete your own account

#### View User Campaigns
- **Action**: Navigate to campaigns page filtered by user
- **URL**: `/admin/campaigns?userId=[userId]`
- **Purpose**: See all campaigns created by user
- **Use Case**: Investigate user activity, support requests

### User Details Modal
- **Trigger**: Click on user row
- **Display**:
  - Full user information
  - Campaign list
  - Payment history
  - Activity timeline
- **Actions**: All user actions available in modal

---

## Payment Analytics

**Route**: `/admin/payments`

### Purpose
Track revenue, analyze payment trends, and troubleshoot payment issues.

### Payment Table

#### Displayed Columns
1. **Payment ID**: Unique identifier
2. **User ID**: User who made payment (clickable)
3. **Campaign ID**: Associated campaign (clickable)
4. **Amount**: Payment amount in ₹
5. **Plan Type**: Week, Month, 3-Month, 6-Month, Year
6. **Status**: Success, Failed, Pending
7. **Created Date**: When payment was initiated
8. **Cashfree Order ID**: Payment gateway order ID
9. **Webhook Data**: Expandable JSON (see below)

#### Status Indicators
- **Success** (Green): Payment completed successfully
- **Failed** (Red): Payment failed or was declined
- **Pending** (Yellow): Payment initiated but not completed

### Webhook Data Viewer

#### Purpose
View complete webhook payload from Cashfree for debugging.

#### Features
- **Expandable Rows**: Click to expand/collapse
- **JSON Formatting**: Pretty-printed JSON
- **Syntax Highlighting**: Color-coded JSON
- **Copy Button**: Copy JSON to clipboard
- **Search**: Search within JSON data

#### Webhook Data Contents
- Order details
- Payment method
- Transaction ID
- Gateway response
- Timestamps
- Customer information
- Error details (if failed)

### Search and Filtering

#### Filter Options

**Status Filter**:
- All Payments
- Successful Only
- Failed Only
- Pending Only

**Time Range Filter**:
- All Time
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Custom Range (date picker)

**Plan Type Filter**:
- All Plans
- Week
- Month
- 3-Month
- 6-Month
- Year

**Amount Range**:
- All Amounts
- Under ₹100
- ₹100 - ₹500
- ₹500 - ₹1000
- Over ₹1000
- Custom Range

### Payment Analytics

#### Revenue by Plan Chart
- **Type**: Pie chart
- **Data**: Total revenue per plan type
- **Interactive**: Click slice to filter table
- **Use Case**: Identify most profitable plans

#### Revenue Trend Chart
- **Type**: Line chart
- **Time Range**: Last 30 days (configurable)
- **Data Points**: Daily revenue totals
- **Interactive**: Hover for exact values
- **Use Case**: Track revenue patterns

#### Payment Success Rate
- **Display**: Percentage gauge
- **Calculation**: (Successful payments / Total payments) × 100
- **Time Range**: Configurable
- **Use Case**: Monitor payment gateway health

#### Average Transaction Value
- **Display**: Currency value
- **Calculation**: Total revenue / Successful payments
- **Time Range**: Configurable
- **Use Case**: Understand customer spending patterns

### Export Functionality
- **Format**: CSV
- **Includes**: All visible columns plus webhook data
- **Filters**: Respects current filters
- **Use Case**: Financial reporting, accounting

---

## System Logs

**Route**: `/admin/logs`

### Purpose
Audit trail of all system events, admin actions, and automated processes.

### Log Table

#### Displayed Columns
1. **Log ID**: Unique identifier
2. **Event Type**: Category of event (see below)
3. **Actor ID**: User or "system" who triggered event
4. **Description**: Human-readable description
5. **Metadata**: Expandable JSON with details
6. **Created Date**: When event occurred

### Event Types

#### Admin Action
- **Color**: Blue
- **Description**: Manual actions performed by admins
- **Examples**:
  - Campaign extended
  - User blocked
  - Settings changed
  - Admin granted
- **Metadata**: Includes before/after values, reason

#### Cron Execution
- **Color**: Green
- **Description**: Automated scheduled tasks
- **Examples**:
  - Campaign expiry check
  - Cleanup tasks
  - Scheduled reports
- **Metadata**: Includes execution time, items processed

#### Webhook Failure
- **Color**: Red
- **Description**: Failed payment webhook processing
- **Examples**:
  - Invalid webhook signature
  - Malformed webhook data
  - Database write failure
- **Metadata**: Includes error details, webhook payload

#### Campaign Expiry
- **Color**: Orange
- **Description**: Campaign expiration events
- **Examples**:
  - Campaign expired naturally
  - Campaign deactivated due to expiry
- **Metadata**: Includes campaign ID, expiry date

#### User Blocked
- **Color**: Red
- **Description**: User blocking actions
- **Examples**:
  - User blocked by admin
  - User unblocked by admin
- **Metadata**: Includes reason, admin ID

#### Settings Changed
- **Color**: Purple
- **Description**: System settings modifications
- **Examples**:
  - Feature toggle changed
  - Plan pricing updated
  - System configuration modified
- **Metadata**: Includes old and new values

### Filtering

#### Event Type Filter
- All Events
- Admin Actions Only
- Cron Executions Only
- Webhook Failures Only
- Campaign Expiries Only
- User Blocked Events Only
- Settings Changes Only

#### Date Range Filter
- All Time
- Last Hour
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Custom Range

#### Actor Filter
- All Actors
- System Events Only
- Specific Admin User
- All Admin Users

### Metadata Viewer

#### Features
- **Expandable Rows**: Click to expand/collapse
- **JSON Formatting**: Pretty-printed JSON
- **Syntax Highlighting**: Color-coded JSON
- **Copy Button**: Copy JSON to clipboard
- **Search**: Search within metadata

#### Common Metadata Fields
- `userId`: Affected user
- `campaignId`: Affected campaign
- `oldValue`: Previous value
- `newValue`: New value
- `reason`: Reason for action
- `error`: Error details (if applicable)
- `duration`: Execution time (for cron)

### Log Retention
- **Default**: Logs kept indefinitely
- **Recommendation**: Archive logs older than 90 days
- **Export**: Export logs to CSV for archival

---

## Platform Settings

**Route**: `/admin/settings`

### Purpose
Configure platform-wide settings, feature toggles, and plan pricing without code changes.

### System Settings

#### Feature Toggles

**Free Campaign Enabled**
- **Type**: Toggle switch
- **Default**: Enabled
- **Effect**: Controls whether users can create one free campaign
- **Use Case**: Promotional periods, platform launch, maintenance
- **Impact**: Affects campaign creation flow

**New Campaigns Enabled**
- **Type**: Toggle switch
- **Default**: Enabled
- **Effect**: Controls whether ANY new campaigns can be created
- **Use Case**: Emergency shutdown, maintenance, capacity management
- **Impact**: Disables campaign creation for all users

**New Signups Enabled**
- **Type**: Toggle switch
- **Default**: Enabled
- **Effect**: Controls whether new users can register
- **Use Case**: Closed beta, capacity management, maintenance
- **Impact**: Disables signup page and API

**Enabled Plans**
- **Type**: Multiple toggle switches
- **Plans**: Week, Month, 3-Month, 6-Month, Year
- **Default**: All enabled
- **Effect**: Controls which subscription plans are available
- **Use Case**: Promotional periods, plan testing, phased rollout
- **Impact**: Hides disabled plans from pricing page

### Plan Pricing

#### Pricing Editor

**Week Plan**
- **Field**: Number input
- **Currency**: ₹ (INR)
- **Default**: ₹99
- **Validation**: Must be positive number
- **Effect**: Updates price on pricing page

**Month Plan**
- **Field**: Number input
- **Currency**: ₹ (INR)
- **Default**: ₹299
- **Validation**: Must be positive number
- **Effect**: Updates price on pricing page

**3-Month Plan**
- **Field**: Number input
- **Currency**: ₹ (INR)
- **Default**: ₹799
- **Validation**: Must be positive number
- **Effect**: Updates price on pricing page

**6-Month Plan**
- **Field**: Number input
- **Currency**: ₹ (INR)
- **Default**: ₹1,499
- **Validation**: Must be positive number
- **Effect**: Updates price on pricing page

**Year Plan**
- **Field**: Number input
- **Currency**: ₹ (INR)
- **Default**: ₹2,799
- **Validation**: Must be positive number
- **Effect**: Updates price on pricing page

#### Pricing Update Behavior
- **Validation**: All prices must be positive
- **Confirmation**: Requires confirmation before saving
- **Logging**: Creates log entry with old and new prices
- **Effect**: Immediate (no deployment needed)
- **Existing Campaigns**: Not affected (grandfathered)

### Manual Actions

#### Trigger Expiry Cron
- **Action**: Manually run campaign expiration check
- **Button**: "Trigger Expiry Check"
- **Behavior**:
  - Finds all campaigns past expiration date
  - Sets status to expired
  - Creates log entries
- **Use Case**: Force expiry check outside scheduled time
- **Logging**: Creates cron execution log
- **Confirmation**: Requires confirmation
- **Feedback**: Shows count of campaigns expired

#### Export Payments
- **Action**: Download all payments as CSV
- **Button**: "Export Payments"
- **Format**: CSV file
- **Includes**: All payment fields
- **Filters**: Respects current date range (if set)
- **Use Case**: Financial reporting, accounting
- **Logging**: Creates log entry
- **Feedback**: Downloads file automatically

#### Export Campaigns
- **Action**: Download all campaigns as CSV
- **Button**: "Export Campaigns"
- **Format**: CSV file
- **Includes**: All campaign fields
- **Filters**: Respects current filters (if set)
- **Use Case**: Data analysis, reporting
- **Logging**: Creates log entry
- **Feedback**: Downloads file automatically

### Settings Persistence
- **Storage**: Firestore `/settings` collection
- **Cache**: No caching (always fresh)
- **Sync**: Immediate across all instances
- **Backup**: Included in Firestore backups

---

## Data Export

### CSV Export Features

#### Available Exports
1. **Payments Export**: All payment transactions
2. **Campaigns Export**: All campaigns
3. **Users Export**: All user accounts (future)
4. **Logs Export**: System logs (future)

#### Export Format

**CSV Structure**:
- Header row with column names
- UTF-8 encoding
- Comma-separated values
- Quoted strings for text fields
- ISO 8601 dates

**Payment CSV Columns**:
```
Payment ID, User ID, Campaign ID, Amount, Plan Type, Status, 
Created Date, Cashfree Order ID, Webhook Data
```

**Campaign CSV Columns**:
```
Campaign ID, Name, User ID, Plan Type, Amount Paid, Status, 
Expiry Date, Created Date, Is Active
```

#### Export Behavior
- **Size Limit**: 10,000 records per export
- **Large Datasets**: Use filters to reduce size
- **Performance**: Streaming for large exports
- **Timeout**: 30 seconds maximum
- **Retry**: Automatic retry on failure

#### Export Use Cases
- Financial reporting
- Data analysis
- Backup and archival
- Integration with external tools
- Compliance and auditing

---

## Security Features

### Authentication

#### Admin Verification
- **Method 1**: Firebase Auth UID matches `ADMIN_UID` environment variable
- **Method 2**: User has `isAdmin = true` in Firestore
- **Method 3**: User has `isAdmin` custom claim on Firebase Auth token
- **Layers**: Server Component check + API route check + Firestore rules

#### Session Management
- **Duration**: Firebase Auth default (1 hour token)
- **Refresh**: Automatic token refresh
- **Logout**: Clears all session data
- **Timeout**: No automatic timeout (relies on Firebase)

### Authorization

#### Role-Based Access
- **Current**: Single admin role
- **Future**: Multiple roles (super admin, support admin, read-only)
- **Permissions**: All admins have full access currently

#### Custom Claims
- **Purpose**: Efficient admin verification
- **Storage**: Firebase Auth token
- **Sync**: Automatic on admin status change
- **Refresh**: Requires logout/login or token expiration

### Data Protection

#### Sensitive Data
- **User Emails**: Visible to admins only
- **Payment Data**: Visible to admins only
- **Webhook Data**: Visible to admins only
- **User IDs**: Visible to admins only

#### Firestore Security Rules
- **Admin Collections**: Require `isAdmin` custom claim
- **User Data**: Protected by user ID or admin status
- **Public Data**: Campaign data (with restrictions)

### Audit Trail

#### Logged Actions
- All admin actions (extend, delete, block, etc.)
- Settings changes
- Manual cron triggers
- Failed access attempts (future)

#### Log Contents
- Actor ID (who performed action)
- Action type
- Affected resources
- Before/after values
- Timestamp
- Reason (if provided)

### Rate Limiting
- **Status**: Not yet implemented
- **Future**: Rate limit admin API routes
- **Purpose**: Prevent abuse, brute force

---

## Performance Optimization

### Query Optimization
- **Indexes**: Composite indexes for all filtered queries
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Server-side caching for statistics (future)

### Chart Performance
- **Data Points**: Limited to 30 days for daily charts
- **Aggregation**: Pre-aggregated data for longer periods (future)
- **Lazy Loading**: Charts load on demand

### API Performance
- **Response Time**: < 1 second for most queries
- **Timeout**: 30 seconds maximum
- **Optimization**: Firestore query optimization

---

## Future Enhancements

### Planned Features
- Bulk operations (bulk extend, bulk delete)
- Advanced search with full-text search
- Real-time updates with WebSockets
- Email notifications for critical events
- Slack integration for alerts
- Role-based access control
- User export functionality
- Log export functionality
- Advanced analytics and reporting
- A/B testing dashboard
- Cohort analysis
- Revenue forecasting

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
**Feature Status**: Production Ready ✅
