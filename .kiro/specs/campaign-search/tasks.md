# Implementation Plan

- [x] 1. Create Firestore function to fetch public active campaigns
  - Add `getPublicActiveCampaigns` function to `lib/firestore.ts` that queries campaigns where visibility is "Public" AND status is "Active"
  - Order results by createdAt in descending order
  - Handle query errors and return empty array on failure
  - _Requirements: 2.5_

- [x] 2. Create PublicCampaignCard component
  - Create new file `components/PublicCampaignCard.tsx` with simplified campaign card design
  - Accept campaign object and onClick callback as props
  - Display campaign image, name, description (if available), supporters count, and status indicator
  - Make entire card clickable with hover effects (cursor pointer, subtle scale, border color change)
  - Remove all action buttons (edit, share, delete) from the design
  - Use Next.js Image component for optimized image loading
  - Apply responsive styling matching existing CampaignCard visual design
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 3. Create SearchInput component
  - Create new file `components/SearchInput.tsx` for the search input field
  - Accept value, onChange, onSearch, and optional placeholder as props
  - Apply white background (#ffffff) with 8px border-radius
  - Use padding 22px 14px, width 377px on desktop (full-width on mobile)
  - Use Mona-Sans-Medium font, 14px size, font-weight 500, primary color text
  - Set placeholder to "Search your campaigns"
  - Apply responsive styling with proper focus states
  - Ensure touch-friendly sizing (minimum 44px height) for mobile devices
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1_

- [x] 4. Create SearchResults component
  - Create new file `components/SearchResults.tsx` to display campaign grid
  - Accept campaigns array, loading boolean, and searchQuery string as props
  - Display loading spinner when loading is true using existing LoadingSpinner component
  - Display "No campaigns found. Try a different search term." when results are empty and not loading
  - Render grid of PublicCampaignCard components with responsive layout (1 column mobile, 2 tablet, 3 desktop)
  - Apply proper spacing and gap between cards
  - _Requirements: 3.1, 3.4, 3.5, 5.2, 5.3_

- [x] 5. Implement client-side search filtering logic
  - Create `filterCampaigns` utility function that accepts campaigns array and search query
  - Return all campaigns when query is empty
  - Filter campaigns by case-insensitive match on campaignName OR description
  - Use memoization (useMemo) to optimize filtering performance
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 6. Integrate search section into landing page
  - Add new "Find your Campaign" section to `app/page.tsx` between hero and "How It Works" sections
  - Apply dark background (#002400) with white text matching design reference
  - Add section heading "Find your Campaign" (48px, Mona-Sans-Bold, white)
  - Add description "search and find your campaign at phrames" (19px, Mona-Sans-Regular, white)
  - Create horizontal layout with SearchInput and "Find Campaign" button (green #00dd78 background)
  - Fetch public active campaigns on component mount using getPublicActiveCampaigns
  - Implement state management for campaigns, searchQuery, filteredCampaigns, and loading
  - Wire up SearchInput component with searchQuery state
  - Wire up "Find Campaign" button to trigger search/filter
  - Wire up SearchResults component with filteredCampaigns and loading state
  - Implement navigation handler that routes to `/campaign/[slug]` when campaign card is clicked
  - Apply max-width 990px container with responsive padding
  - _Requirements: 1.1, 1.5, 2.3, 2.4, 3.1, 4.1, 4.4, 5.4_

- [x] 7. Add responsive styling and mobile optimizations
  - Verify search section uses responsive padding (py-12 sm:py-16 md:py-20)
  - Ensure grid layout adapts correctly at breakpoints (640px, 1024px)
  - Test search input and cards on mobile devices for proper sizing and spacing
  - Verify text readability on all screen sizes without horizontal scrolling
  - Apply appropriate spacing between section heading, search input, and results grid
  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.5_

- [x] 8. Implement error handling and empty states
  - Add try-catch block around getPublicActiveCampaigns call with error logging
  - Display toast notification if campaign fetch fails
  - Handle case when no public campaigns exist with appropriate message
  - Handle image loading errors with fallback in PublicCampaignCard
  - Ensure loading state displays correctly during initial fetch
  - _Requirements: 3.4, 3.5_

- [x] 9. Add accessibility features
  - Add aria-label="Search campaigns" to search input
  - Add aria-hidden="true" to search icon
  - Add proper aria-labels to PublicCampaignCard components including campaign name
  - Add aria-label="Loading campaigns" to loading spinner
  - Ensure proper heading hierarchy in search section
  - Verify keyboard navigation works (Tab through search and cards, Enter/Space to activate)
  - Add visible focus rings to interactive elements
  - _Requirements: 1.1, 3.1, 4.1, 4.2_

- [ ]* 10. Write unit tests for search functionality
  - Test filterCampaigns function with various inputs (empty query, name match, description match, no matches)
  - Test SearchInput component onChange callback and controlled input behavior
  - Test PublicCampaignCard onClick callback and data rendering
  - Test SearchResults component displays correct states (loading, empty, with results)
  - _Requirements: 2.1, 2.2, 2.4, 3.4, 3.5_
