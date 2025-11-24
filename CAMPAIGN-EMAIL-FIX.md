# Campaign Publisher Email Fix

## Issue
The landing page campaigns section was showing the logged-in user's name instead of the actual campaign publisher's name.

## Root Cause
When campaigns were created, the `createdByEmail` field was not being saved to Firestore. The `PublicCampaignCard` component relies on this field as a fallback when the user profile fetch fails or returns null.

## Solution

### 1. Fixed Campaign Creation
Updated `app/create/page.tsx` to include `createdByEmail` when creating campaigns:
```typescript
const campaignPayload: any = {
  campaignName: formData.campaignName,
  slug: formData.slug,
  visibility: formData.visibility,
  frameURL: imageUrl,
  createdBy: user.uid,
  createdByEmail: user.email  // ✅ Added this field
}
```

### 2. Updated Firestore Function
Modified `lib/firestore.ts` `createCampaign` function to save the `createdByEmail` field:
```typescript
// Add createdByEmail if provided
if (campaignData.createdByEmail) {
  cleanData.createdByEmail = campaignData.createdByEmail
}
```

### 3. Migration for Existing Campaigns
Created migration tools to update existing campaigns:

#### Option A: Admin Page (Recommended)
1. Navigate to `/admin/migrate-emails` in your browser
2. Click "Run Migration" button
3. The tool will update all campaigns missing the `createdByEmail` field

#### Option B: Server-Side Script
Run the Node.js script with Firebase Admin SDK:
```bash
# Set up service account credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"

# Run migration
npx ts-node scripts/migrate-campaign-emails.ts
```

## Display Format
The publisher name is displayed as:
1. User's display name (if available from profile)
2. Username from email (part before @domain.com)
3. "Unknown" as fallback

Example: `user@example.com` displays as "by user"

## Testing
After running the migration:
1. Visit the landing page
2. Check the "Trending Campaigns" section
3. Verify that each campaign shows the correct publisher username (part before @domain.com)
4. Confirm it's not showing the logged-in user's name

## Files Changed
- `app/create/page.tsx` - Added `createdByEmail` to campaign creation
- `lib/firestore.ts` - Updated `createCampaign` to save `createdByEmail`
- `scripts/migrate-campaign-emails-client.ts` - Client-side migration script
- `scripts/migrate-campaign-emails.ts` - Server-side migration script
- `app/admin/migrate-emails/page.tsx` - Admin UI for running migration

## Notes
- New campaigns will automatically include the `createdByEmail` field
- Existing campaigns need to be migrated once using one of the migration tools
- The `PublicCampaignCard` component already has proper fallback logic to display publisher info
