x₹# Implementation Plan

- [x] 1. Set up admin authentication infrastructure
- [x] 1.1 Create admin authentication utility module
  - Implement `lib/admin-auth.ts` with `verifyAdminAccess()`, `requireAdmin()`, and `setAdminClaim()` functions
  - Add environment variable `ADMIN_UID` to `.env.local` and `.env.example`
  - Implement server-side admin verification using Firebase Auth and Firestore
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 1.2 Write property test for admin authentication
  - **Property 2: Admin API authentication**
  - **Validates: Requirements 1.4, 8.1**

- [x] 1.3 Update Firestore security rules for admin collections
  - Add rules for `/logs` collection requiring `isAdmin` custom claim
  - Add rules for `/settings` collection requiring `isAdmin` for writes
  - Deploy updated rules to Firebase
  - _Requirements: 8.2, 8.4_

- [x] 1.4 Write property test for Firestore security rules
  - **Property 14: Firestore security rules enforcement**
  - **Validates: Requirements 8.2, 8.4**

- [x] 1.5 Create custom claims setup script
  - Implement script to set `isAdmin` custom claim on Firebase Auth tokens
  - Add function to sync Firestore `isAdmin` field with custom claims
  - _Requirements: 8.3_

- [x] 1.6 Write property test for custom claims synchronization
  - **Property 15: Custom claims synchronization**
  - **Validates: Requirements 8.3**

- [x] 2. Create admin logging and settings infrastructure
- [x] 2.1 Implement admin logging service
  - Create `lib/admin-logging.ts` with `LogEventType` enum and `createLog()` function
  - Implement `getLogs()` with filtering support
  - Create Firestore indexes for logs collection
  - _Requirements: 6.2, 6.3, 6.5_

- [x] 2.2 Write property test for logging completeness
  - **Property 10: Logging completeness**
  - **Validates: Requirements 6.2, 6.3, 6.5**

- [x] 2.3 Implement settings service
  - Create `lib/admin-settings.ts` with `SystemSettings` and `PlanPricing` interfaces
  - Implement `getSystemSettings()`, `updateSystemSettings()`, `getPlanPricing()`, `updatePlanPricing()`
  - Initialize default settings in Firestore `/settings/system` and `/settings/plans`
  - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [x] 2.4 Write property test for settings persistence
  - **Property 11: Settings persistence**
  - **Validates: Requirements 7.2, 7.3**

- [x] 2.5 Write property test for feature toggle enforcement
  - **Property 12: Feature toggle enforcement**
  - **Validates: Requirements 7.6**

- [x] 3. Create admin layout and navigation
- [x] 3.1 Implement admin layout component
  - Create `app/admin/layout.tsx` as Server Component with admin verification
  - Implement responsive sidebar navigation with menu items
  - Add collapsible sidebar for mobile devices
  - Style with TailwindCSS matching Phrames design system
  - _Requirements: 1.1, 1.2, 9.1, 9.2_

- [x] 3.2 Write property test for admin route access control
  - **Property 1: Admin route access control**
  - **Validates: Requirements 1.1, 1.2**

- [x] 3.3 Create shared admin UI components
  - Create `components/admin/StatsCard.tsx` for metric display
  - Create `components/admin/ConfirmationModal.tsx` for destructive actions
  - Create `components/admin/DataTable.tsx` for reusable tables
  - Create `components/admin/FilterBar.tsx` for search and filtering
  - _Requirements: 9.2, 9.4_

- [x] 4. Implement admin API routes
- [x] 4.1 Create admin statistics API route
  - Implement `/api/admin/stats/route.ts` with GET handler
  - Calculate user counts, campaign counts, revenue metrics
  - Generate time-series data for charts (30 days)
  - Calculate plan distribution
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 4.2 Write property test for statistical aggregation
  - **Property 3: Statistical aggregation accuracy**
  - **Validates: Requirements 2.2, 2.3, 2.7**

- [x] 4.3 Create admin campaigns API route
  - Implement `/api/admin/campaigns/route.ts` with GET, PATCH, DELETE handlers
  - Add search and filtering logic
  - Implement campaign state modifications (extend, activate, deactivate)
  - Add logging for all admin actions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4.4 Write property test for campaign filtering
  - **Property 4: Campaign filtering correctness**
  - **Validates: Requirements 3.2, 3.3**

- [x] 4.5 Write property test for campaign state modification
  - **Property 5: Campaign state modification**
  - **Validates: Requirements 3.4, 3.5, 3.6, 3.7**

- [x] 4.6 Create admin users API route
  - Implement `/api/admin/users/route.ts` with GET, PATCH, DELETE handlers
  - Add user filtering logic
  - Implement user management operations (set admin, reset free campaign, block)
  - Add logging for all admin actions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 4.7 Write property test for user management operations
  - **Property 6: User management operations**
  - **Validates: Requirements 4.3, 4.4, 4.5, 4.7**

- [x] 4.8 Write property test for blocked user prevention
  - **Property 7: Blocked user campaign prevention**
  - **Validates: Requirements 4.5, 4.6**

- [x] 4.9 Create admin payments API route
  - Implement `/api/admin/payments/route.ts` with GET handler
  - Add payment filtering logic
  - Calculate payment analytics (revenue by plan, daily trends)
  - Return webhook data for display
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4.10 Write property test for payment analytics
  - **Property 8: Payment data analytics**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 4.11 Create admin logs API route
  - Implement `/api/admin/logs/route.ts` with GET handler
  - Add log filtering by event type and date
  - Return paginated log entries with metadata
  - _Requirements: 6.1, 6.4_

- [x] 4.12 Create admin settings API route
  - Implement `/api/admin/settings/route.ts` with GET and PATCH handlers
  - Validate setting and pricing updates
  - Add logging for settings changes
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 4.13 Create admin actions API route
  - Implement `/api/admin/actions/route.ts` with POST handler
  - Add action handlers: `triggerExpiryCron`, `exportPayments`, `exportCampaigns`
  - Implement CSV generation with streaming for large datasets
  - Add logging for manual actions
  - _Requirements: 7.4, 7.5_

- [x] 4.14 Write property test for CSV export completeness
  - **Property 13: CSV export completeness**
  - **Validates: Requirements 7.5**

- [x] 5. Build admin overview dashboard page
- [x] 5.1 Create overview page with statistics
  - Implement `app/admin/page.tsx` as Server Component
  - Fetch statistics from `/api/admin/stats`
  - Display stats cards for users, campaigns, revenue
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5.2 Add analytics charts to overview
  - Create `components/admin/RevenueChart.tsx` using Recharts
  - Create `components/admin/UserGrowthChart.tsx` using Recharts
  - Create `components/admin/CampaignTrendsChart.tsx` using Recharts
  - Create `components/admin/PlanDistributionChart.tsx` using Recharts
  - Make all charts responsive
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 9.3_

- [x] 5.3 Add recent activity sections
  - Create `components/admin/RecentCampaigns.tsx` table
  - Create `components/admin/RecentPayments.tsx` table
  - Create `components/admin/RecentSignups.tsx` table
  - _Requirements: 2.8_

- [x] 6. Build admin campaigns management page
- [x] 6.1 Create campaigns page with table
  - Implement `app/admin/campaigns/page.tsx` as Server Component
  - Fetch campaigns from `/api/admin/campaigns`
  - Display data table with all required columns
  - Implement pagination
  - _Requirements: 3.1_

- [x] 6.2 Add campaign search and filtering
  - Create `components/admin/CampaignFilters.tsx` as Client Component
  - Implement search by name, ID, user ID
  - Add filter dropdowns for status, payment type, date range
  - Update URL params for shareable filtered views
  - _Requirements: 3.2, 3.3_

- [x] 6.3 Add campaign management actions
  - Create `components/admin/CampaignActions.tsx` as Client Component
  - Implement extend expiry modal with date picker
  - Add activate/deactivate buttons with confirmation
  - Add delete button with confirmation modal
  - Add view links to campaign and user pages
  - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 9.4_

- [x] 7. Build admin users management page
- [x] 7.1 Create users page with table
  - Implement `app/admin/users/page.tsx` as Server Component
  - Fetch users from `/api/admin/users`
  - Display data table with all required columns
  - Implement pagination
  - _Requirements: 4.1_

- [x] 7.2 Add user filtering
  - Create `components/admin/UserFilters.tsx` as Client Component
  - Add filters for freeCampaignUsed, campaign count, blocked status
  - Update URL params for shareable filtered views
  - _Requirements: 4.2_

- [x] 7.3 Add user management actions
  - Create `components/admin/UserActions.tsx` as Client Component
  - Add set admin toggle with confirmation
  - Add reset free campaign button with confirmation
  - Add block/unblock button with confirmation
  - Add delete button with confirmation modal
  - Add view user campaigns link
  - _Requirements: 4.3, 4.4, 4.5, 4.7, 4.8, 9.4_

- [x] 7.4 Update campaign creation to check blocked status
  - Modify campaign creation API to check `isBlocked` field
  - Return error if user is blocked
  - Add error handling in campaign creation UI
  - _Requirements: 4.6_

- [x] 8. Build admin payments analytics page
- [x] 8.1 Create payments page with table
  - Implement `app/admin/payments/page.tsx` as Server Component
  - Fetch payments from `/api/admin/payments`
  - Display data table with all required columns
  - Add expandable rows for webhook JSON
  - Implement pagination
  - _Requirements: 5.1_

- [x] 8.2 Add payment filtering
  - Create `components/admin/PaymentFilters.tsx` as Client Component
  - Add filters for status, time range, plan type
  - Update URL params for shareable filtered views
  - _Requirements: 5.2_

- [x] 8.3 Add payment analytics charts
  - Create `components/admin/RevenueByPlanChart.tsx` pie chart using Recharts
  - Create `components/admin/RevenueTrendChart.tsx` line chart using Recharts
  - Make charts responsive
  - _Requirements: 5.3, 5.4, 9.3_

- [x] 8.4 Update webhook handler to store complete payload
  - Modify `app/api/payments/webhook/route.ts` to store full webhook data
  - Ensure `webhookData` field is populated in payment documents
  - _Requirements: 5.5_

- [x] 8.5 Write property test for webhook data persistence
  - **Property 9: Webhook data persistence**
  - **Validates: Requirements 5.5**

- [x] 9. Build admin logs page
- [x] 9.1 Create logs page with table
  - Implement `app/admin/logs/page.tsx` as Server Component
  - Fetch logs from `/api/admin/logs`
  - Display data table with all required columns
  - Add expandable rows for metadata JSON
  - Implement pagination
  - _Requirements: 6.1, 6.4_

- [x] 9.2 Add log filtering
  - Create `components/admin/LogFilters.tsx` as Client Component
  - Add filters for event type and date range
  - Add color coding for different event types
  - Update URL params for shareable filtered views
  - _Requirements: 6.1_

- [x] 9.3 Integrate logging into existing system processes
  - Update cron function to create log entries
  - Update webhook handler to log failures
  - Update campaign expiry logic to create logs
  - _Requirements: 6.2_

- [x] 10. Build admin settings page
- [x] 10.1 Create settings page with toggles
  - Implement `app/admin/settings/page.tsx` as Server Component
  - Fetch settings from `/api/admin/settings`
  - Display toggle switches for all system features
  - Display toggle switches for enabled plans
  - _Requirements: 7.1_

- [x] 10.2 Add plan pricing editor
  - Create `components/admin/PricingEditor.tsx` as Client Component
  - Add input fields for each plan price
  - Implement validation (positive numbers only)
  - Add save button with confirmation
  - _Requirements: 7.3_

- [x] 10.3 Add manual action buttons
  - Add button to trigger expiry cron function
  - Add button to export payments CSV
  - Add button to export campaigns CSV
  - Show loading states and success/error messages
  - _Requirements: 7.4, 7.5_

- [x] 10.4 Integrate feature toggles into user-facing features
  - Update campaign creation to check `newCampaignsEnabled`
  - Update signup to check `newSignupsEnabled`
  - Update free campaign logic to check `freeCampaignEnabled`
  - Update plan selection to check `enabledPlans`
  - _Requirements: 7.6_

- [x] 11. Ensure admin UI isolation from regular users
- [x] 11.1 Update navigation components
  - Modify `components/Navbar.tsx` to hide admin links for non-admins
  - Ensure admin routes are not discoverable in sitemap
  - Add robots meta tag to admin pages
  - _Requirements: 10.1_

- [x] 11.2 Write property test for non-admin UI isolation
  - **Property 16: Non-admin UI isolation**
  - **Validates: Requirements 10.1**

- [x] 12. Checkpoint - Verify existing functionality
  - Run all existing test suites
  - Manually test user authentication flow
  - Manually test campaign creation flow
  - Manually test payment flow
  - Ensure no regressions introduced
  - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 12.1 Write property test for existing functionality preservation
  - **Property 17: Existing functionality preservation**
  - **Validates: Requirements 10.2, 10.3, 10.4**

- [x] 13. Add responsive design and mobile optimization
- [x] 13.1 Implement mobile-responsive layouts
  - Make all admin tables horizontally scrollable on mobile
  - Ensure sidebar collapses on mobile with hamburger menu
  - Test all pages on mobile, tablet, and desktop viewports
  - Optimize chart rendering for small screens
  - _Requirements: 9.1, 9.5_

- [x] 13.2 Add loading states and error boundaries
  - Create `components/admin/LoadingState.tsx` component
  - Add error boundaries to all admin pages
  - Implement skeleton loaders for data tables
  - Add retry buttons for failed requests
  - _Requirements: Error Handling section_

- [x] 14. Create Firestore indexes and deploy security rules
- [x] 14.1 Create required Firestore indexes
  - Add composite index for logs: eventType + createdAt
  - Add composite index for logs: actorId + createdAt
  - Add composite index for campaigns: userId + createdAt
  - Add composite index for campaigns: status + expiresAt
  - Add composite index for payments: status + createdAt
  - Add composite index for payments: planType + createdAt
  - _Requirements: Performance Considerations section_

- [ ] 14.2 Deploy updated Firestore security rules
  - Test rules in Firebase emulator
  - Deploy rules to production
  - Verify rules block unauthorized access
  - _Requirements: 8.2, 8.4_

- [x] 15. Final testing and documentation
- [x] 15.1 Perform end-to-end admin workflow testing
  - Test complete workflow: login → view stats → modify campaign → verify logs
  - Test all CRUD operations on campaigns and users
  - Test all filtering and search functionality
  - Test CSV exports with large datasets
  - Test manual cron trigger
  - _Requirements: All requirements_

- [x] 15.2 Run all property-based tests
  - Execute all 17 property tests with 100+ iterations
  - Fix any failures discovered
  - Document any edge cases found
  - _Requirements: All requirements_

- [x] 15.3 Create admin dashboard documentation
  - Document admin setup process (setting ADMIN_UID)
  - Document how to grant admin access to additional users
  - Document all admin features and capabilities
  - Create troubleshooting guide for common issues
  - _Requirements: Deployment Considerations section_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
