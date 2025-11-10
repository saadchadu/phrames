# Design Document: Campaign Search Feature

## Overview

The campaign search feature will be integrated into the landing page as a new section positioned between the hero section and the "How It Works" section. This placement ensures high visibility for visitors while maintaining the natural flow of the page. The feature will consist of a search input component and a results grid that displays public, active campaigns using a simplified version of the existing CampaignCard component.

The implementation will leverage existing Firestore functions and create new client-side filtering logic to provide real-time search results. The design prioritizes simplicity, performance, and mobile responsiveness.

## Architecture

### Component Structure

```
app/page.tsx (Landing Page)
├── Hero Section (existing)
├── Campaign Search Section (new)
│   ├── SearchInput Component (new)
│   └── SearchResults Component (new)
│       └── PublicCampaignCard Component (new)
├── How It Works Section (existing)
└── CTA Section (existing)
```

### Data Flow

1. **Initial Load**: Landing page fetches all public active campaigns from Firestore on mount
2. **Search Input**: User types in search field → triggers client-side filtering
3. **Results Display**: Filtered campaigns render in grid using PublicCampaignCard components
4. **Navigation**: User clicks campaign card → navigates to `/campaign/[slug]`

### State Management

The search feature will use React hooks for state management:
- `campaigns`: Array of all public active campaigns (fetched once)
- `searchQuery`: Current search input value
- `filteredCampaigns`: Computed array based on searchQuery
- `loading`: Boolean for initial data fetch state

## Components and Interfaces

### 1. SearchInput Component

**Purpose**: Provides the search input field with styling matching the design reference

**Props**:
```typescript
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}
```

**Styling** (based on design reference):
- White background (#ffffff)
- Rounded corners (8px border-radius)
- Padding: 22px 14px
- Width: 377px on desktop, full-width on mobile
- Text color: #002400 (primary)
- Font: Mona-Sans-Medium, 14px, font-weight 500
- Placeholder: "Search your campaigns"
- No search icon inside input (button handles search action)

### 2. SearchResults Component

**Purpose**: Displays the grid of filtered campaign results

**Props**:
```typescript
interface SearchResultsProps {
  campaigns: Campaign[]
  loading: boolean
  searchQuery: string
}
```

**Behavior**:
- Shows loading spinner when `loading` is true
- Shows "No campaigns found" message when results are empty and not loading
- Renders grid of PublicCampaignCard components when campaigns exist
- Grid responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

### 3. PublicCampaignCard Component

**Purpose**: Simplified campaign card for public viewing (no edit/delete actions)

**Props**:
```typescript
interface PublicCampaignCardProps {
  campaign: Campaign
  onClick: (slug: string) => void
}
```

**Differences from existing CampaignCard**:
- No action buttons (edit, share, delete)
- Entire card is clickable
- Simplified hover state
- Displays: campaign image, name, description, supporters count, status indicator

**Styling**:
- Matches existing CampaignCard visual design
- Cursor pointer on hover
- Subtle scale transform on hover
- Border color change on hover

## Data Models

### Campaign Interface (existing)

```typescript
interface Campaign {
  id?: string
  campaignName: string
  slug: string
  description?: string
  visibility: 'Public' | 'Unlisted'
  frameURL: string
  status: 'Active' | 'Inactive'
  supportersCount: number
  createdBy: string
  createdAt: any
}
```

### Firestore Query

The feature will use a new function to fetch public active campaigns:

```typescript
export const getPublicActiveCampaigns = async (): Promise<Campaign[]> => {
  // Query campaigns where:
  // - visibility === 'Public'
  // - status === 'Active'
  // Order by createdAt descending
}
```

## Search Algorithm

### Client-Side Filtering Logic

```typescript
const filterCampaigns = (campaigns: Campaign[], query: string): Campaign[] => {
  if (!query.trim()) {
    return campaigns
  }
  
  const lowerQuery = query.toLowerCase()
  
  return campaigns.filter(campaign => {
    const nameMatch = campaign.campaignName.toLowerCase().includes(lowerQuery)
    const descMatch = campaign.description?.toLowerCase().includes(lowerQuery) || false
    return nameMatch || descMatch
  })
}
```

**Rationale**: Client-side filtering is chosen over server-side for:
- Real-time responsiveness as user types
- Reduced Firestore read operations (cost optimization)
- Simpler implementation for MVP
- Expected dataset size is manageable (< 1000 campaigns initially)

**Future Enhancement**: If campaign count grows significantly, implement server-side search with Firestore text search or Algolia integration.

## Layout Integration

### Landing Page Structure (Updated)

```jsx
<main>
  {/* Hero Section */}
  <section className="py-12 sm:py-16 md:py-20 lg:py-24">
    {/* Existing hero content */}
  </section>

  {/* NEW: Campaign Search Section */}
  <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-primary">
    <div className="max-w-[990px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-7 mb-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white">
          Find your Campaign
        </h2>
        <p className="text-base sm:text-lg text-white/90 text-center">
          search and find your campaign at phrames
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-end gap-5 mb-10">
        <SearchInput />
        <button className="search-button">Find Campaign</button>
      </div>
      <SearchResults />
    </div>
  </section>

  {/* How It Works Section */}
  <section className="py-12 sm:py-16 md:py-20 lg:py-24">
    {/* Existing content */}
  </section>

  {/* Remaining sections */}
</main>
```

### Responsive Breakpoints

- **Mobile** (< 640px): Single column grid, full-width search
- **Tablet** (640px - 1024px): 2-column grid, constrained search width
- **Desktop** (> 1024px): 3-column grid, centered search with max-width

## Error Handling

### Firestore Query Errors

```typescript
try {
  const campaigns = await getPublicActiveCampaigns()
  setCampaigns(campaigns)
} catch (error) {
  console.error('Failed to fetch campaigns:', error)
  toast('Failed to load campaigns. Please refresh the page.', 'error')
  setCampaigns([])
}
```

### Empty States

1. **No campaigns exist**: Display message "No public campaigns available yet."
2. **No search results**: Display message "No campaigns found. Try a different search term."
3. **Loading state**: Display centered loading spinner

### Image Loading Errors

- Use Next.js Image component with fallback
- If frameURL fails to load, show placeholder image or gray background

## Performance Considerations

### Optimization Strategies

1. **Debouncing**: Not required for client-side filtering (fast enough)
2. **Memoization**: Use `useMemo` for filtered results to avoid unnecessary recalculations
3. **Image Optimization**: Leverage Next.js Image component for automatic optimization
4. **Lazy Loading**: Images load as user scrolls (Next.js default behavior)
5. **Initial Load**: Fetch campaigns once on mount, cache in component state

### Performance Metrics

- Initial campaign fetch: < 2 seconds
- Search filtering: < 50ms (imperceptible to user)
- Image loading: Progressive with blur placeholder

## Accessibility

### ARIA Labels and Roles

- Search input: `aria-label="Search campaigns"`
- Search icon: `aria-hidden="true"`
- Campaign cards: `role="button"` with `aria-label` including campaign name
- Loading spinner: `aria-label="Loading campaigns"`
- Empty state: Proper heading hierarchy

### Keyboard Navigation

- Search input: Focusable with visible focus ring
- Campaign cards: Keyboard accessible (Enter/Space to activate)
- Tab order: Natural flow from search to results

### Screen Reader Support

- Announce search results count: "Showing X campaigns"
- Announce when no results found
- Proper semantic HTML (section, heading, list structure)

## Testing Strategy

### Unit Tests

1. **filterCampaigns function**
   - Test with empty query returns all campaigns
   - Test name matching (case-insensitive)
   - Test description matching
   - Test with no matches returns empty array

2. **SearchInput component**
   - Test onChange callback fires with correct value
   - Test placeholder text renders
   - Test controlled input value

3. **PublicCampaignCard component**
   - Test onClick callback fires with correct slug
   - Test renders campaign data correctly
   - Test handles missing description gracefully

### Integration Tests

1. **Search flow**
   - User types in search → results update
   - User clears search → all campaigns shown
   - User clicks campaign → navigates to correct URL

2. **Data fetching**
   - Campaigns load on mount
   - Loading state displays correctly
   - Error state handles fetch failures

### Manual Testing Checklist

- [ ] Search works on mobile, tablet, desktop
- [ ] Campaign cards are clickable and navigate correctly
- [ ] Loading spinner appears during initial fetch
- [ ] Empty states display appropriate messages
- [ ] Images load correctly with proper aspect ratios
- [ ] Hover states work on desktop
- [ ] Touch interactions work on mobile
- [ ] Keyboard navigation functions properly
- [ ] Screen reader announces content correctly

## Visual Design

### Color Palette (based on design reference)

- **Search Section Background**: `#002400` (primary dark green)
- **Section Text**: `#ffffff` (white)
- **Search Input Background**: `#ffffff` (white)
- **Search Input Text**: `#002400` (primary)
- **Button Background**: `#00dd78` (secondary bright green)
- **Button Text**: `#002400` (primary)
- **Results Background**: White cards on dark background
- **Border**: `#00240010` (primary with 10% opacity)

### Typography (from design reference)

- **Section heading**: 48px, Mona-Sans-Bold, font-weight 700, white color
- **Section description**: 19px, Mona-Sans-Regular, font-weight 400, white color
- **Search input**: 14px, Mona-Sans-Medium, font-weight 500, primary color
- **Button text**: 14px, Mona-Sans-SemiBold, font-weight 600, primary color
- **Campaign name**: lg-xl, semibold, primary color (for results)
- **Campaign description**: sm, regular, primary/60 (for results)

### Spacing (from design reference)

- **Section padding**: 117px vertical (desktop), responsive on mobile
- **Heading to description gap**: 28px
- **Description to search gap**: 41px
- **Search input to button gap**: 20px
- **Search input padding**: 22px 14px
- **Button padding**: 22px 26px
- **Search input width**: 377px (desktop), full-width (mobile)
- **Button width**: 196px (desktop), full-width (mobile)
- **Grid gap**: 6-8 (responsive)
- **Card padding**: 4-6 (responsive)

## Security Considerations

### Data Access

- Only public campaigns are fetched (visibility === 'Public')
- Only active campaigns are shown (status === 'Active')
- No authentication required for viewing
- Campaign creator information not exposed in public view

### Input Sanitization

- Search query is used only for client-side filtering
- No direct database queries with user input
- XSS protection via React's automatic escaping

### Firestore Rules

Existing rules should allow read access to public campaigns:

```
match /campaigns/{campaignId} {
  allow read: if resource.data.visibility == 'Public';
}
```

## Future Enhancements

1. **Advanced Filters**: Filter by date, popularity, category
2. **Sorting Options**: Sort by newest, most popular, alphabetical
3. **Pagination**: Load campaigns in batches for better performance
4. **Search Analytics**: Track popular search terms
5. **Featured Campaigns**: Highlight selected campaigns at top of results
6. **Server-Side Search**: Implement full-text search with Algolia or similar
7. **Search History**: Remember recent searches (localStorage)
8. **Autocomplete**: Suggest campaign names as user types
