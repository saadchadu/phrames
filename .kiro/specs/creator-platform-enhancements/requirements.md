# Requirements Document

## Introduction

This feature expands Phrames into a creator-centered platform by implementing three core capabilities: QR code generation for campaigns, public creator profiles, and an advanced analytics dashboard. These enhancements will enable creators to share their campaigns more effectively, establish a public presence, and gain insights into their campaign performance through data visualization and metrics.

## Glossary

- **Phrames Platform**: The Next.js + Firebase + Tailwind web application hosted at https://phrames.cleffon.com
- **Campaign**: A user-created frame campaign with a unique slug identifier
- **Creator**: A registered user who creates and manages campaigns on the Phrames Platform
- **QR Code**: A machine-readable code that encodes the campaign URL for easy sharing
- **Public Profile**: A publicly accessible page displaying a creator's information and campaigns
- **Analytics Dashboard**: A data visualization interface showing campaign performance metrics
- **Conversion Rate**: The percentage calculated as (downloads ÷ visits × 100)
- **Campaign Stats**: Daily aggregated data including visits and downloads per campaign
- **Firestore**: The Firebase NoSQL database used by the Phrames Platform
- **Username**: A unique identifier for each creator used in public profile URLs

## Requirements

### Requirement 1: QR Code Generation for Campaigns

**User Story:** As a creator, I want to generate and download QR codes for my campaigns, so that I can share them on physical promotional materials and enable easy access to my campaign pages.

#### Acceptance Criteria

1. WHEN a creator views their campaign in the dashboard at /dashboard/campaigns/[id], THE Phrames Platform SHALL display a "Download QR Code" button
2. WHEN a creator views their public campaign page at /campaign/[slug], THE Phrames Platform SHALL display a "Download QR Code" button visible only to the campaign owner
3. WHEN a creator clicks the "Download QR Code" button, THE Phrames Platform SHALL generate a QR code that encodes the URL https://phrames.cleffon.com/campaign/[slug]
4. WHEN a creator clicks the download button, THE Phrames Platform SHALL save the QR code as a PNG file named [slug]-qr.png to the user's device
5. THE Phrames Platform SHALL render the QR code with a size of 180x180 pixels, white background color (#ffffff), and black foreground color (#000000)

### Requirement 2: Public Creator Profile Pages

**User Story:** As a creator, I want a public profile page that showcases my identity and campaigns, so that I can build my brand and allow others to discover all my work in one place.

#### Acceptance Criteria

1. THE Phrames Platform SHALL create a public profile page accessible at /user/[username] for each creator
2. WHEN a visitor accesses a creator profile page, THE Phrames Platform SHALL display the creator's display name, username, avatar image, and join date
3. WHEN a visitor accesses a creator profile page, THE Phrames Platform SHALL display aggregated statistics including total campaigns and total downloads
4. WHEN a visitor accesses a creator profile page, THE Phrames Platform SHALL display a responsive grid of all public campaigns with thumbnails and download counts
5. WHEN a visitor clicks on a campaign thumbnail, THE Phrames Platform SHALL navigate to the campaign detail page at /campaign/[slug]
6. THE Phrames Platform SHALL enforce username uniqueness across all user accounts
7. THE Phrames Platform SHALL render the profile page with responsive design supporting mobile, tablet, and desktop viewports

### Requirement 3: User Data Model Enhancement

**User Story:** As a platform administrator, I want user documents to store profile information and usernames, so that the system can support public profiles and unique creator identities.

#### Acceptance Criteria

1. THE Phrames Platform SHALL store user documents in Firestore collection /users/{userId} with fields: username, displayName, bio, avatarURL, totalDownloads, totalVisits, and joinedAt
2. WHEN a new user registers, THE Phrames Platform SHALL validate that the chosen username is unique before creating the account
3. WHEN querying for a creator profile, THE Phrames Platform SHALL retrieve the user document by username field
4. THE Phrames Platform SHALL calculate totalDownloads by aggregating downloads across all campaigns owned by the user
5. THE Phrames Platform SHALL calculate totalVisits by aggregating visits across all campaigns owned by the user

### Requirement 4: Analytics Dashboard Enhancement

**User Story:** As a creator, I want to view comprehensive analytics about my campaign performance, so that I can understand my audience engagement and optimize my content strategy.

#### Acceptance Criteria

1. WHEN a creator accesses /dashboard, THE Phrames Platform SHALL display total visits aggregated across all their campaigns
2. WHEN a creator accesses /dashboard, THE Phrames Platform SHALL display total downloads aggregated across all their campaigns
3. WHEN a creator accesses /dashboard, THE Phrames Platform SHALL display the conversion rate calculated as (total downloads ÷ total visits × 100)
4. WHEN a creator accesses /dashboard, THE Phrames Platform SHALL display a line chart showing daily visits and downloads for the past 30 days
5. THE Phrames Platform SHALL render the analytics chart with responsive design that adapts to mobile, tablet, and desktop viewports
6. THE Phrames Platform SHALL display the chart with two lines: one for visits (color #8884d8) and one for downloads (color #10b981)
7. THE Phrames Platform SHALL present summary statistics in three separate cards showing total visits, total downloads, and conversion rate percentage

### Requirement 5: Campaign Statistics Data Model

**User Story:** As a platform administrator, I want daily campaign statistics stored in Firestore, so that the system can generate historical analytics and performance trends.

#### Acceptance Criteria

1. THE Phrames Platform SHALL store daily statistics in Firestore collection CampaignStatsDaily with fields: campaignId, date (YYYY-MM-DD format), visits, and downloads
2. WHEN calculating creator-wide analytics, THE Phrames Platform SHALL query all campaigns owned by the creator and aggregate their CampaignStatsDaily records
3. WHEN generating the analytics chart, THE Phrames Platform SHALL retrieve CampaignStatsDaily records for the past 30 days
4. THE Phrames Platform SHALL calculate daily totals by summing visits and downloads across all creator campaigns for each date

### Requirement 6: QR Code Display Interface

**User Story:** As a creator, I want to see the QR code before downloading it, so that I can verify it looks correct and decide whether to download it.

#### Acceptance Criteria

1. WHEN a creator clicks "Download QR Code", THE Phrames Platform SHALL display the QR code inline within a modal or card component
2. THE Phrames Platform SHALL render the QR code display interface with a centered layout and vertical spacing between elements
3. WHEN the QR code is displayed, THE Phrames Platform SHALL provide a download button styled with green background (#10b981), white text, and rounded corners
4. THE Phrames Platform SHALL generate the QR code client-side without storing it in Firestore

### Requirement 7: Profile Page SEO Optimization

**User Story:** As a creator, I want my public profile to be discoverable through search engines, so that I can attract organic traffic and grow my audience.

#### Acceptance Criteria

1. THE Phrames Platform SHALL render creator profile pages with server-side rendering for search engine indexability
2. WHEN a search engine crawls a profile page, THE Phrames Platform SHALL provide HTML meta tags including title, description, and Open Graph tags
3. THE Phrames Platform SHALL include the creator's display name and username in the page title
4. THE Phrames Platform SHALL generate a meta description summarizing the creator's campaign count and total downloads

### Requirement 8: Analytics Performance Optimization

**User Story:** As a creator, I want analytics to load quickly without impacting dashboard performance, so that I can access my data efficiently.

#### Acceptance Criteria

1. THE Phrames Platform SHALL calculate analytics aggregations server-side using API routes or Firebase functions
2. WHEN analytics data is requested, THE Phrames Platform SHALL cache results to reduce database queries
3. THE Phrames Platform SHALL implement data fetching with SWR or Firestore snapshot listeners for real-time updates
4. WHEN the dashboard loads, THE Phrames Platform SHALL display loading states while fetching analytics data
