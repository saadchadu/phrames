# Implementation Plan

- [x] 1. Set up payment infrastructure and configuration
  - Create environment variable configuration for Cashfree (CLIENT_ID, CLIENT_SECRET, ENV)
  - Install cashfree-pg npm package
  - Create lib/cashfree.ts utility file with SDK initialization and helper functions
  - Add payment-related environment variables to .env.example
  - _Requirements: 4.7, 12.1, 12.2, 12.3_

- [x] 2. Update Firestore data models and security rules
- [x] 2.1 Extend Campaign and User interfaces with payment and free campaign fields
  - Add isFreeCampaign, isActive, status, planType, amountPaid, paymentId, expiresAt, lastPaymentAt fields to Campaign interface in lib/firestore.ts
  - Add freeCampaignUsed field to User interface in lib/firestore.ts
  - Update createCampaign function to handle both free and paid campaign creation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_

- [x] 2.2 Create PaymentRecord and ExpiryLog interfaces
  - Define PaymentRecord interface in lib/firestore.ts
  - Define ExpiryLog interface in lib/firestore.ts
  - Create helper functions for payment and log operations
  - _Requirements: 3.1, 5.4_

- [x] 2.3 Update Firestore security rules
  - Modify firestore.rules to prevent client-side updates to payment fields and isFreeCampaign
  - Add rules for users collection to prevent modification of freeCampaignUsed
  - Add rules for payments collection (read-only for users)
  - Add rules for expiryLogs collection (read-only for users)
  - Update campaign read rules to check isActive and handle free vs paid campaigns differently
  - _Requirements: 11.1, 11.2, 11.3, 11.6, 9.1, 9.2, 9.4, 9.5_

- [x] 3. Build Payment Modal component
- [x] 3.1 Create PaymentModal component structure
  - Create components/PaymentModal.tsx with modal overlay and container
  - Implement responsive grid layout for pricing plans
  - Add plan selection state management
  - Implement modal open/close functionality
  - _Requirements: 1.1, 1.5, 10.1, 10.2, 10.5_

- [x] 3.2 Implement pricing plan display and selection
  - Define PRICING_PLANS constant with all 5 plans
  - Create PricingPlanCard sub-component
  - Add visual selection indicator and "Popular" badge
  - Implement plan selection logic
  - _Requirements: 1.1, 1.2, 10.3_

- [x] 3.3 Add payment initiation logic
  - Implement "Continue to Checkout" button with loading state
  - Add API call to /api/payments/initiate
  - Handle payment link response and redirect to Cashfree
  - Implement error handling and display
  - _Requirements: 2.3, 2.5, 11.1_

- [x] 4. Create payment API routes
- [x] 4.1 Implement payment initiation endpoint
  - Create app/api/payments/initiate/route.ts
  - Add authentication verification
  - Validate campaign ownership
  - Verify campaign is not a free campaign (reject if isFreeCampaign === true)
  - Calculate amount based on planType
  - Create Cashfree order using SDK
  - Store payment record in Firestore
  - Return payment link
  - _Requirements: 6.2, 6.3, 11.4_

- [x] 4.2 Implement webhook handler endpoint
  - Create app/api/payments/webhook/route.ts
  - Implement Cashfree signature verification
  - Add idempotency check using paymentId
  - Extract and validate payment details from webhook payload
  - _Requirements: 6.4, 6.6, 11.5, 13.4_

- [x] 4.3 Add webhook payment processing logic for paid campaigns
  - Update campaign document with payment details on success
  - Set isFreeCampaign: false for paid campaigns
  - Calculate and set expiresAt based on planType
  - Set isActive: true and status: 'Active'
  - Update payment record status
  - Create audit log entry
  - Handle payment failure cases
  - _Requirements: 3.4, 6.5, 13.3_

- [x] 5. Update campaign creation flow with free campaign logic
- [x] 5.1 Implement free campaign eligibility check
  - Create function to check user's freeCampaignUsed status
  - Add logic to determine if user is eligible for free campaign
  - Update app/create/page.tsx to check eligibility after campaign creation
  - _Requirements: 2.1, 2.2, 5.4_

- [x] 5.2 Implement free campaign activation flow
  - When freeCampaignUsed === false, activate campaign immediately without payment
  - Set isFreeCampaign: true, planType: 'free', amountPaid: 0, isActive: true, status: 'Active', expiresAt: null
  - Update user document to set freeCampaignUsed: true
  - Show success message: "🎉 Your first campaign is FREE! Activated instantly."
  - Redirect to dashboard
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 5.3 Implement paid campaign flow
  - When freeCampaignUsed === true, set isActive: false, status: 'Inactive', isFreeCampaign: false
  - Open Payment Modal after campaign creation
  - Handle payment success callback to redirect to dashboard
  - Handle payment cancellation to show appropriate message
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Update dashboard with free and paid campaign status indicators
- [x] 6.1 Add status badge to CampaignCard component with free campaign support
  - Update components/CampaignCard.tsx to display Active/Inactive badge
  - Add "Free - Lifetime Active" badge for free campaigns (green)
  - Add color coding for status (green for Active, gray for Inactive)
  - Implement expiry countdown display for active paid campaigns only
  - Add conditional rendering based on isFreeCampaign, isActive and expiresAt
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 6.2 Implement reactivation button for paid campaigns only
  - Add "Reactivate Campaign" button for inactive paid campaigns only
  - Never show reactivation button for free campaigns
  - Add onReactivate prop to CampaignCard
  - Update app/dashboard/page.tsx to handle reactivation
  - Open Payment Modal when reactivation is triggered
  - Update campaign after successful reactivation payment
  - _Requirements: 8.2, 8.3, 8.4, 8.5, 10.5, 10.6_

- [x] 6.3 Add expiry message for expired paid campaigns
  - Create expired campaign message component
  - Display "This campaign has expired" message in dashboard for paid campaigns
  - Show "Reactivate Campaign" button with Payment Modal integration
  - Never show expiry message for free campaigns
  - _Requirements: 8.1, 8.6_

- [x] 7. Update public campaign page visibility logic with free campaign support
- [x] 7.1 Add activation and expiry checks for free and paid campaigns
  - Update app/campaign/[slug]/page.tsx to check isActive flag
  - For free campaigns: only check isActive (ignore expiresAt)
  - For paid campaigns: check isActive AND expiresAt > now
  - Implement combined visibility check that handles both campaign types
  - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 7.2 Create inactive campaign message component
  - Create InactiveCampaignMessage component
  - Display "This campaign is inactive or expired" message
  - Return 404 status or show message based on campaign state
  - Style component to match application design
  - _Requirements: 9.3_

- [x] 8. Implement Firebase Cloud Function for paid campaign auto-expiry
- [x] 8.1 Set up Firebase Functions project structure
  - Initialize Firebase Functions in the project (firebase init functions)
  - Install required dependencies (firebase-functions, firebase-admin)
  - Configure TypeScript for functions
  - Set up functions/src/index.ts entry point
  - _Requirements: 7.1_

- [x] 8.2 Create scheduled expiry check function for paid campaigns only
  - Implement scheduledCampaignExpiryCheck function with daily schedule
  - Query campaigns where isActive == true AND isFreeCampaign == false AND expiresAt < now
  - Never include free campaigns in expiry checks
  - Use batch operations for efficient updates
  - Update isActive to false and status to 'Inactive' for expired paid campaigns
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 8.3 Add expiry logging functionality
  - Create expiry log entries in expiryLogs collection
  - Include campaignId, userId, expiredAt, planType, processedAt, batchId
  - Log summary of processed paid campaigns
  - Implement error handling and retry logic
  - _Requirements: 7.5_

- [x] 9. Create utility functions and helpers
- [x] 9.1 Create payment calculation utilities
  - Create lib/payments.ts with plan price mapping (including 'free' plan)
  - Implement getPlanPrice function (return 0 for 'free' plan)
  - Implement calculateExpiryDate function (return null for 'free' plan)
  - Add plan validation function
  - _Requirements: 1.1, 1.4_

- [x] 9.2 Create date formatting utilities
  - Implement countdown timer calculation
  - Create formatExpiryDate function for display
  - Add timezone handling utilities
  - _Requirements: 8.2_

- [x] 9.3 Create webhook signature verification utility
  - Implement verifyCashfreeSignature function
  - Use crypto module for HMAC SHA256 verification
  - Add signature validation to webhook handler
  - _Requirements: 6.6, 11.5_

- [x] 10. Update environment configuration
- [x] 10.1 Add Cashfree environment variables
  - Add CASHFREE_CLIENT_ID to .env and Vercel
  - Add CASHFREE_CLIENT_SECRET to .env and Vercel
  - Add CASHFREE_ENV to .env and Vercel
  - Add NEXT_PUBLIC_APP_URL to .env and Vercel
  - _Requirements: 6.7, 14.1, 14.2, 14.3, 14.4_

- [x] 10.2 Validate environment variables on startup
  - Create environment validation function
  - Check all required Cashfree variables are present
  - Log error and prevent payment processing if variables missing
  - _Requirements: 14.4, 14.5_

- [x] 11. Implement error handling and user feedback
- [x] 11.1 Add payment error handling to Payment Modal
  - Display user-friendly error messages for payment failures
  - Handle network errors with retry logic
  - Show loading states during payment initiation
  - Implement timeout handling
  - _Requirements: 3.5, 13.1_

- [x] 11.2 Add error handling to API routes
  - Implement try-catch blocks in all API routes
  - Log errors with context for debugging
  - Return appropriate HTTP status codes
  - Sanitize error messages before sending to client
  - _Requirements: 13.1, 13.2_

- [x] 11.3 Add webhook error handling
  - Return 200 OK even on processing errors to prevent retries
  - Log all webhook processing errors
  - Implement dead letter queue for failed webhooks
  - Add alerting for critical webhook failures
  - _Requirements: 13.2_

- [-] 12. Testing and validation
- [x] 12.1 Test free campaign flow
  - Test first campaign activation without payment
  - Verify freeCampaignUsed flag is set correctly
  - Verify free campaign never expires
  - Test that second campaign requires payment
  - Verify free campaign shows "Free - Lifetime Active" badge
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 12.2 Test paid campaign flow with Cashfree sandbox
  - Test all 5 pricing plans for second+ campaigns
  - Verify payment initiation works correctly
  - Test successful payment completion
  - Verify campaign activation after payment
  - Test payment cancellation flow
  - _Requirements: 1.1, 3.1, 3.3, 3.4_

- [x] 12.3 Test webhook processing
  - Verify webhook signature validation
  - Test successful payment webhook
  - Test failed payment webhook
  - Test duplicate webhook handling (idempotency)
  - Verify campaign updates after webhook
  - _Requirements: 6.4, 6.5, 6.6, 13.4_

- [x] 12.4 Test expiry system with free campaign protection
  - Manually trigger Cloud Function
  - Verify only paid campaigns are checked for expiry
  - Verify free campaigns are never deactivated
  - Verify expired paid campaigns are deactivated correctly
  - Check expiry logs are created
  - Test with different timezones
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12.5 Test reactivation flow for paid campaigns
  - Create and let a paid campaign expire
  - Test reactivation button appears for paid campaigns only
  - Verify reactivation button never appears for free campaigns
  - Test payment modal opens for reactivation
  - Verify campaign reactivates after payment
  - Verify new expiry date is calculated correctly
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 12.6 Test public campaign visibility with free campaigns
  - Verify active free campaigns are always accessible
  - Verify active paid campaigns are accessible before expiry
  - Verify inactive campaigns show error message
  - Verify expired paid campaigns show error message
  - Test with different campaign states
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 12.7 Test mobile responsiveness
  - Test Payment Modal on mobile devices
  - Verify pricing plans display correctly on small screens
  - Test dashboard status badges on mobile
  - Verify free campaign badge displays correctly
  - Verify all buttons and interactions work on touch devices
  - _Requirements: 12.5_

- [x] 13. Deploy and monitor
- [x] 13.1 Deploy to Vercel
  - Add all environment variables to Vercel project settings
  - Deploy updated application code
  - Verify deployment successful
  - Test free campaign flow in production
  - Test paid campaign flow in production
  - _Requirements: 6.7, 14.1, 14.2, 14.3_

- [x] 13.2 Deploy Firebase Cloud Function
  - Deploy scheduledCampaignExpiryCheck function to Firebase
  - Verify function is scheduled correctly
  - Verify function filters out free campaigns
  - Monitor function execution logs
  - Test function runs at scheduled time
  - _Requirements: 7.1, 7.6_

- [x] 13.3 Set up monitoring and alerting
  - Configure logging for payment events
  - Configure logging for free campaign activations
  - Set up alerts for payment failures
  - Monitor webhook processing times
  - Track expiry function execution
  - Monitor error rates on payment APIs
  - Track free vs paid campaign ratio
  - _Requirements: 13.2, 13.3_

- [x] 14. Documentation and handoff
- [x] 14.1 Create payment system documentation
  - Document free campaign system ("first campaign free")
  - Document Cashfree integration setup
  - Document environment variable configuration
  - Create troubleshooting guide for common payment issues
  - Document webhook testing procedures
  - _Requirements: 2.1, 6.1, 6.7, 14.1, 14.2, 14.3_

- [x] 14.2 Create user guide
  - Document how first campaign is free and lifetime
  - Document how to create paid campaigns (second+ campaigns)
  - Explain pricing plans and features
  - Document reactivation process for paid campaigns
  - Explain that free campaigns never expire or need reactivation
  - Create FAQ for common user questions
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 8.1_
