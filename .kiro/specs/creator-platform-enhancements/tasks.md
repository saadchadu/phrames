# Implementation Plan

- [x] 1. Set up data infrastructure and dependencies
  - Install required npm packages: `qrcode.react` and `recharts`
  - Create `CampaignStatsDaily` Firestore collection structure
  - Update Firestore security rules to allow read/write access to `CampaignStatsDaily` collection
  - Add composite indexes for `CampaignStatsDaily` queries (campaignId + date)
  - _Requirements: 5.1, 5.2_

- [x] 2. Enhance user data model with username support
  - Add `username`, `bio`, `avatarURL`, `totalDownloads`, `totalVisits`, and `joinedAt` fields to user documents
  - Create username validation utility function (alphanumeric, hyphen, underscore, 3-30 chars)
  - Implement username uniqueness check function in `lib/auth.ts`
  - Update `createUserProfile` function to generate initial username from email
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Create analytics helper functions
  - [x] 3.1 Implement campaign stats tracking functions
    - Create `incrementCampaignVisit` function to track page views
    - Create `incrementCampaignDownload` function to track downloads
    - Use Firestore transactions to prevent race conditions
    - Implement date-based document ID generation (campaignId-YYYY-MM-DD)
    - _Requirements: 5.1, 5.2_
  
  - [x] 3.2 Implement analytics aggregation functions
    - Create `getCampaignStats` function to fetch daily stats for a campaign
    - Create `getUserAggregateStats` function to calculate total visits/downloads for a user
    - Implement date range filtering (default 30 days)
    - Add conversion rate calculation utility
    - _Requirements: 4.1, 4.2, 4.3, 5.3, 5.4_

- [x] 4. Build QR code generator component
  - [x] 4.1 Create CampaignQRCode component
    - Create `components/CampaignQRCode.tsx` with QRCodeCanvas from `qrcode.react`
    - Accept props: slug, campaignName, size (default 180), showDownloadButton
    - Generate QR code encoding `https://phrames.cleffon.com/campaign/[slug]`
    - Style with Tailwind matching existing design system (white bg, black fg)
    - _Requirements: 1.3, 1.5, 6.1, 6.2_
  
  - [x] 4.2 Implement QR code download functionality
    - Add download button with green background (#10b981) and white text
    - Implement canvas-to-PNG conversion using `toDataURL`
    - Create download link with filename format: `[slug]-qr.png`
    - Add centered layout with vertical spacing
    - _Requirements: 1.4, 6.3, 6.4_
  
  - [x] 4.3 Integrate QR code into dashboard edit page
    - Import CampaignQRCode component into `/app/dashboard/campaigns/[id]/edit/page.tsx`
    - Add QR code section below campaign details
    - Display in card/modal with "Download QR Code" button
    - _Requirements: 1.1_
  
  - [x] 4.4 Integrate QR code into public campaign page
    - Import CampaignQRCode component into `/app/campaign/[slug]/page.tsx`
    - Show QR code only when viewer is campaign owner (check `campaign.createdBy === user?.uid`)
    - Add QR section in campaign details area
    - _Requirements: 1.2_

- [x] 5. Create public creator profile page
  - [x] 5.1 Build user profile page route
    - Create `/app/user/[username]/page.tsx` with dynamic route
    - Implement server-side data fetching for user by username
    - Query Firestore `/users` collection where `username == params.username`
    - Handle user not found case with 404 page
    - _Requirements: 2.1, 3.3_
  
  - [x] 5.2 Fetch and aggregate profile data
    - Query all public campaigns where `createdBy == userId` and `visibility == 'Public'`
    - Calculate total campaigns count
    - Aggregate total downloads from campaign stats
    - Aggregate total visits from campaign stats
    - Format join date for display
    - _Requirements: 2.3, 3.4, 3.5_
  
  - [x] 5.3 Build profile header component
    - Display avatar image (or fallback with initials)
    - Show display name and @username
    - Display bio text if available
    - Show formatted join date
    - Style with Tailwind responsive design
    - _Requirements: 2.2_
  
  - [x] 5.4 Build profile stats section
    - Create three stat cards: Total Campaigns, Total Downloads, Total Visits
    - Use responsive grid layout (stacked on mobile, row on desktop)
    - Style with white background, border, and shadow
    - _Requirements: 2.3_
  
  - [x] 5.5 Build campaign grid component
    - Create responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
    - Display campaign thumbnail, name, and download count
    - Make each card clickable linking to `/campaign/[slug]`
    - Add hover effects and transitions
    - Handle empty state when no public campaigns exist
    - _Requirements: 2.4, 2.5, 2.7_
  
  - [x] 5.6 Add SEO metadata generation
    - Implement dynamic metadata with title including creator name
    - Add meta description with campaign count and downloads
    - Include Open Graph tags for social sharing
    - Add canonical URL
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 6. Build analytics dashboard components
  - [x] 6.1 Create analytics summary component
    - Create `components/AnalyticsSummary.tsx` with three stat cards
    - Display Total Visits, Total Downloads, and Conversion Rate
    - Use responsive grid layout (stacked on mobile, 3 columns on desktop)
    - Style cards with white background, padding, rounded corners, and shadow
    - Format numbers with commas (e.g., 12,450)
    - Display conversion rate as percentage with one decimal place
    - _Requirements: 4.7_
  
  - [x] 6.2 Create analytics chart component
    - Create `components/AnalyticsChart.tsx` using Recharts
    - Implement LineChart with dual lines for visits and downloads
    - Configure X-axis with date labels (YYYY-MM-DD format)
    - Configure Y-axis with count values
    - Set line colors: visits (#8884d8), downloads (#10b981)
    - Add CartesianGrid, Tooltip, and responsive container
    - Set chart height to 280px
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [x] 6.3 Create analytics API route
    - Create `/app/api/analytics/route.ts` with GET handler
    - Authenticate user via Firebase Auth token from request headers
    - Accept query parameters: userId, startDate, endDate
    - Fetch all campaigns for the authenticated user
    - Aggregate CampaignStatsDaily records for date range
    - Calculate totals and conversion rate
    - Return JSON response with AnalyticsData structure
    - Implement error handling for auth failures and missing data
    - _Requirements: 8.1_
  
  - [x] 6.4 Integrate analytics into dashboard page
    - Update `/app/dashboard/page.tsx` to fetch analytics data
    - Add AnalyticsSummary component above campaign grid
    - Add AnalyticsChart component below summary
    - Implement loading states with skeleton UI
    - Add error handling with retry button
    - Use SWR for data fetching with 5-minute cache
    - _Requirements: 4.1, 4.2, 4.3, 8.2, 8.3_

- [x] 7. Implement campaign stats tracking
  - [x] 7.1 Add visit tracking to campaign page
    - Update `/app/campaign/[slug]/page.tsx` to call `incrementCampaignVisit`
    - Track visit on page load (useEffect)
    - Only track once per session (use sessionStorage)
    - Handle errors silently (don't block page load)
    - _Requirements: 5.1_
  
  - [x] 7.2 Add download tracking to download action
    - Update download handler in `/app/campaign/[slug]/page.tsx`
    - Call `incrementCampaignDownload` after successful download
    - Update campaign supportersCount in UI
    - Handle errors silently
    - _Requirements: 5.1_

- [x] 8. Add username selection UI
  - [x] 8.1 Create username settings component
    - Create `components/UsernameSettings.tsx` with input field
    - Add real-time validation feedback (check uniqueness on blur)
    - Show error messages for invalid format or taken username
    - Add save button with loading state
    - Display current username if already set
    - _Requirements: 3.2_
  
  - [x] 8.2 Integrate username settings into dashboard
    - Add username settings section to dashboard or create settings page
    - Show username setup prompt for users without username
    - Add link to profile page after username is set
    - _Requirements: 3.2_

- [x] 9. Update Firestore security rules
  - Update `firestore.rules` to allow authenticated users to read/write their own CampaignStatsDaily documents
  - Allow public read access to user profiles by username
  - Allow public read access to public campaigns
  - Enforce username uniqueness validation in rules
  - _Requirements: 3.2, 5.1_

- [x] 10. Mobile responsiveness and polish
  - [x] 10.1 Test and optimize QR code on mobile
    - Verify QR code displays correctly on mobile screens
    - Test download functionality on iOS and Android
    - Ensure touch-friendly button sizes
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 10.2 Test and optimize profile page on mobile
    - Verify responsive grid layout on various screen sizes
    - Test touch interactions on campaign cards
    - Ensure images load efficiently
    - Verify text readability and spacing
    - _Requirements: 2.7_
  
  - [x] 10.3 Test and optimize analytics dashboard on mobile
    - Verify chart renders correctly on small screens
    - Test horizontal scroll if needed
    - Ensure stat cards stack properly on mobile
    - Test touch interactions with chart
    - _Requirements: 4.5_

- [ ]* 11. Add loading and error states
  - Add loading spinners for profile page data fetching
  - Add skeleton UI for analytics dashboard loading
  - Implement error boundaries for component failures
  - Add retry mechanisms for failed API calls
  - Show user-friendly error messages
  - _Requirements: 8.4_

- [ ]* 12. Performance optimization
  - Implement image lazy loading on profile page
  - Add caching strategy for analytics data (SWR with 5-minute TTL)
  - Optimize Firestore queries with proper indexes
  - Memoize expensive calculations (conversion rate, aggregations)
  - Use React.memo for chart components
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 13. Accessibility improvements
  - Add ARIA labels to QR code download button
  - Ensure proper heading hierarchy on profile page
  - Add alt text for all profile and campaign images
  - Verify keyboard navigation works for all interactive elements
  - Test with screen reader
  - Ensure color contrast meets WCAG AA standards
  - _Requirements: 2.7, 4.5_
