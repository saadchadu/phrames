# Requirements Document

## Introduction

The Admin Dashboard is a comprehensive management interface for the Phrames application owner to monitor, manage, and control all aspects of the platform including users, campaigns, payments, system logs, and configuration settings. The dashboard provides real-time analytics, administrative actions, and system-level controls while maintaining strict security to ensure only authorized administrators can access these capabilities.

## Glossary

- **Admin Dashboard**: The administrative interface accessible only to authorized administrators
- **Admin User**: A user with `isAdmin = true` in Firestore or matching the owner's Firebase Auth UID
- **Campaign**: A user-created photo frame campaign with associated metadata, status, and expiration
- **Plan Type**: The subscription tier (free, week, month, 3month, 6month, year)
- **System Logs**: Audit trail records of system events, admin actions, and automated processes
- **Cron Function**: Automated scheduled task that expires campaigns
- **Webhook**: Cashfree payment gateway callback for payment status updates
- **Firestore**: The Firebase NoSQL database storing application data
- **Server Component**: Next.js component that renders on the server with secure data access
- **API Route**: Server-side endpoint for handling data operations and business logic

## Requirements

### Requirement 1

**User Story:** As the platform owner, I want secure admin-only access to the dashboard, so that unauthorized users cannot view or modify sensitive business data.

#### Acceptance Criteria

1. WHEN a user attempts to access any route under `/admin`, THEN the system SHALL verify the user has `isAdmin = true` in Firestore OR their Firebase Auth UID matches the owner's UID
2. WHEN an unauthorized user attempts to access `/admin` routes, THEN the system SHALL redirect them to a 404 page
3. WHEN admin verification occurs, THEN the system SHALL perform the check server-side using Next.js Server Components or API route middleware
4. WHEN API routes under `/api/admin/**` are called, THEN the system SHALL verify admin privileges before processing any request
5. WHERE client-side rendering occurs, THEN the system SHALL NOT rely solely on client-side admin checks for security

### Requirement 2

**User Story:** As an administrator, I want to view comprehensive business metrics on the overview dashboard, so that I can monitor platform health and growth at a glance.

#### Acceptance Criteria

1. WHEN the administrator visits `/admin`, THEN the system SHALL display total user count from Firestore users collection
2. WHEN displaying campaign statistics, THEN the system SHALL show total campaigns, active campaigns, expired campaigns, and free campaigns used counts
3. WHEN calculating revenue metrics, THEN the system SHALL sum all successful payments and display total revenue, today's revenue, and last 30 days revenue
4. WHEN rendering analytics graphs, THEN the system SHALL display a line chart showing daily revenue for the past 30 days
5. WHEN showing user growth, THEN the system SHALL display a line chart of daily new user signups for the past 30 days
6. WHEN displaying campaign trends, THEN the system SHALL show a stacked line chart comparing active versus expired campaigns over time
7. WHEN showing plan distribution, THEN the system SHALL display a bar chart breaking down plans sold by type (week, month, 3month, 6month, year)
8. WHEN showing recent activity, THEN the system SHALL display the 5 most recently created campaigns, 10 most recent payments, and recent user signups

### Requirement 3

**User Story:** As an administrator, I want to manage all campaigns with search, filtering, and administrative actions, so that I can maintain campaign quality and handle support requests.

#### Acceptance Criteria

1. WHEN the administrator visits `/admin/campaigns`, THEN the system SHALL display a table with columns: campaign ID, name, creator, plan type, amount paid, status, expiry date, and created date
2. WHEN the administrator uses search functionality, THEN the system SHALL filter campaigns by campaign name, user ID, or campaign ID
3. WHEN the administrator applies filters, THEN the system SHALL filter campaigns by status (active, inactive, expired), payment type (free, paid), user ID, or date range
4. WHEN the administrator deactivates a campaign, THEN the system SHALL set the campaign's `isActive` field to false and log the action
5. WHEN the administrator extends a campaign expiry, THEN the system SHALL add the specified days (7, 30, or 90) to the `expiresAt` timestamp or set a custom date
6. WHEN the administrator reactivates a campaign, THEN the system SHALL set `isActive` to true and update the expiry date appropriately
7. WHEN the administrator deletes a campaign, THEN the system SHALL remove the campaign document from Firestore and log the deletion
8. WHEN the administrator clicks view actions, THEN the system SHALL provide links to the public campaign page and user profile page

### Requirement 4

**User Story:** As an administrator, I want to manage user accounts with filtering and administrative controls, so that I can handle user issues and enforce platform policies.

#### Acceptance Criteria

1. WHEN the administrator visits `/admin/users`, THEN the system SHALL display a table with columns: user ID, name, email, username, total campaigns, freeCampaignUsed status, and joined date
2. WHEN the administrator filters users, THEN the system SHALL filter by freeCampaignUsed status, campaign count thresholds, or users with expired campaigns
3. WHEN the administrator sets admin privileges, THEN the system SHALL update the user's `isAdmin` field to true or false
4. WHEN the administrator resets a user's free campaign, THEN the system SHALL set `freeCampaignUsed` to false and log the action
5. WHEN the administrator blocks a user, THEN the system SHALL set `isBlocked` to true and prevent the user from creating or activating campaigns
6. WHEN a blocked user attempts to create a campaign, THEN the system SHALL reject the request with an appropriate error message
7. WHEN the administrator deletes a user, THEN the system SHALL remove the user document and log the deletion
8. WHEN the administrator views user campaigns, THEN the system SHALL display all campaigns created by that user

### Requirement 5

**User Story:** As an administrator, I want to view and analyze all payment transactions, so that I can track revenue, troubleshoot payment issues, and understand business performance.

#### Acceptance Criteria

1. WHEN the administrator visits `/admin/payments`, THEN the system SHALL display a table with columns: payment ID, user ID, campaign ID, amount, plan type, status, created date, Cashfree order ID, and expandable raw webhook JSON
2. WHEN the administrator filters payments, THEN the system SHALL filter by status (success, failed), time range (last 24 hours, last 7 days), or plan type
3. WHEN displaying payment analytics, THEN the system SHALL show a pie chart of revenue distribution by plan type
4. WHEN showing revenue trends, THEN the system SHALL display a line chart of daily revenue over time
5. WHEN a payment webhook is received, THEN the system SHALL store the complete webhook payload in Firestore for admin review

### Requirement 6

**User Story:** As an administrator, I want to view system logs of automated processes and admin actions, so that I can audit system behavior and troubleshoot issues.

#### Acceptance Criteria

1. WHEN the administrator visits `/admin/logs`, THEN the system SHALL display a table with columns: log ID, event type, actor ID, description, metadata, and created date
2. WHEN the system performs automated actions, THEN the system SHALL create log entries for cron job executions, webhook failures, and campaign expiry events
3. WHEN an administrator performs manual actions, THEN the system SHALL create log entries recording the admin user ID, action type, and affected resources
4. WHEN displaying log details, THEN the system SHALL provide expandable rows showing complete metadata JSON
5. WHEN logs are created, THEN the system SHALL store them in a dedicated Firestore collection `/logs` with appropriate indexing

### Requirement 7

**User Story:** As an administrator, I want to control system-wide settings and pricing, so that I can manage platform features and business rules without code changes.

#### Acceptance Criteria

1. WHEN the administrator visits `/admin/settings`, THEN the system SHALL display toggles for enabling/disabling free first campaign, new campaign creation, new user signups, and specific plan availability
2. WHEN the administrator modifies a system toggle, THEN the system SHALL update the corresponding value in Firestore `/settings/system` collection
3. WHEN the administrator updates plan pricing, THEN the system SHALL update the price values in Firestore `/settings/plans` collection for each plan type (week, month, 3month, 6month, year)
4. WHEN the administrator manually triggers the expiry cron function, THEN the system SHALL execute the campaign expiry check immediately and log the action
5. WHEN the administrator exports data, THEN the system SHALL generate CSV files containing all payments or all campaigns with relevant fields
6. WHEN the system checks feature availability, THEN the system SHALL read the current toggle states from Firestore `/settings/system` before allowing operations

### Requirement 8

**User Story:** As an administrator, I want all admin operations to be secured with proper API routes and Firestore rules, so that the system prevents unauthorized access at multiple layers.

#### Acceptance Criteria

1. WHEN an API route under `/api/admin/**` is called, THEN the system SHALL verify the requesting user has `isAdmin = true` before processing
2. WHEN Firestore security rules evaluate admin collection access, THEN the rules SHALL only allow reads and writes if `request.auth.token.isAdmin == true`
3. WHEN the system creates custom claims, THEN the system SHALL set the `isAdmin` claim on the user's Firebase Auth token when `isAdmin` is true in Firestore
4. WHEN unauthorized users attempt to read admin collections, THEN Firestore SHALL deny the request based on security rules
5. WHEN the system performs admin operations, THEN the system SHALL use Firebase Admin SDK with elevated privileges on the server side

### Requirement 9

**User Story:** As an administrator, I want the admin dashboard UI to be responsive and match the Phrames design system, so that I can manage the platform from any device with a consistent experience.

#### Acceptance Criteria

1. WHEN the administrator views the dashboard on mobile devices, THEN the system SHALL display a collapsible sidebar navigation
2. WHEN rendering UI components, THEN the system SHALL use TailwindCSS classes matching the existing Phrames color scheme and design patterns
3. WHEN displaying charts and graphs, THEN the system SHALL use Recharts library with responsive configurations
4. WHEN the administrator performs destructive actions, THEN the system SHALL display confirmation modals before executing delete or deactivate operations
5. WHEN the dashboard renders on different screen sizes, THEN the system SHALL maintain usability and readability across mobile, tablet, and desktop viewports

### Requirement 10

**User Story:** As a platform user, I want the admin dashboard to be completely isolated from user-facing features, so that my experience is not affected by admin functionality.

#### Acceptance Criteria

1. WHEN regular users navigate the application, THEN the system SHALL NOT display any admin navigation links or UI elements
2. WHEN the admin dashboard is deployed, THEN the system SHALL NOT modify or break existing user authentication, campaign creation, or payment flows
3. WHEN admin routes are added, THEN the system SHALL NOT interfere with existing routing for user pages, campaign pages, or dashboard pages
4. WHEN admin API routes are created, THEN the system SHALL NOT conflict with existing API endpoints for payments, analytics, or image proxy
5. WHEN the system checks admin privileges, THEN the system SHALL NOT impact performance or response times for regular user operations
