# Design Document

## Overview

This design document outlines the technical architecture for three major creator-centric features: QR code generation for campaigns, public creator profiles, and an advanced analytics dashboard. The implementation will extend the existing Next.js + Firebase + Tailwind architecture while maintaining consistency with current patterns and user experience.

The features are designed to work cohesively:
- QR codes enable offline-to-online campaign sharing
- Public profiles establish creator identity and discoverability
- Analytics provide data-driven insights for optimization

## Architecture

### System Context

The Phrames platform currently consists of:
- **Frontend**: Next.js 14 with App Router, React Server Components, and client components
- **Styling**: TailwindCSS with custom design system (primary color #002400, secondary color #f2fff2)
- **Database**: Firebase Firestore with collections: `campaigns`, `users`
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Storage**: Firebase Storage for campaign frame images
- **Hosting**: Vercel deployment

### New Components

1. **QR Code System**
   - Client-side QR generation using `qrcode.react`
   - No server-side storage required
   - Integrated into existing campaign pages

2. **Public Profile System**
   - New dynamic route: `/app/user/[username]/page.tsx`
   - Username-based user lookup
   - Aggregated campaign statistics

3. **Analytics System**
   - New Firestore collection: `CampaignStatsDaily`
   - Server-side aggregation via API routes
   - Client-side visualization with Recharts
   - Real-time updates with SWR or Firestore listeners

## Components and Interfaces

### 1. QR Code Generator Component

**Location**: `components/CampaignQRCode.tsx`

```typescript
interface CampaignQRCodeProps {
  slug: string
  campaignName: string
  size?: number
  showDownloadButton?: boolean
}
```

**Features**:
- Renders QR code using `QRCodeCanvas` from `qrcode.react`
- Encodes full campaign URL: `https://phrames.cleffon.com/campaign/[slug]`
- Provides download functionality via canvas-to-PNG conversion
- Responsive sizing (default 180px, configurable)
- Styled with Tailwind to match existing design system

**Integration Points**:
- Dashboard campaign edit page: `/app/dashboard/campaigns/[id]/edit/page.tsx`
- Public campaign page: `/app/campaign/[slug]/page.tsx` (owner only)
- Optional: Campaign card component for quick access

### 2. Public Creator Profile Page

**Location**: `/app/user/[username]/page.tsx`

```typescript
interface UserProfilePageProps {
  params: { username: string }
}

interface PublicUserProfile {
  uid: string
  username: string
  displayName: string
  bio?: string
  avatarURL?: string
  joinedAt: Timestamp
  totalCampaigns: number
  totalDownloads: number
  totalVisits: number
}
```

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Profile Header                     │
│  ┌────┐  Name (@username)          │
│  │ 📷 │  Bio                        │
│  └────┘  Joined: Date               │
│                                     │
│  Stats Bar                          │
│  [Campaigns] [Downloads] [Visits]   │
│                                     │
│  Campaign Grid                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │ │ 🖼️ │      │
│  └────┘ └────┘ └────┘ └────┘      │
└─────────────────────────────────────┘
```

**Data Fetching Strategy**:
- Server-side rendering for SEO optimization
- Query Firestore `/users` collection by `username` field
- Query `/campaigns` collection where `createdBy == userId` and `visibility == 'Public'`
- Aggregate statistics from campaign data

**SEO Optimization**:
- Dynamic metadata generation
- Open Graph tags for social sharing
- Structured data markup for search engines

### 3. Analytics Dashboard Enhancement

**Location**: `/app/dashboard/page.tsx` (enhanced)

**New Components**:
- `components/AnalyticsChart.tsx` - Line chart for daily metrics
- `components/AnalyticsSummary.tsx` - Summary stat cards
- `components/AnalyticsFilters.tsx` - Date range selector (optional)

```typescript
interface AnalyticsData {
  totalVisits: number
  totalDownloads: number
  conversionRate: number
  dailyStats: DailyStats[]
}

interface DailyStats {
  date: string // YYYY-MM-DD
  visits: number
  downloads: number
}
```

**Chart Specifications**:
- Library: Recharts
- Chart Type: Line chart with dual lines
- X-axis: Date (past 30 days)
- Y-axis: Count (visits/downloads)
- Colors: Visits (#8884d8), Downloads (#10b981)
- Responsive: Full width, height 280px
- Tooltip: Show date, visits, downloads on hover

**Summary Cards Layout**:
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Visits │ │   Downloads  │ │  Conversion  │
│   12,450     │ │    3,870     │ │     31%      │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 4. Analytics API Route

**Location**: `/app/api/analytics/route.ts`

```typescript
interface AnalyticsRequest {
  userId: string
  startDate?: string
  endDate?: string
}

interface AnalyticsResponse {
  success: boolean
  data?: AnalyticsData
  error?: string
}
```

**Functionality**:
- Authenticate user via Firebase Auth token
- Query all campaigns for the user
- Aggregate `CampaignStatsDaily` records
- Calculate totals and conversion rate
- Return formatted data for chart rendering
- Implement caching (5-minute TTL)

## Data Models

### Enhanced User Document

**Collection**: `users/{userId}`

```typescript
interface UserDocument {
  uid: string
  email: string
  username: string // NEW - unique identifier
  displayName: string
  bio?: string // NEW - optional bio text
  photoURL?: string
  avatarURL?: string // NEW - alias for photoURL
  totalDownloads: number // NEW - cached aggregate
  totalVisits: number // NEW - cached aggregate
  createdAt: Timestamp
  joinedAt: Timestamp // NEW - alias for createdAt
}
```

**Indexes Required**:
- `username` (ascending) - for profile lookup
- Unique constraint on `username` field

**Migration Strategy**:
1. Add `username` field to existing users (generate from email or displayName)
2. Validate uniqueness before allowing profile access
3. Provide username selection UI in dashboard settings
4. Initialize `totalDownloads` and `totalVisits` to 0

### Campaign Stats Daily Collection

**Collection**: `CampaignStatsDaily/{statId}`

```typescript
interface CampaignStatsDailyDocument {
  campaignId: string
  date: string // YYYY-MM-DD format
  visits: number
  downloads: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes Required**:
- Composite: `campaignId` (ascending) + `date` (descending)
- Single: `date` (descending) for global queries

**Data Collection Strategy**:
- Increment counters on campaign page view (visits)
- Increment counters on download action (downloads)
- Use Firestore transactions to prevent race conditions
- Daily aggregation via Cloud Function (optional future enhancement)

**Helper Functions** (in `lib/firestore.ts`):
```typescript
export const incrementCampaignVisit = async (campaignId: string): Promise<void>
export const incrementCampaignDownload = async (campaignId: string): Promise<void>
export const getCampaignStats = async (campaignId: string, days: number): Promise<DailyStats[]>
export const getUserAggregateStats = async (userId: string): Promise<{ visits: number, downloads: number }>
```

### Enhanced Campaign Document

**Collection**: `campaigns/{campaignId}`

No schema changes required, but we'll add helper fields for caching:

```typescript
interface Campaign {
  // ... existing fields
  totalVisits?: number // NEW - cached from CampaignStatsDaily
  totalDownloads?: number // NEW - cached from CampaignStatsDaily
  lastStatsUpdate?: Timestamp // NEW - cache invalidation timestamp
}
```

## Error Handling

### QR Code Generation
- **Error**: Canvas not supported
  - **Handling**: Show fallback message with manual link copy
- **Error**: Download fails
  - **Handling**: Provide alternative download method via right-click

### Public Profile
- **Error**: Username not found
  - **Handling**: Show 404 page with search suggestion
- **Error**: No public campaigns
  - **Handling**: Show empty state with creator info
- **Error**: Invalid username format
  - **Handling**: Redirect to homepage with error toast

### Analytics
- **Error**: No data available
  - **Handling**: Show empty state with "Start creating campaigns" CTA
- **Error**: API timeout
  - **Handling**: Show loading skeleton, retry with exponential backoff
- **Error**: Insufficient permissions
  - **Handling**: Redirect to login with return URL

### Username Validation
- **Error**: Username already taken
  - **Handling**: Show inline error, suggest alternatives
- **Error**: Invalid characters
  - **Handling**: Show validation message, allow only alphanumeric + hyphen/underscore
- **Error**: Too short/long
  - **Handling**: Enforce 3-30 character limit

## Testing Strategy

### Unit Tests
- QR code generation and download functionality
- Username validation logic
- Analytics calculation functions (conversion rate, aggregation)
- Date formatting utilities

### Integration Tests
- Profile page data fetching and rendering
- Analytics API route with mock Firestore data
- Campaign stats increment operations
- Username uniqueness enforcement

### E2E Tests (Manual)
- Complete flow: Create campaign → Generate QR → Scan QR → View campaign
- Profile discovery: Search user → View profile → Click campaign
- Analytics workflow: Create campaign → Generate visits → View dashboard → Verify metrics
- Username setup: New user → Choose username → Verify profile URL

### Performance Tests
- Analytics query performance with 1000+ campaigns
- Profile page load time with 100+ campaigns
- QR code generation speed
- Chart rendering performance on mobile devices

## Implementation Phases

### Phase 1: Data Model & Infrastructure (Foundation)
1. Update Firestore security rules for new collections
2. Create `CampaignStatsDaily` collection structure
3. Add username field to user documents
4. Implement username validation and uniqueness check
5. Create analytics helper functions in `lib/firestore.ts`

### Phase 2: QR Code Feature (Quick Win)
1. Install `qrcode.react` package
2. Create `CampaignQRCode` component
3. Integrate into dashboard edit page
4. Integrate into public campaign page (owner only)
5. Add download functionality
6. Test across devices

### Phase 3: Public Profiles (Core Feature)
1. Create `/app/user/[username]/page.tsx`
2. Implement username-based user lookup
3. Build profile header component
4. Build campaign grid component
5. Add SEO metadata generation
6. Create username selection UI in dashboard
7. Test profile discoverability

### Phase 4: Analytics Dashboard (Data Feature)
1. Install `recharts` package
2. Create analytics API route
3. Build `AnalyticsSummary` component
4. Build `AnalyticsChart` component
5. Integrate into dashboard page
6. Implement data caching strategy
7. Add loading and error states
8. Test with various data volumes

### Phase 5: Stats Collection (Background)
1. Add visit tracking to campaign page
2. Add download tracking to download action
3. Implement daily aggregation logic
4. Create background job for cache updates (optional)
5. Test counter accuracy

### Phase 6: Polish & Optimization
1. Add animations and transitions
2. Optimize mobile responsiveness
3. Implement data caching
4. Add analytics export feature (optional)
5. Performance optimization
6. Accessibility audit

## Security Considerations

### Username System
- Validate username format (alphanumeric, hyphen, underscore only)
- Enforce uniqueness at database level
- Prevent username squatting (reserved words list)
- Rate limit username changes

### Analytics Access
- Verify user owns campaigns before showing analytics
- Use Firebase Auth tokens for API authentication
- Implement row-level security in Firestore rules
- Sanitize all user inputs

### QR Code Generation
- Generate QR codes client-side only (no server storage)
- Validate campaign ownership before showing QR in dashboard
- Use HTTPS URLs only in QR codes

### Public Profile Privacy
- Only show public campaigns on profiles
- Respect campaign visibility settings
- Allow users to hide profile (optional future feature)
- No email or sensitive data exposure

## Performance Optimization

### Analytics Queries
- Index optimization for date range queries
- Implement pagination for large datasets
- Cache aggregated results (5-minute TTL)
- Use Firestore query limits

### Profile Page
- Server-side rendering for initial load
- Lazy load campaign images
- Implement infinite scroll for large campaign lists
- Cache user profile data

### QR Code
- Memoize QR code generation
- Use appropriate QR code error correction level (M)
- Optimize PNG export quality vs file size

### Chart Rendering
- Debounce chart updates during interactions
- Use React.memo for chart components
- Limit data points displayed (max 90 days)
- Implement virtual scrolling for large datasets

## Accessibility

### QR Code
- Provide alt text for QR code image
- Include text link alongside QR code
- Ensure download button is keyboard accessible
- Add ARIA labels for screen readers

### Profile Page
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for all images
- Keyboard navigation support

### Analytics Dashboard
- Chart data available in table format (optional)
- Color contrast compliance (WCAG AA)
- Screen reader announcements for data updates
- Keyboard shortcuts for date range selection

## Mobile Responsiveness

### QR Code Display
- Responsive sizing (120px mobile, 180px desktop)
- Touch-friendly download button
- Modal overlay for QR display on mobile

### Profile Page
- Responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- Touch-optimized campaign cards
- Collapsible stats section on mobile

### Analytics Dashboard
- Horizontal scroll for chart on mobile
- Stacked stat cards on mobile
- Simplified chart on small screens
- Touch gestures for chart interaction

## Future Enhancements

### QR Code
- Customizable QR code colors and logos
- QR code analytics (scan tracking)
- Bulk QR code generation for multiple campaigns

### Public Profiles
- Social media links
- Custom profile themes
- Follower system
- Profile verification badges

### Analytics
- Campaign comparison view
- Geographic analytics
- Referral source tracking
- Export to CSV/PDF
- Email reports
- Goal setting and alerts

### General
- Mobile app with QR scanner
- Campaign collaboration features
- Advanced search and filtering
- Campaign templates marketplace
