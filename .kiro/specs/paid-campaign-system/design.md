# Design Document

## Overview

This document outlines the technical design for implementing a paid-only campaign activation system in the Phrames application. The system transforms the current free campaign model into a subscription-based model where creators must purchase time-limited plans to activate their campaigns. The design integrates Cashfree payment gateway, implements automatic expiry management through Firebase Cloud Functions, and provides a complete user experience from payment to reactivation.

### Key Design Principles

1. **Security First**: All payment-related fields are protected from client-side manipulation
2. **Automatic Management**: Campaign expiry is handled automatically without manual intervention
3. **User Experience**: Clear pricing, simple payment flow, and transparent status indicators
4. **Reliability**: Idempotent webhook handling and comprehensive error management
5. **Scalability**: Efficient queries and batch processing for expiry checks

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Create Page  │  │  Dashboard   │  │ Campaign Page│      │
│  │              │  │              │  │              │      │
│  │ Payment Modal│  │ Status Badge │  │ Visibility   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ /api/payments/   │  │ /api/payments/   │                │
│  │    initiate      │  │    webhook       │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cashfree Payment Gateway                   │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Create Order API │  │ Webhook Events   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  campaigns   │  │   payments   │  │     logs     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
            ▲
            │
┌───────────┴──────────────────────────────────────────────────┐
│              Firebase Cloud Functions                         │
│  ┌──────────────────────────────────────────┐                │
│  │  scheduledCampaignExpiryCheck()          │                │
│  │  Runs daily at 00:00 UTC                 │                │
│  └──────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Payment Initiation Flow
1. User completes campaign creation and clicks "Publish"
2. Payment Modal displays with 5 pricing plans
3. User selects plan and clicks "Continue to Checkout"
4. Client calls `/api/payments/initiate` with campaignId and planType
5. Server validates user ownership and creates Cashfree order
6. Server returns payment_link to client
7. Client redirects to Cashfree Hosted Checkout
8. User completes payment on Cashfree

#### Payment Completion Flow
1. Cashfree sends webhook to `/api/payments/webhook`
2. Server validates webhook signature
3. Server verifies payment status
4. Server updates campaign document with payment details
5. Server sets isActive = true and calculates expiresAt
6. Server creates payment record for audit
7. Cashfree redirects user back to application
8. Client displays success message and redirects to dashboard

#### Expiry Check Flow
1. Cloud Function triggers daily at 00:00 UTC
2. Function queries campaigns where isActive = true AND expiresAt < now
3. For each expired campaign:
   - Set isActive = false
   - Set status = "Inactive"
   - Create log entry
4. Function completes and logs summary

## Components and Interfaces

### 1. Payment Modal Component

**File**: `components/PaymentModal.tsx`

```typescript
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  onSuccess: () => void
}

interface PricingPlan {
  id: 'week' | 'month' | '3month' | '6month' | 'year'
  name: string
  price: number
  days: number
  popular?: boolean
}

const PRICING_PLANS: PricingPlan[] = [
  { id: 'week', name: '1 Week', price: 49, days: 7 },
  { id: 'month', name: '1 Month', price: 199, days: 30, popular: true },
  { id: '3month', name: '3 Months', price: 499, days: 90 },
  { id: '6month', name: '6 Months', price: 999, days: 180 },
  { id: 'year', name: '1 Year', price: 1599, days: 365 }
]
```

**Features**:
- Responsive grid layout for pricing plans
- Visual indication of selected plan
- "Popular" badge for recommended plan
- Loading state during payment initiation
- Error handling and display
- Mobile-optimized design

### 2. Campaign Creation Flow Update

**File**: `app/create/page.tsx`

**Changes**:
- Remove direct campaign activation
- Set `isActive: false` and `status: 'Inactive'` by default
- After successful campaign creation, open Payment Modal
- Only redirect to dashboard after payment success
- Handle payment cancellation gracefully

### 3. Dashboard Updates

**File**: `app/dashboard/page.tsx` and `components/CampaignCard.tsx`

**New Features**:
- Status badge (Active/Inactive) with color coding
- Expiry countdown display for active campaigns
- "Reactivate Campaign" button for inactive campaigns
- Conditional button rendering based on status
- Visual distinction between active and expired campaigns

**CampaignCard Enhancements**:
```typescript
interface CampaignCardProps {
  campaign: Campaign
  onEdit: (id: string) => void
  onShare: (slug: string) => void
  onDelete: (id: string) => void
  onReactivate: (id: string) => void // New
}

// Display logic
- If isActive && expiresAt > now: Show "Active" badge + expiry countdown
- If !isActive || expiresAt < now: Show "Inactive" badge + "Reactivate" button
```

### 4. Public Campaign Page Update

**File**: `app/campaign/[slug]/page.tsx`

**Changes**:
- Add activation and expiry check before rendering
- Return 404 or inactive message if campaign is not active
- Check both `isActive` flag and `expiresAt` timestamp

```typescript
// Visibility check
const isVisible = campaign.isActive && 
                  campaign.expiresAt && 
                  campaign.expiresAt.toDate() > new Date()

if (!isVisible) {
  return <InactiveCampaignMessage />
}
```

## Data Models

### Updated Campaign Model

**Collection**: `campaigns`

```typescript
interface Campaign {
  // Existing fields
  id?: string
  campaignName: string
  slug: string
  description?: string
  visibility: 'Public' | 'Unlisted'
  frameURL: string
  supportersCount: number
  createdBy: string
  createdByEmail?: string
  createdAt: Timestamp
  
  // New payment-related fields
  isActive: boolean              // Default: false
  status: 'Active' | 'Inactive'  // Default: 'Inactive'
  planType?: 'week' | 'month' | '3month' | '6month' | 'year'
  amountPaid?: number            // In rupees
  paymentId?: string             // Cashfree order ID
  expiresAt?: Timestamp          // Calculated from planType
  lastPaymentAt?: Timestamp      // For tracking payment history
}
```

### Payment Record Model

**Collection**: `payments`

```typescript
interface PaymentRecord {
  id?: string
  orderId: string                // Cashfree order ID
  campaignId: string
  userId: string
  planType: 'week' | 'month' | '3month' | '6month' | 'year'
  amount: number
  currency: string               // 'INR'
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  paymentMethod?: string
  cashfreeOrderId: string
  cashfreePaymentId?: string
  createdAt: Timestamp
  completedAt?: Timestamp
  metadata?: {
    campaignName: string
    userEmail: string
  }
}
```

### Expiry Log Model

**Collection**: `expiryLogs`

```typescript
interface ExpiryLog {
  id?: string
  campaignId: string
  campaignName: string
  userId: string
  expiredAt: Timestamp
  planType: string
  processedAt: Timestamp
  batchId: string                // For grouping daily runs
}
```

## API Routes

### 1. Payment Initiation Endpoint

**Route**: `/api/payments/initiate`

**Method**: POST

**Request Body**:
```typescript
{
  campaignId: string
  planType: 'week' | 'month' | '3month' | '6month' | 'year'
}
```

**Response**:
```typescript
{
  success: boolean
  paymentLink?: string
  orderId?: string
  error?: string
}
```

**Implementation Steps**:
1. Verify user authentication
2. Validate campaign ownership
3. Validate planType
4. Calculate amount based on planType
5. Create Cashfree order using SDK
6. Store payment record in Firestore
7. Return payment link

**Security**:
- Verify JWT token
- Check user owns the campaign
- Validate all inputs
- Use server-side environment variables

### 2. Payment Webhook Handler

**Route**: `/api/payments/webhook`

**Method**: POST

**Request Body**: Cashfree webhook payload

**Response**:
```typescript
{
  success: boolean
  message: string
}
```

**Implementation Steps**:
1. Verify Cashfree webhook signature
2. Extract payment details from payload
3. Check if payment already processed (idempotency)
4. If payment successful:
   - Update campaign: isActive = true, status = 'Active'
   - Set expiresAt based on planType
   - Store payment details
   - Update payment record
5. If payment failed:
   - Update payment record status
   - Log failure
6. Return 200 OK to acknowledge webhook

**Security**:
- Verify webhook signature using Cashfree secret
- Implement idempotency check
- Rate limiting
- IP whitelist (Cashfree IPs)

## Cashfree Integration

### SDK Setup

**Package**: `cashfree-pg`

**Installation**:
```bash
npm install cashfree-pg
```

**Configuration**:
```typescript
import { Cashfree } from 'cashfree-pg'

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID!
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET!
Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION' 
  ? Cashfree.Environment.PRODUCTION 
  : Cashfree.Environment.SANDBOX
```

### Order Creation

```typescript
const orderRequest = {
  order_amount: amount,
  order_currency: 'INR',
  order_id: `order_${Date.now()}_${campaignId}`,
  customer_details: {
    customer_id: userId,
    customer_email: userEmail,
    customer_phone: userPhone || '9999999999'
  },
  order_meta: {
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`
  },
  order_note: `Campaign: ${campaignName} - Plan: ${planType}`
}

const response = await Cashfree.PGCreateOrder('2023-08-01', orderRequest)
```

### Webhook Signature Verification

```typescript
import crypto from 'crypto'

function verifyCashfreeSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const signatureData = `${timestamp}${payload}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CASHFREE_CLIENT_SECRET!)
    .update(signatureData)
    .digest('base64')
  
  return expectedSignature === signature
}
```

## Firebase Cloud Functions

### Scheduled Expiry Check Function

**File**: `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const scheduledCampaignExpiryCheck = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    const db = admin.firestore()
    const now = admin.firestore.Timestamp.now()
    const batchId = `batch_${Date.now()}`
    
    try {
      // Query expired campaigns
      const expiredCampaigns = await db.collection('campaigns')
        .where('isActive', '==', true)
        .where('expiresAt', '<', now)
        .get()
      
      console.log(`Found ${expiredCampaigns.size} expired campaigns`)
      
      // Process in batches of 500 (Firestore limit)
      const batch = db.batch()
      let count = 0
      
      for (const doc of expiredCampaigns.docs) {
        const campaign = doc.data()
        
        // Update campaign
        batch.update(doc.ref, {
          isActive: false,
          status: 'Inactive'
        })
        
        // Create expiry log
        const logRef = db.collection('expiryLogs').doc()
        batch.set(logRef, {
          campaignId: doc.id,
          campaignName: campaign.campaignName,
          userId: campaign.createdBy,
          expiredAt: campaign.expiresAt,
          planType: campaign.planType,
          processedAt: now,
          batchId
        })
        
        count++
        
        // Commit batch every 500 operations
        if (count % 500 === 0) {
          await batch.commit()
        }
      }
      
      // Commit remaining operations
      if (count % 500 !== 0) {
        await batch.commit()
      }
      
      console.log(`Successfully processed ${count} expired campaigns`)
      return null
    } catch (error) {
      console.error('Error in expiry check:', error)
      throw error
    }
  })
```

### Deployment

```bash
# Initialize Firebase Functions
firebase init functions

# Deploy function
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

## Firestore Security Rules

### Updated Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Campaign rules
    match /campaigns/{campaignId} {
      // Anyone can read public active campaigns
      allow read: if resource.data.visibility == 'Public' && 
                     resource.data.isActive == true &&
                     resource.data.expiresAt > request.time;
      
      // Owner can read their own campaigns
      allow read: if request.auth != null && 
                     resource.data.createdBy == request.auth.uid;
      
      // Authenticated users can create campaigns (inactive by default)
      allow create: if request.auth != null &&
                       request.resource.data.createdBy == request.auth.uid &&
                       request.resource.data.isActive == false &&
                       request.resource.data.status == 'Inactive';
      
      // Owner can update non-payment fields
      allow update: if request.auth != null &&
                       resource.data.createdBy == request.auth.uid &&
                       // Prevent modification of payment fields
                       !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['isActive', 'expiresAt', 'planType', 
                                 'amountPaid', 'paymentId', 'lastPaymentAt']);
      
      // Owner can delete their campaigns
      allow delete: if request.auth != null &&
                       resource.data.createdBy == request.auth.uid;
    }
    
    // Payment records - read-only for users
    match /payments/{paymentId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Only server can write
    }
    
    // Expiry logs - read-only for users
    match /expiryLogs/{logId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Only server can write
    }
  }
}
```

## Error Handling

### Client-Side Error Handling

1. **Payment Initiation Errors**:
   - Network failures: Retry with exponential backoff
   - Validation errors: Display specific field errors
   - Server errors: Show generic error message with support contact

2. **Payment Completion Errors**:
   - Payment cancelled: Return to dashboard with info message
   - Payment failed: Show error and allow retry
   - Timeout: Check payment status via API

### Server-Side Error Handling

1. **API Route Errors**:
   - Log all errors with context
   - Return appropriate HTTP status codes
   - Sanitize error messages for client
   - Alert on critical failures

2. **Webhook Errors**:
   - Return 200 OK even on processing errors (to prevent retries)
   - Log failures for manual review
   - Implement dead letter queue for failed webhooks

3. **Cloud Function Errors**:
   - Retry failed operations
   - Log errors to Cloud Logging
   - Alert on repeated failures
   - Graceful degradation

## Testing Strategy

### Unit Tests

1. **Utility Functions**:
   - Plan price calculation
   - Expiry date calculation
   - Signature verification
   - Date formatting

2. **Component Tests**:
   - Payment Modal rendering
   - Plan selection logic
   - Status badge display
   - Countdown timer

### Integration Tests

1. **Payment Flow**:
   - Complete payment journey (sandbox)
   - Payment cancellation
   - Payment failure handling
   - Webhook processing

2. **Expiry Flow**:
   - Campaign expiry detection
   - Status update verification
   - Log creation

3. **Reactivation Flow**:
   - Expired campaign reactivation
   - New expiry calculation
   - Status update

### End-to-End Tests

1. **User Journeys**:
   - Create campaign → Pay → Activate
   - View active campaign publicly
   - Campaign expires → Becomes inactive
   - Reactivate expired campaign

2. **Edge Cases**:
   - Double webhook delivery
   - Concurrent payment attempts
   - Timezone edge cases
   - Network interruptions

### Manual Testing Checklist

1. **Payment Plans**:
   - [ ] All 5 plans display correctly
   - [ ] Prices match specifications
   - [ ] Plan selection works
   - [ ] Mobile layout is responsive

2. **Payment Flow**:
   - [ ] Cashfree checkout opens
   - [ ] Test card payment succeeds
   - [ ] Campaign activates after payment
   - [ ] Expiry date is correct
   - [ ] Payment cancellation works

3. **Dashboard**:
   - [ ] Active badge shows for paid campaigns
   - [ ] Inactive badge shows for unpaid campaigns
   - [ ] Expiry countdown displays correctly
   - [ ] Reactivate button appears for expired campaigns

4. **Public Access**:
   - [ ] Active campaigns are accessible
   - [ ] Inactive campaigns show error
   - [ ] Expired campaigns show error

5. **Expiry System**:
   - [ ] Cloud function runs on schedule
   - [ ] Expired campaigns deactivate
   - [ ] Logs are created

## Environment Variables

### Required Variables

```env
# Cashfree Configuration
CASHFREE_CLIENT_ID=your_client_id
CASHFREE_CLIENT_SECRET=your_client_secret
CASHFREE_ENV=SANDBOX # or PRODUCTION

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (for Cloud Functions)
FIREBASE_SERVICE_ACCOUNT_KEY=...
```

### Vercel Configuration

Add environment variables in Vercel dashboard:
1. Navigate to Project Settings → Environment Variables
2. Add all required variables
3. Set appropriate environment (Production/Preview/Development)
4. Redeploy application

## Performance Considerations

### Database Queries

1. **Expiry Check Optimization**:
   - Create composite index: `isActive` (ASC) + `expiresAt` (ASC)
   - Batch updates to reduce write operations
   - Limit query results if needed

2. **Campaign Listing**:
   - Existing indexes remain unchanged
   - Add `isActive` to existing queries for public campaigns

### Caching Strategy

1. **Pricing Plans**: Static data, can be cached indefinitely
2. **Campaign Status**: Cache with short TTL (1 minute)
3. **Payment Status**: No caching, always fetch fresh

### Webhook Processing

1. **Idempotency**: Check payment ID before processing
2. **Async Processing**: Process webhook quickly, return 200 OK
3. **Queue System**: Consider Cloud Tasks for complex processing

## Migration Strategy

### Phase 1: Database Schema Update

1. Add new fields to Campaign model
2. Set default values for existing campaigns:
   - `isActive: true` (grandfather existing campaigns)
   - `status: 'Active'`
   - `expiresAt: null` (no expiry for existing)

### Phase 2: Code Deployment

1. Deploy updated Firestore rules
2. Deploy API routes
3. Deploy updated UI components
4. Deploy Cloud Functions

### Phase 3: Testing

1. Test in sandbox environment
2. Verify all flows work correctly
3. Monitor error logs

### Phase 4: Production Rollout

1. Switch Cashfree to production mode
2. Monitor payment processing
3. Verify expiry function runs correctly

### Grandfather Clause

Existing campaigns created before the paid system:
- Set `isActive: true` and `expiresAt: null`
- Modify expiry check to skip campaigns with null `expiresAt`
- Allow these campaigns to remain active indefinitely
- Future updates require payment

## Security Checklist

- [ ] Webhook signature verification implemented
- [ ] Payment fields protected in Firestore rules
- [ ] User ownership validated before payment initiation
- [ ] Environment variables secured in Vercel
- [ ] API routes require authentication
- [ ] Idempotency checks prevent duplicate processing
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting on payment endpoints
- [ ] HTTPS enforced for all payment flows
- [ ] Cashfree credentials never exposed to client

## Monitoring and Logging

### Key Metrics

1. **Payment Metrics**:
   - Payment success rate
   - Payment failure reasons
   - Average payment completion time
   - Revenue by plan type

2. **Campaign Metrics**:
   - Active vs inactive campaigns
   - Expiry rate
   - Reactivation rate
   - Average campaign lifetime

3. **System Metrics**:
   - Webhook processing time
   - Expiry function execution time
   - API response times
   - Error rates

### Logging Strategy

1. **Payment Logs**: All payment attempts, successes, and failures
2. **Expiry Logs**: All campaigns deactivated by expiry function
3. **Error Logs**: All exceptions with stack traces
4. **Audit Logs**: All payment-related field updates

### Alerting

1. **Critical Alerts**:
   - Payment webhook failures
   - Expiry function failures
   - High error rates on payment APIs

2. **Warning Alerts**:
   - Unusual payment failure rates
   - Slow webhook processing
   - Large number of expiries

## Future Enhancements

1. **Email Notifications**:
   - Payment confirmation
   - Expiry warnings (7 days, 1 day before)
   - Expiry notification

2. **Analytics Dashboard**:
   - Revenue tracking
   - Plan popularity
   - Churn analysis

3. **Promotional Features**:
   - Discount codes
   - Referral bonuses
   - Bulk purchase discounts

4. **Payment Options**:
   - Multiple payment methods
   - International payments
   - Subscription auto-renewal

5. **Grace Period**:
   - 24-hour grace period after expiry
   - Soft expiry vs hard expiry

## Conclusion

This design provides a comprehensive, secure, and scalable solution for implementing a paid-only campaign system in the Phrames application. The architecture leverages existing Firebase infrastructure while integrating Cashfree for payment processing and implementing automatic expiry management through Cloud Functions. The design prioritizes security, user experience, and maintainability while providing clear paths for future enhancements.
