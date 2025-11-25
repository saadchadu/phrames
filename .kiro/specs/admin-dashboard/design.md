# Admin Dashboard Design Document

## Overview

The Admin Dashboard is a comprehensive administrative interface built as a secure, isolated subsystem within the Phrames Next.js application. It provides the platform owner with complete visibility and control over users, campaigns, payments, system logs, and configuration settings. The dashboard leverages Next.js 13+ App Router with Server Components for secure server-side rendering, Firebase Admin SDK for elevated database access, and Recharts for data visualization.

The architecture follows a defense-in-depth security model with multiple layers: server-side authentication checks, API route middleware, Firestore security rules, and Firebase custom claims. The UI is built with TailwindCSS to match the existing Phrames design system and is fully responsive for mobile, tablet, and desktop administration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Admin UI (Next.js Server Components + Client Islands) │ │
│  │  - /admin (Overview)                                    │ │
│  │  - /admin/campaigns                                     │ │
│  │  - /admin/users                                         │ │
│  │  - /admin/payments                                      │ │
│  │  - /admin/logs                                          │ │
│  │  - /admin/settings                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Security Middleware Layer                  │
│  - Server Component Auth Checks                             │
│  - API Route Admin Verification                             │
│  - Firebase Custom Claims Validation                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
│  /api/admin/campaigns  /api/admin/users                     │
│  /api/admin/payments   /api/admin/logs                      │
│  /api/admin/settings   /api/admin/actions                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  - Firebase Admin SDK (elevated privileges)                 │
│  - Firestore Collections: users, campaigns, payments, logs  │
│  - Firestore Settings: /settings/system, /settings/plans    │
└─────────────────────────────────────────────────────────────┘
```

### Security Architecture

The admin system implements defense-in-depth with four security layers:

1. **Server Component Layer**: All admin pages use Next.js Server Components that check admin status before rendering
2. **API Route Layer**: All `/api/admin/**` routes verify admin privileges via middleware
3. **Firestore Rules Layer**: Database rules enforce `isAdmin == true` for admin collections
4. **Custom Claims Layer**: Firebase Auth custom claims provide token-based admin verification

### Technology Stack

- **Frontend**: Next.js 13+ App Router, React Server Components, TailwindCSS
- **Charts**: Recharts for responsive data visualization
- **Backend**: Next.js API Routes with Firebase Admin SDK
- **Database**: Firestore with security rules
- **Authentication**: Firebase Auth with custom claims
- **Deployment**: Vercel (frontend) + Firebase Functions (cron jobs)

## Components and Interfaces

### 1. Admin Authentication Module

**Location**: `lib/admin-auth.ts`

**Purpose**: Centralized admin verification logic used across server components and API routes

**Interface**:
```typescript
interface AdminAuthResult {
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}

async function verifyAdminAccess(request?: Request): Promise<AdminAuthResult>
async function requireAdmin(request?: Request): Promise<string> // throws if not admin
async function setAdminClaim(userId: string, isAdmin: boolean): Promise<void>
```

**Implementation Details**:
- Reads Firebase Auth token from request headers or cookies
- Checks if user UID matches environment variable `ADMIN_UID`
- Queries Firestore `users/{userId}` for `isAdmin` field
- Caches admin status in Firebase custom claims for performance
- Returns structured result with admin status and user ID

### 2. Admin Layout Component

**Location**: `app/admin/layout.tsx`

**Purpose**: Shared layout for all admin pages with navigation sidebar

**Features**:
- Server Component that verifies admin access before rendering
- Responsive sidebar navigation (collapsible on mobile)
- Navigation items: Overview, Campaigns, Users, Payments, Logs, Settings
- Active route highlighting
- Logout functionality
- Breadcrumb navigation

### 3. Admin API Routes

**Base Path**: `/api/admin/**`

**Middleware**: All routes use `verifyAdminAccess()` before processing

**Routes**:

#### `/api/admin/stats` (GET)
- Returns overview dashboard statistics
- Aggregates: user count, campaign counts, revenue metrics
- Calculates: daily revenue (30 days), daily signups (30 days), plan distribution

#### `/api/admin/campaigns` (GET, PATCH, DELETE)
- GET: List campaigns with filtering and pagination
- PATCH: Update campaign (extend expiry, activate/deactivate)
- DELETE: Remove campaign and log action

#### `/api/admin/users` (GET, PATCH, DELETE)
- GET: List users with filtering
- PATCH: Update user (set admin, reset free campaign, block)
- DELETE: Remove user and log action

#### `/api/admin/payments` (GET)
- GET: List payment transactions with filtering
- Returns: payment details, webhook data, aggregated analytics

#### `/api/admin/logs` (GET, POST)
- GET: Retrieve system logs with filtering
- POST: Create manual log entry (used by admin actions)

#### `/api/admin/settings` (GET, PATCH)
- GET: Retrieve current system settings and plan pricing
- PATCH: Update settings or pricing

#### `/api/admin/actions` (POST)
- POST: Execute admin actions (trigger cron, export CSV)
- Actions: `triggerExpiryCron`, `exportPayments`, `exportCampaigns`

### 4. Admin Dashboard Pages

#### `/admin/page.tsx` - Overview Dashboard

**Data Sources**:
- Firestore aggregation queries for counts
- Payment collection sum for revenue
- Time-series queries for charts

**Components**:
- `StatsCard`: Displays metric with icon and value
- `RevenueChart`: Line chart of daily revenue (Recharts)
- `UserGrowthChart`: Line chart of daily signups
- `CampaignTrendsChart`: Stacked area chart (active vs expired)
- `PlanDistributionChart`: Bar chart of plans sold
- `RecentActivityTable`: Lists recent campaigns, payments, signups

#### `/admin/campaigns/page.tsx` - Campaign Management

**Features**:
- Server-side data fetching with pagination
- Search bar (filters by name, ID, user ID)
- Filter dropdowns (status, payment type, date range)
- Data table with sortable columns
- Action buttons per row: View, Edit, Extend, Deactivate, Delete
- Modal dialogs for confirmation and date selection

**Components**:
- `CampaignTable`: Server Component with data
- `CampaignFilters`: Client Component for interactive filtering
- `CampaignActions`: Client Component for action buttons
- `ExtendExpiryModal`: Date picker for custom expiry extension

#### `/admin/users/page.tsx` - User Management

**Features**:
- User list with search and filtering
- Filter by: freeCampaignUsed, campaign count, blocked status
- Actions: Set admin, Reset free campaign, Block/Unblock, Delete, View campaigns

**Components**:
- `UserTable`: Server Component with user data
- `UserFilters`: Client Component for filtering
- `UserActions`: Client Component for admin actions
- `ConfirmationModal`: Reusable confirmation dialog

#### `/admin/payments/page.tsx` - Payment Analytics

**Features**:
- Payment transaction list with expandable webhook JSON
- Filters: status, date range, plan type
- Revenue analytics: pie chart by plan, line chart over time
- Export to CSV functionality

**Components**:
- `PaymentTable`: Server Component with payment data
- `PaymentFilters`: Client Component for filtering
- `RevenueByPlanChart`: Pie chart (Recharts)
- `RevenueTrendChart`: Line chart (Recharts)
- `WebhookDataExpander`: Expandable JSON viewer

#### `/admin/logs/page.tsx` - System Logs

**Features**:
- Log entries with filtering by event type and date
- Expandable metadata JSON
- Color-coded event types (info, warning, error)
- Real-time updates (optional)

**Components**:
- `LogTable`: Server Component with log data
- `LogFilters`: Client Component for filtering
- `LogMetadataExpander`: JSON viewer for metadata

#### `/admin/settings/page.tsx` - System Settings

**Features**:
- Toggle switches for system features
- Plan pricing editor with validation
- Manual action buttons (trigger cron, export data)
- Settings saved to Firestore with confirmation

**Components**:
- `SettingsForm`: Client Component with form state
- `ToggleSwitch`: Reusable toggle component
- `PricingEditor`: Input fields for each plan price
- `ActionButtons`: Buttons for manual operations

### 5. Logging Service

**Location**: `lib/admin-logging.ts`

**Purpose**: Centralized logging for admin actions and system events

**Interface**:
```typescript
enum LogEventType {
  ADMIN_ACTION = 'admin_action',
  CRON_EXECUTION = 'cron_execution',
  WEBHOOK_FAILURE = 'webhook_failure',
  CAMPAIGN_EXPIRY = 'campaign_expiry',
  USER_BLOCKED = 'user_blocked',
  SETTINGS_CHANGED = 'settings_changed'
}

interface LogEntry {
  id: string;
  eventType: LogEventType;
  actorId: string; // 'system' or admin user ID
  description: string;
  metadata: Record<string, any>;
  createdAt: Timestamp;
}

async function createLog(entry: Omit<LogEntry, 'id' | 'createdAt'>): Promise<void>
async function getLogs(filters: LogFilters): Promise<LogEntry[]>
```

### 6. Settings Service

**Location**: `lib/admin-settings.ts`

**Purpose**: Manage system-wide settings and plan pricing

**Interface**:
```typescript
interface SystemSettings {
  freeCampaignEnabled: boolean;
  newCampaignsEnabled: boolean;
  newSignupsEnabled: boolean;
  enabledPlans: {
    week: boolean;
    month: boolean;
    '3month': boolean;
    '6month': boolean;
    year: boolean;
  };
}

interface PlanPricing {
  week: number;
  month: number;
  '3month': number;
  '6month': number;
  year: number;
}

async function getSystemSettings(): Promise<SystemSettings>
async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<void>
async function getPlanPricing(): Promise<PlanPricing>
async function updatePlanPricing(pricing: Partial<PlanPricing>): Promise<void>
```

## Data Models

### Admin Log Entry (Firestore: `/logs/{logId}`)

```typescript
{
  id: string;
  eventType: 'admin_action' | 'cron_execution' | 'webhook_failure' | 'campaign_expiry' | 'user_blocked' | 'settings_changed';
  actorId: string; // user ID or 'system'
  description: string;
  metadata: {
    [key: string]: any; // Event-specific data
  };
  createdAt: Timestamp;
}
```

**Indexes**:
- `eventType` (ascending), `createdAt` (descending)
- `actorId` (ascending), `createdAt` (descending)

### System Settings (Firestore: `/settings/system`)

```typescript
{
  freeCampaignEnabled: boolean;
  newCampaignsEnabled: boolean;
  newSignupsEnabled: boolean;
  enabledPlans: {
    week: boolean;
    month: boolean;
    '3month': boolean;
    '6month': boolean;
    year: boolean;
  };
  updatedAt: Timestamp;
  updatedBy: string; // admin user ID
}
```

### Plan Pricing (Firestore: `/settings/plans`)

```typescript
{
  week: number;
  month: number;
  '3month': number;
  '6month': number;
  year: number;
  currency: 'INR';
  updatedAt: Timestamp;
  updatedBy: string; // admin user ID
}
```

### Enhanced User Model (Firestore: `/users/{userId}`)

**New Fields Added**:
```typescript
{
  // ... existing fields ...
  isAdmin: boolean; // NEW: Admin privilege flag
  isBlocked: boolean; // NEW: User blocked status
  blockedAt?: Timestamp; // NEW: When user was blocked
  blockedBy?: string; // NEW: Admin who blocked the user
  blockedReason?: string; // NEW: Reason for blocking
}
```

### Enhanced Payment Model (Firestore: `/payments/{paymentId}`)

**Existing fields remain, ensure webhook data is stored**:
```typescript
{
  // ... existing fields ...
  webhookData: any; // Complete webhook payload from Cashfree
  webhookReceivedAt: Timestamp;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework, several redundancies were identified:

- **Properties 1.4 and 8.1** both test that admin API routes verify admin privileges - these can be combined into a single comprehensive property
- **Properties 8.2 and 8.4** both test that Firestore rules block unauthorized access - these are the same property stated differently
- **Properties 2.2, 2.3, 2.7** all test statistical aggregation - these can be combined into a single property about correct aggregation
- **Properties 3.2 and 3.3** both test filtering functionality - these can be combined into a comprehensive filtering property
- **Properties 5.2, 5.3, 5.4** test payment analytics - these can be combined into a single property about payment data accuracy

After consolidation, we have the following unique properties:

Property 1: Admin route access control
Property 2: Admin API authentication
Property 3: Statistical aggregation accuracy
Property 4: Campaign filtering correctness
Property 5: Campaign state modification
Property 6: User management operations
Property 7: Payment data analytics
Property 8: Logging completeness
Property 9: Settings persistence
Property 10: Feature toggle enforcement
Property 11: Firestore security rules
Property 12: Non-admin UI isolation
Property 13: Existing functionality preservation

### Correctness Properties

Property 1: Admin route access control
*For any* user attempting to access routes under `/admin`, if the user does not have `isAdmin = true` in Firestore and their Firebase Auth UID does not match the owner's UID, then the system should redirect them to a 404 page
**Validates: Requirements 1.1, 1.2**

Property 2: Admin API authentication
*For any* API route under `/api/admin/**`, when called with credentials, the system should verify the user has `isAdmin = true` before processing the request, and reject non-admin requests
**Validates: Requirements 1.4, 8.1**

Property 3: Statistical aggregation accuracy
*For any* set of users, campaigns, and payments in the database, the overview dashboard statistics (counts, revenue sums, plan distributions) should match the actual data when calculated independently
**Validates: Requirements 2.2, 2.3, 2.7**

Property 4: Campaign filtering correctness
*For any* set of campaigns and any combination of filters (status, payment type, search term, date range), the filtered results should include only campaigns that match all applied filter criteria
**Validates: Requirements 3.2, 3.3**

Property 5: Campaign state modification
*For any* campaign, when an admin performs a state modification (deactivate, extend expiry, reactivate, delete), the campaign's state should change as specified and a log entry should be created
**Validates: Requirements 3.4, 3.5, 3.6, 3.7**

Property 6: User management operations
*For any* user, when an admin performs a management operation (set admin, reset free campaign, block, delete), the user's state should change as specified and a log entry should be created
**Validates: Requirements 4.3, 4.4, 4.5, 4.7**

Property 7: Blocked user campaign prevention
*For any* user where `isBlocked = true`, attempts to create or activate campaigns should be rejected with an error message
**Validates: Requirements 4.5, 4.6**

Property 8: Payment data analytics
*For any* set of payments, the payment analytics (revenue by plan, daily revenue trends, filtered results) should accurately reflect the payment data when calculated independently
**Validates: Requirements 5.2, 5.3, 5.4**

Property 9: Webhook data persistence
*For any* payment webhook received, the complete webhook payload should be stored in Firestore and retrievable from the admin payments page
**Validates: Requirements 5.5**

Property 10: Logging completeness
*For any* automated system action (cron execution, webhook failure, campaign expiry) or admin action (deactivate, delete, settings change), a log entry should be created in the `/logs` collection with the correct event type, actor ID, and metadata
**Validates: Requirements 6.2, 6.3, 6.5**

Property 11: Settings persistence
*For any* system setting or plan pricing update made by an admin, the new value should be persisted to Firestore and retrievable on subsequent reads
**Validates: Requirements 7.2, 7.3**

Property 12: Feature toggle enforcement
*For any* feature toggle in system settings, when disabled, operations related to that feature should be blocked and return appropriate error messages
**Validates: Requirements 7.6**

Property 13: CSV export completeness
*For any* export operation (payments or campaigns), the generated CSV should contain all records from the database with all relevant fields
**Validates: Requirements 7.5**

Property 14: Firestore security rules enforcement
*For any* non-admin user attempting to read or write admin collections (`/logs`, `/settings`), Firestore security rules should deny the request
**Validates: Requirements 8.2, 8.4**

Property 15: Custom claims synchronization
*For any* user where `isAdmin` is set to true in Firestore, the user's Firebase Auth token should have the `isAdmin` custom claim set to true
**Validates: Requirements 8.3**

Property 16: Non-admin UI isolation
*For any* non-admin user viewing the application, admin navigation links and UI elements should not be rendered
**Validates: Requirements 10.1**

Property 17: Existing functionality preservation
*For any* existing user flow (authentication, campaign creation, payment processing), the functionality should continue to work correctly after admin dashboard deployment
**Validates: Requirements 10.2, 10.3, 10.4**

## Error Handling

### Authentication Errors

**Scenario**: User attempts to access admin routes without proper credentials

**Handling**:
- Server Components: Redirect to 404 page using Next.js `notFound()`
- API Routes: Return 403 Forbidden with JSON error message
- Log failed access attempts for security monitoring

### Authorization Errors

**Scenario**: Admin attempts an operation they don't have permission for (future role-based access)

**Handling**:
- Return 403 Forbidden with specific error message
- Log the unauthorized attempt
- Display user-friendly error message in UI

### Data Validation Errors

**Scenario**: Admin submits invalid data (negative prices, invalid dates, etc.)

**Handling**:
- Validate input on both client and server
- Return 400 Bad Request with validation error details
- Display inline validation errors in forms
- Prevent form submission until errors are resolved

### Database Errors

**Scenario**: Firestore operations fail (network issues, permission errors, etc.)

**Handling**:
- Catch Firestore exceptions and log with context
- Return 500 Internal Server Error with generic message (don't expose internals)
- Display user-friendly error message with retry option
- Implement exponential backoff for transient failures

### External Service Errors

**Scenario**: Firebase Auth or Admin SDK operations fail

**Handling**:
- Catch service exceptions and log with context
- Return appropriate HTTP status code (503 Service Unavailable)
- Display error message with support contact information
- Implement circuit breaker pattern for repeated failures

### Concurrent Modification Errors

**Scenario**: Two admins modify the same resource simultaneously

**Handling**:
- Use Firestore transactions for critical operations
- Implement optimistic locking with version fields
- Return 409 Conflict when concurrent modification detected
- Prompt user to refresh and retry

### CSV Export Errors

**Scenario**: Export fails due to large dataset or memory constraints

**Handling**:
- Implement streaming CSV generation for large datasets
- Set reasonable timeout limits
- Return partial results with warning if timeout occurs
- Provide pagination or date range filtering for large exports

## Testing Strategy

### Unit Testing

The admin dashboard will use unit tests for:

**Authentication and Authorization**:
- Test `verifyAdminAccess()` with various user states (admin, non-admin, no auth)
- Test admin UID matching logic
- Test custom claims verification

**Data Aggregation**:
- Test statistics calculation functions with known datasets
- Test revenue summation with various payment statuses
- Test date range filtering for time-series data

**Logging Service**:
- Test log entry creation with various event types
- Test log retrieval with different filters
- Test metadata serialization

**Settings Service**:
- Test settings read/write operations
- Test plan pricing validation
- Test toggle state management

**CSV Export**:
- Test CSV generation with sample data
- Test field formatting and escaping
- Test empty dataset handling

### Property-Based Testing

The admin dashboard will use property-based testing with **fast-check** (JavaScript/TypeScript PBT library) for:

**Property Testing Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: admin-dashboard, Property {number}: {property_text}**`
- Tests located in `tests/admin/` directory

**Property 1: Admin route access control**
- Generate random users (admin and non-admin)
- Attempt to access admin routes
- Verify only admins succeed and non-admins get 404
- **Feature: admin-dashboard, Property 1: Admin route access control**

**Property 2: Admin API authentication**
- Generate random API requests to `/api/admin/**` endpoints
- Use both admin and non-admin credentials
- Verify only admin requests are processed
- **Feature: admin-dashboard, Property 2: Admin API authentication**

**Property 3: Statistical aggregation accuracy**
- Generate random sets of users, campaigns, and payments
- Calculate statistics independently
- Verify dashboard statistics match independent calculations
- **Feature: admin-dashboard, Property 3: Statistical aggregation accuracy**

**Property 4: Campaign filtering correctness**
- Generate random campaigns with various attributes
- Apply random filter combinations
- Verify filtered results match filter criteria
- **Feature: admin-dashboard, Property 4: Campaign filtering correctness**

**Property 5: Campaign state modification**
- Generate random campaigns
- Perform random state modifications
- Verify state changes and log entries
- **Feature: admin-dashboard, Property 5: Campaign state modification**

**Property 6: User management operations**
- Generate random users
- Perform random management operations
- Verify state changes and log entries
- **Feature: admin-dashboard, Property 6: User management operations**

**Property 7: Blocked user campaign prevention**
- Generate random blocked users
- Attempt campaign creation
- Verify all attempts are rejected
- **Feature: admin-dashboard, Property 7: Blocked user campaign prevention**

**Property 8: Payment data analytics**
- Generate random payment datasets
- Calculate analytics independently
- Verify dashboard analytics match calculations
- **Feature: admin-dashboard, Property 8: Payment data analytics**

**Property 9: Webhook data persistence**
- Generate random webhook payloads
- Send to webhook endpoint
- Verify complete payload is stored and retrievable
- **Feature: admin-dashboard, Property 9: Webhook data persistence**

**Property 10: Logging completeness**
- Perform random admin and system actions
- Verify log entries are created for each action
- Verify log metadata is complete and accurate
- **Feature: admin-dashboard, Property 10: Logging completeness**

**Property 11: Settings persistence**
- Generate random setting and pricing updates
- Save to Firestore
- Verify values persist and are retrievable
- **Feature: admin-dashboard, Property 11: Settings persistence**

**Property 12: Feature toggle enforcement**
- Generate random feature toggle states
- Attempt operations for disabled features
- Verify operations are blocked
- **Feature: admin-dashboard, Property 12: Feature toggle enforcement**

**Property 13: CSV export completeness**
- Generate random datasets
- Export to CSV
- Verify all records are present in CSV
- **Feature: admin-dashboard, Property 13: CSV export completeness**

**Property 14: Firestore security rules enforcement**
- Generate random non-admin users
- Attempt to read/write admin collections
- Verify all attempts are denied
- **Feature: admin-dashboard, Property 14: Firestore security rules enforcement**

**Property 15: Custom claims synchronization**
- Generate random users
- Set isAdmin to true in Firestore
- Verify custom claim is set in Auth token
- **Feature: admin-dashboard, Property 15: Custom claims synchronization**

**Property 16: Non-admin UI isolation**
- Generate random non-admin users
- Render application UI
- Verify admin elements are not present
- **Feature: admin-dashboard, Property 16: Non-admin UI isolation**

**Property 17: Existing functionality preservation**
- Run existing test suites for user flows
- Verify all tests still pass
- Verify no regressions introduced
- **Feature: admin-dashboard, Property 17: Existing functionality preservation**

### Integration Testing

Integration tests will verify:

- End-to-end admin workflows (login → view stats → modify campaign → verify change)
- API route integration with Firestore
- Authentication flow with Firebase Auth
- Logging integration with admin actions
- Settings changes affecting user-facing features

### Manual Testing Checklist

Before deployment, manually verify:

- [ ] Admin can access all admin pages
- [ ] Non-admin users cannot access admin pages
- [ ] All statistics display correctly with real data
- [ ] Campaign management actions work (extend, deactivate, delete)
- [ ] User management actions work (set admin, block, reset)
- [ ] Payment data displays correctly
- [ ] Logs are created for all admin actions
- [ ] Settings changes persist and take effect
- [ ] CSV exports contain complete data
- [ ] Mobile responsive layout works on actual devices
- [ ] Existing user flows are not affected

## Security Considerations

### Defense in Depth

The admin system implements multiple security layers:

1. **Server-Side Rendering**: Admin pages use Server Components that check auth before rendering
2. **API Middleware**: All admin API routes verify admin status before processing
3. **Firestore Rules**: Database rules enforce admin-only access to sensitive collections
4. **Custom Claims**: Firebase Auth tokens include admin claim for efficient verification
5. **Environment Variables**: Admin UID stored securely in environment variables

### Sensitive Data Protection

- Admin UID stored in environment variable `ADMIN_UID` (not in code)
- Webhook data may contain sensitive payment information - restrict access to admin only
- User email addresses visible to admin - ensure admin accounts are secure
- Payment amounts and transaction details - log admin access for audit trail

### Audit Trail

All admin actions are logged with:
- Admin user ID
- Action type
- Affected resource IDs
- Timestamp
- Metadata (before/after values for modifications)

### Rate Limiting

Implement rate limiting on admin API routes to prevent:
- Brute force admin access attempts
- Excessive data exports
- Rapid-fire modifications

### Session Management

- Admin sessions should have shorter timeout than regular users
- Require re-authentication for destructive actions
- Implement "sudo mode" for critical operations

## Performance Considerations

### Data Pagination

- Campaign and user lists paginated (50 items per page)
- Implement cursor-based pagination for efficient Firestore queries
- Load additional pages on demand

### Query Optimization

- Create Firestore composite indexes for common filter combinations
- Cache statistics that don't need real-time accuracy (refresh every 5 minutes)
- Use Firestore aggregation queries where available

### Chart Data

- Limit time-series data to reasonable ranges (30 days for daily charts)
- Pre-aggregate data for longer time periods (weekly/monthly)
- Cache chart data on server with short TTL

### CSV Export

- Stream large exports instead of loading all data into memory
- Implement background job for very large exports (>10,000 records)
- Provide download link when export completes

### Client-Side Performance

- Use React Server Components to reduce client-side JavaScript
- Lazy load chart libraries (Recharts) only when needed
- Implement virtual scrolling for long tables

## Deployment Considerations

### Environment Variables

Required environment variables:
```
ADMIN_UID=<firebase-auth-uid-of-owner>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
FIREBASE_ADMIN_PRIVATE_KEY=<service-account-key>
```

### Firestore Indexes

Required composite indexes:
```
Collection: logs
- eventType (ascending), createdAt (descending)
- actorId (ascending), createdAt (descending)

Collection: campaigns
- userId (ascending), createdAt (descending)
- status (ascending), expiresAt (ascending)

Collection: payments
- status (ascending), createdAt (descending)
- planType (ascending), createdAt (descending)
```

### Firestore Security Rules

Add admin collection rules:
```javascript
match /logs/{logId} {
  allow read, write: if request.auth.token.isAdmin == true;
}

match /settings/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.isAdmin == true;
}
```

### Custom Claims Setup

Implement Cloud Function or admin script to set custom claims:
```typescript
admin.auth().setCustomUserClaims(userId, { isAdmin: true });
```

### Monitoring

Set up monitoring for:
- Failed admin login attempts
- Admin action frequency
- API route response times
- Firestore query performance
- Error rates on admin endpoints

## Future Enhancements

### Role-Based Access Control

- Multiple admin roles (super admin, support admin, read-only admin)
- Granular permissions per role
- Role assignment UI

### Advanced Analytics

- Cohort analysis for user retention
- Revenue forecasting
- Campaign performance metrics
- A/B test results dashboard

### Bulk Operations

- Bulk campaign extension
- Bulk user management
- Batch imports/exports

### Real-Time Updates

- WebSocket or Server-Sent Events for live dashboard updates
- Real-time notification of new payments
- Live user activity monitoring

### Audit Log Search

- Full-text search in logs
- Advanced filtering and date range selection
- Export audit logs for compliance

### Automated Alerts

- Email notifications for critical events
- Slack integration for admin alerts
- Configurable alert thresholds
