# Requirements Document

## Introduction

This feature adds a search capability to the landing page that allows visitors to discover and search through active public campaigns. Users will be able to search by campaign name or description, view search results in a grid layout, and navigate directly to campaign pages. The search feature will be prominently displayed on the landing page to encourage campaign discovery and engagement.

## Glossary

- **Landing Page**: The home page of the application (app/page.tsx) where visitors first arrive
- **Campaign**: A photo frame project created by users that can be shared publicly or kept unlisted
- **Public Campaign**: A campaign with visibility set to "Public" that should be discoverable by all users
- **Active Campaign**: A campaign with status set to "Active" that is currently available for use
- **Search System**: The collection of components and functions that enable campaign search functionality
- **Campaign Card**: A UI component that displays campaign information in a grid layout
- **Firestore**: The database system where campaign data is stored

## Requirements

### Requirement 1

**User Story:** As a visitor to the landing page, I want to see a search bar prominently displayed, so that I can easily discover public campaigns without needing to sign up.

#### Acceptance Criteria

1. WHEN the Landing Page loads, THE Search System SHALL display a search input field in a dedicated section between the hero section and the "How It Works" section
2. THE Search System SHALL display placeholder text "Search campaigns..." in the search input field
3. THE Search System SHALL display a search icon within the search input field
4. THE Search System SHALL apply responsive styling to the search section that adapts to mobile, tablet, and desktop screen sizes
5. THE Search System SHALL maintain consistent visual design with the existing landing page color scheme and typography

### Requirement 2

**User Story:** As a visitor, I want to search for campaigns by typing keywords, so that I can find campaigns that match my interests.

#### Acceptance Criteria

1. WHEN a visitor types text into the search input field, THE Search System SHALL filter campaigns where the campaign name contains the search text (case-insensitive)
2. WHEN a visitor types text into the search input field, THE Search System SHALL filter campaigns where the campaign description contains the search text (case-insensitive)
3. THE Search System SHALL update search results in real-time as the visitor types
4. WHEN the search input field is empty, THE Search System SHALL display all active public campaigns
5. THE Search System SHALL query only campaigns where visibility equals "Public" AND status equals "Active"

### Requirement 3

**User Story:** As a visitor, I want to see search results displayed in an attractive grid layout, so that I can browse through multiple campaigns easily.

#### Acceptance Criteria

1. THE Search System SHALL display search results in a responsive grid layout with 1 column on mobile, 2 columns on tablet, and 3 columns on desktop
2. WHEN search results are available, THE Search System SHALL display each campaign using the existing Campaign Card component
3. THE Search System SHALL display the campaign name, description (if available), and supporters count for each campaign in the search results
4. THE Search System SHALL display a loading spinner while fetching campaigns from Firestore
5. WHEN no campaigns match the search criteria, THE Search System SHALL display a message "No campaigns found. Try a different search term."

### Requirement 4

**User Story:** As a visitor, I want to click on a campaign card in the search results, so that I can navigate to the campaign page and use the photo frame.

#### Acceptance Criteria

1. WHEN a visitor clicks on a campaign card in the search results, THE Search System SHALL navigate to the campaign detail page using the campaign slug
2. THE Search System SHALL apply hover effects to campaign cards to indicate they are clickable
3. THE Search System SHALL maintain the existing Campaign Card component functionality and styling
4. THE Search System SHALL ensure all campaign links open in the same browser tab

### Requirement 5

**User Story:** As a visitor on a mobile device, I want the search feature to work smoothly on my phone, so that I can discover campaigns on any device.

#### Acceptance Criteria

1. THE Search System SHALL display the search input field with touch-friendly sizing (minimum 44px height) on mobile devices
2. THE Search System SHALL display campaign cards in a single column layout on screens smaller than 640px width
3. THE Search System SHALL apply appropriate spacing and padding for mobile viewports
4. WHEN a visitor scrolls through search results on mobile, THE Search System SHALL maintain smooth scrolling performance
5. THE Search System SHALL ensure text remains readable on all screen sizes without horizontal scrolling
