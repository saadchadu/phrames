# Implementation Plan

- [x] 1. Implement middleware admin route protection
  - Add admin route pattern matching for `/admin/*` and `/api/admin/*`
  - Implement token extraction from cookies and Authorization header
  - Add Firebase Admin SDK token verification
  - Return 401 for unauthenticated requests, 403 for non-admin requests
  - Add security headers to all responses
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 1.1 Write property test for middleware authentication check
  - **Property 13: Middleware authentication check**
  - **Validates: Requirements 5.1**

- [x] 1.2 Write property test for middleware authorization check
  - **Property 14: Middleware authorization check**
  - **Validates: Requirements 5.2**

- [x] 1.3 Write property test for unauthenticated admin route blocking
  - **Property 1: Unauthenticated admin route blocking**
  - **Validates: Requirements 1.1, 5.3**

- [x] 1.4 Write property test for non-admin user rejection
  - **Property 2: Non-admin user rejection**
  - **Validates: Requirements 1.2, 5.4**

- [x] 2. Secure admin layout with server-side verification
  - Update `app/admin/layout.tsx` to verify admin access
  - Redirect unauthenticated users to `/login?redirect=/admin`
  - Show unauthorized error page for authenticated non-admin users
  - Pass admin user info to client layout component
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2.1 Write property test for admin user access grant
  - **Property 3: Admin user access grant**
  - **Validates: Requirements 1.3**

- [x] 2.2 Write property test for per-request verification
  - **Property 5: Per-request verification**
  - **Validates: Requirements 1.5**

- [ ] 3. Enhance admin authentication library
  - Add `verifyAdminToken()` function with detailed error types
  - Add `checkUserIsAdmin()` function for client-side checks
  - Implement token caching to reduce Firebase Admin SDK calls
  - Add logging for admin verification attempts
  - _Requirements: 1.4, 6.3, 6.4_

- [ ] 3.1 Write property test for dual verification check
  - **Property 4: Dual verification check**
  - **Validates: Requirements 1.4**

- [ ] 3.2 Write property test for admin SDK token validation
  - **Property 15: Admin SDK token validation**
  - **Validates: Requirements 5.5**

- [ ] 4. Create admin status API endpoint and client hook
  - Create `/api/auth/admin-status` endpoint to check admin status
  - Implement `useAdminStatus()` hook in `lib/hooks/useAdminStatus.ts`
  - Add caching and refresh logic on auth state changes
  - Use hook to conditionally show/hide admin UI elements in Navbar
  - _Requirements: 1.3_

- [ ] 5. Implement error handling utilities
  - Create `lib/error-handling.ts` with error types and handlers
  - Implement `handleAPIError()` for consistent API error responses
  - Implement `logError()` to write errors to Firestore logs collection
  - Implement `displayError()` for client-side error display
  - Add `getErrorMessage()` to sanitize errors for users
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5.1 Write property test for API error structure
  - **Property 16: API error structure**
  - **Validates: Requirements 6.1**

- [ ] 5.2 Write property test for error logging
  - **Property 17: Error logging**
  - **Validates: Requirements 6.3**

- [ ] 5.3 Write property test for auth error specificity
  - **Property 18: Auth error specificity**
  - **Validates: Requirements 6.4**

- [ ] 5.4 Write property test for error display
  - **Property 12: Error display**
  - **Validates: Requirements 4.5, 6.2**

- [ ] 6. Add network retry logic
  - Create `lib/network.ts` with retry wrapper function
  - Implement exponential backoff for retries (max 3 attempts)
  - Add retry logic to all API calls in components
  - Display loading state during retries
  - _Requirements: 6.5_

- [ ] 6.1 Write property test for network retry logic
  - **Property 19: Network retry logic**
  - **Validates: Requirements 6.5**

- [ ] 7. Update all API routes with error handling
  - Wrap all API route handlers with try-catch blocks
  - Use `handleAPIError()` for consistent error responses
  - Add specific error codes for different error types
  - Log errors using `logError()` function
  - _Requirements: 6.1, 6.3_

- [ ] 8. Enhance admin setup script
  - Update `scripts/setup-admin-claims.ts` to support email lookup
  - Add `grant-admin-by-email` command to find user by email and set admin
  - Ensure script syncs both Firestore isAdmin and custom claims
  - Add verification step to confirm admin access granted
  - _Requirements: 2.1, 2.2_

- [ ] 8.1 Write property test for admin flag synchronization
  - **Property 6: Admin flag synchronization**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 8.2 Write property test for token refresh requirement
  - **Property 7: Token refresh requirement**
  - **Validates: Requirements 2.3**

- [x] 9. Create production cleanup script
  - Create `scripts/production-cleanup.ts` with cleanup logic
  - Implement file cleanup: remove root markdown files except README.md
  - Implement Firestore cleanup: remove test data from collections
  - Add dry-run mode to preview changes before applying
  - Generate cleanup report with files and data removed
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10. Create UI functionality audit script
  - Create `scripts/ui-audit.ts` to scan components
  - Check all buttons have onClick handlers or href attributes
  - Check all forms have validation logic
  - Check all links have valid href attributes
  - Generate audit report with issues found
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 10.1 Write property test for button functionality
  - **Property 8: Button functionality**
  - **Validates: Requirements 4.1**

- [ ] 10.2 Write property test for form validation
  - **Property 9: Form validation**
  - **Validates: Requirements 4.2**

- [ ] 10.3 Write property test for link navigation
  - **Property 10: Link navigation**
  - **Validates: Requirements 4.3**

- [ ] 11. Fix UI functionality issues
  - Run UI audit script to identify issues
  - Add missing onClick handlers to buttons
  - Add missing validation to forms
  - Fix broken links and navigation
  - Add loading states to async action buttons
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11.1 Write property test for loading state management
  - **Property 11: Loading state management**
  - **Validates: Requirements 4.4**

- [ ] 12. Create security verification script
  - Create `scripts/verify-production-security.ts` with security checks
  - Check Firestore rules are deployed and up-to-date
  - Verify all required environment variables are set
  - Test admin route protection with mock requests
  - Test non-admin users cannot access admin endpoints
  - Generate production readiness report
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 13. Run production cleanup
  - Execute production cleanup script in dry-run mode
  - Review cleanup report
  - Execute cleanup script to remove test data and files
  - Verify essential files and documentation preserved
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 14. Run security verification
  - Execute security verification script
  - Review security report
  - Fix any failing security checks
  - Re-run verification until all checks pass
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
