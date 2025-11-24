# Requirements Document

## Introduction

This document defines the requirements for implementing a "first campaign free" activation system in the Phrames application. The system provides every user with one free lifetime campaign, while all additional campaigns require payment to become active. Paid campaigns automatically deactivate when their subscription expires. The system integrates with Cashfree payment gateway for processing transactions, includes five fixed-duration pricing plans, automatic expiry management via scheduled functions, and a complete reactivation flow for expired paid campaigns.

## Glossary

- **Phrames_System**: The Next.js application that manages photo frame campaigns
- **Campaign**: A user-created photo frame collection that can be shared publicly
- **Free_Campaign**: The first campaign created by a user, which is free and has no expiry
- **Paid_Campaign**: Any campaign after the first, which requires payment and has an expiry date
- **Creator**: A registered user who creates and manages campaigns
- **Payment_Gateway**: Cashfree payment processing service
- **Cloud_Function**: Firebase scheduled function that runs server-side tasks
- **Firestore**: Firebase NoSQL database storing campaign and payment data
- **Payment_Modal**: UI component displaying pricing plans and initiating checkout
- **Webhook**: Server endpoint receiving payment status notifications from Cashfree
- **Plan_Duration**: Number of days a campaign remains active after payment
- **Free_Campaign_Flag**: Boolean field in user document tracking if free campaign has been used

## Requirements

### Requirement 1: Pricing Plan Management

**User Story:** As a creator, I want to see clear pricing options with different durations, so that I can choose a plan that fits my campaign timeline and budget.

#### Acceptance Criteria

1. THE Phrames_System SHALL display five pricing plans with the following specifications: 1 Week (₹49, 7 days), 1 Month (₹199, 30 days), 3 Months (₹499, 90 days), 6 Months (₹999, 180 days), and 1 Year (₹1599, 365 days)
2. THE Phrames_System SHALL provide identical features across all pricing plans with only duration differences
3. THE Phrames_System SHALL store plan type, amount paid, and duration in Firestore when a payment is completed
4. THE Phrames_System SHALL calculate the expiration timestamp by adding the plan duration to the current timestamp
5. THE Phrames_System SHALL display pricing information in Indian Rupees (₹) format

### Requirement 2: Free Campaign Allocation

**User Story:** As a new creator, I want my first campaign to be free and never expire, so that I can try the platform without payment.

#### Acceptance Criteria

1. THE Phrames_System SHALL store a freeCampaignUsed field in each user document with default value false
2. WHEN a creator publishes their first campaign AND freeCampaignUsed equals false, THE Phrames_System SHALL activate the campaign immediately without payment
3. WHEN a Free_Campaign is activated, THE Phrames_System SHALL set isFreeCampaign to true, planType to "free", amountPaid to 0, expiresAt to null, isActive to true, and status to "Active"
4. WHEN a Free_Campaign is activated, THE Phrames_System SHALL update the user document by setting freeCampaignUsed to true
5. THE Phrames_System SHALL never deactivate campaigns where isFreeCampaign equals true

### Requirement 3: Paid Campaign Publication Flow

**User Story:** As a creator who has already used my free campaign, I want to pay for additional campaigns, so that I can create more content.

#### Acceptance Criteria

1. WHEN a creator clicks the Publish button AND freeCampaignUsed equals true, THE Phrames_System SHALL display the Payment_Modal with all available pricing plans
2. THE Phrames_System SHALL create paid campaigns with isActive set to false and isFreeCampaign set to false by default
3. WHEN a creator selects a pricing plan and clicks "Continue to Checkout", THE Phrames_System SHALL initiate a Cashfree payment session
4. WHEN the Payment_Gateway confirms successful payment, THE Phrames_System SHALL update the campaign with isActive set to true and expiresAt timestamp
5. IF payment fails or is cancelled, THEN THE Phrames_System SHALL display an error message and keep the campaign inactive

### Requirement 4: Campaign Data Model

**User Story:** As a system administrator, I want campaign documents to store complete payment and expiry information including free campaign status, so that the system can manage activation status accurately.

#### Acceptance Criteria

1. THE Phrames_System SHALL store the following fields in each campaign document: isFreeCampaign, planType, amountPaid, paymentId, expiresAt, isActive, and status
2. THE Phrames_System SHALL validate that planType contains one of: "free", "week", "month", "3month", "6month", or "year"
3. THE Phrames_System SHALL store amountPaid as a number representing the payment amount in rupees
4. THE Phrames_System SHALL store expiresAt as a Firebase Timestamp for paid campaigns or null for free campaigns
5. THE Phrames_System SHALL set status to "Active" when isActive is true and "Inactive" when isActive is false

### Requirement 5: User Data Model

**User Story:** As a system administrator, I want user documents to track free campaign usage, so that the system can enforce the one-free-campaign policy.

#### Acceptance Criteria

1. THE Phrames_System SHALL store a freeCampaignUsed field in each user document
2. THE Phrames_System SHALL set freeCampaignUsed to false by default when a new user is created
3. THE Phrames_System SHALL update freeCampaignUsed to true when the user activates their first free campaign
4. THE Phrames_System SHALL check freeCampaignUsed before determining whether to show the Payment_Modal
5. THE Phrames_System SHALL prevent users from modifying the freeCampaignUsed field directly

### Requirement 6: Cashfree Payment Integration

**User Story:** As a creator, I want to complete payments through a secure payment gateway, so that my transaction is processed safely and reliably.

#### Acceptance Criteria

1. THE Phrames_System SHALL integrate Cashfree Hosted Checkout Page for payment processing
2. WHEN a payment is initiated, THE Phrames_System SHALL create a server API endpoint at /api/payments/initiate that accepts userId, campaignId, and planType
3. THE Phrames_System SHALL return a Cashfree payment_link from the initiate endpoint
4. THE Phrames_System SHALL implement a webhook handler at /api/payments/webhook to receive payment status notifications
5. WHEN the webhook receives a successful payment notification, THE Phrames_System SHALL update the campaign with payment details and set isActive to true
6. THE Phrames_System SHALL validate webhook signatures to ensure requests originate from Cashfree
7. THE Phrames_System SHALL use environment variables CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, and CASHFREE_ENV for configuration

### Requirement 7: Automatic Paid Campaign Expiry

**User Story:** As a system administrator, I want paid campaigns to automatically deactivate when their subscription expires, so that only active paid campaigns remain live without manual intervention.

#### Acceptance Criteria

1. THE Phrames_System SHALL implement a Cloud_Function that executes daily
2. WHEN the Cloud_Function executes, THE Phrames_System SHALL query all campaigns where isActive equals true AND isFreeCampaign equals false AND expiresAt is less than the current timestamp
3. THE Phrames_System SHALL update each expired paid campaign by setting isActive to false and status to "Inactive"
4. THE Phrames_System SHALL never deactivate campaigns where isFreeCampaign equals true
5. THE Phrames_System SHALL log expiry actions to a Firestore collection for audit purposes
6. THE Phrames_System SHALL complete the expiry check within 5 minutes of the scheduled execution time

### Requirement 8: Paid Campaign Reactivation

**User Story:** As a creator, I want to renew my expired paid campaign by purchasing a new plan, so that my campaign can become active again.

#### Acceptance Criteria

1. WHEN a creator views an expired paid campaign in the dashboard, THE Phrames_System SHALL display a message indicating the campaign has expired
2. THE Phrames_System SHALL display a "Reactivate Campaign" button for expired paid campaigns
3. WHEN a creator clicks "Reactivate Campaign", THE Phrames_System SHALL display the Payment_Modal with all pricing plans
4. WHEN payment is successful, THE Phrames_System SHALL update isActive to true and set a new expiresAt timestamp based on the selected plan
5. THE Phrames_System SHALL never show a reactivation button for free campaigns
6. THE Phrames_System SHALL redirect the creator to the campaign dashboard with a success message after reactivation

### Requirement 9: Public Campaign Visibility

**User Story:** As a visitor, I want to only see active campaigns when accessing public campaign URLs, so that I don't encounter inactive or expired content.

#### Acceptance Criteria

1. WHEN a visitor accesses /campaign/[slug] for a Free_Campaign, THE Phrames_System SHALL verify that isActive equals true
2. WHEN a visitor accesses /campaign/[slug] for a Paid_Campaign, THE Phrames_System SHALL verify that isActive equals true AND expiresAt is greater than the current timestamp
3. IF the campaign is inactive or expired, THEN THE Phrames_System SHALL return a 404 status or display the message "This campaign is inactive or expired"
4. THE Phrames_System SHALL allow access to free campaigns regardless of expiresAt value
5. THE Phrames_System SHALL perform the visibility check on every campaign page request

### Requirement 10: Dashboard Campaign Management

**User Story:** As a creator, I want to see the activation status and expiry date of my campaigns in the dashboard, so that I can manage my active subscriptions effectively.

#### Acceptance Criteria

1. THE Phrames_System SHALL display a badge indicating "Active" or "Inactive" status on each campaign card in the dashboard
2. WHEN a Free_Campaign is active, THE Phrames_System SHALL display "Free - Lifetime Active" badge
3. WHEN a Paid_Campaign is active, THE Phrames_System SHALL display the expiry date in countdown format
4. WHEN a campaign is active, THE Phrames_System SHALL display "Edit" and "View Campaign" buttons
5. WHEN a paid campaign is inactive, THE Phrames_System SHALL display a "Reactivate Campaign" button
6. WHEN a creator clicks "Reactivate Campaign", THE Phrames_System SHALL display the Payment_Modal

### Requirement 11: Payment Security and Data Integrity

**User Story:** As a system administrator, I want payment-related fields and free campaign flags to be protected from unauthorized modification, so that the system maintains data integrity and prevents fraud.

#### Acceptance Criteria

1. THE Phrames_System SHALL restrict direct modification of isActive, expiresAt, planType, amountPaid, and isFreeCampaign fields by users
2. THE Phrames_System SHALL restrict direct modification of freeCampaignUsed field in user documents by users
3. THE Phrames_System SHALL allow only the Webhook handler, Cloud_Function, and server-side code to update payment-related fields
4. WHEN initiating a payment, THE Phrames_System SHALL validate that the requesting user owns the campaign
5. THE Phrames_System SHALL verify Cashfree webhook signatures before processing payment notifications
6. THE Phrames_System SHALL implement Firestore security rules that prevent client-side updates to payment fields and free campaign flags

### Requirement 12: Payment Modal User Interface

**User Story:** As a creator, I want an intuitive payment modal that works on all devices, so that I can easily select and purchase a plan from any device.

#### Acceptance Criteria

1. THE Phrames_System SHALL display the Payment_Modal as an overlay on the current page
2. THE Phrames_System SHALL list all five pricing plans with price, duration, and features clearly visible
3. THE Phrames_System SHALL highlight the selected plan when a creator clicks on it
4. THE Phrames_System SHALL display a "Continue to Checkout" button that becomes enabled when a plan is selected
5. THE Phrames_System SHALL render the Payment_Modal responsively for mobile, tablet, and desktop screen sizes

### Requirement 13: Payment Error Handling

**User Story:** As a creator, I want clear error messages when payment issues occur, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. IF the Payment_Gateway returns an error during payment initiation, THEN THE Phrames_System SHALL display a user-friendly error message
2. IF a payment is cancelled by the creator, THEN THE Phrames_System SHALL return the creator to the dashboard with a cancellation message
3. IF the Webhook receives a failed payment notification, THEN THE Phrames_System SHALL log the failure and keep the campaign inactive
4. THE Phrames_System SHALL handle duplicate webhook notifications by checking if the payment has already been processed
5. THE Phrames_System SHALL log all payment errors to Firestore for debugging and support purposes

### Requirement 14: Environment Configuration

**User Story:** As a developer, I want to configure payment gateway settings through environment variables, so that I can easily switch between sandbox and production environments.

#### Acceptance Criteria

1. THE Phrames_System SHALL read CASHFREE_CLIENT_ID from environment variables for API authentication
2. THE Phrames_System SHALL read CASHFREE_CLIENT_SECRET from environment variables for API authentication
3. THE Phrames_System SHALL read CASHFREE_ENV from environment variables to determine sandbox or production mode
4. THE Phrames_System SHALL validate that all required environment variables are present before processing payments
5. IF required environment variables are missing, THEN THE Phrames_System SHALL log an error and prevent payment processing