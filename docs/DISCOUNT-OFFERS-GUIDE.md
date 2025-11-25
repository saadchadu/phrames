# Discount & Offers Feature Guide

## Overview
The discount and offers feature allows admins to set promotional discounts on pricing plans and display them prominently on the landing page and payment modal.

## Features

### 1. Admin Settings
- **Enable/Disable Offers**: Toggle to control whether discounts are shown to users
- **Discount Percentages**: Set individual discount percentages (0-100%) for each plan
- **Real-time Preview**: See discounted prices in the confirmation modal before saving

### 2. Landing Page Display
When offers are enabled and discounts are set:
- Original price shown with strikethrough
- Discounted price displayed in green
- Red "X% OFF" badge on each discounted plan
- "Limited Offer!" label to create urgency

### 3. Payment Modal Display
- Discount badges on plans with active offers
- Original and discounted prices shown side-by-side
- Consistent visual design with landing page

## How to Use

### Setting Up Discounts

1. **Navigate to Admin Settings**
   - Go to `/admin/settings`
   - Scroll to "Plan Pricing (INR)" section

2. **Set Discount Percentages**
   - Enter discount percentage (0-100) for each plan
   - See real-time preview of discounted prices below each field
   - Example: 20% discount on ₹299 = ₹239

3. **Enable Offers**
   - Check the "Enable Special Offers/Discounts" toggle in System Settings
   - This makes discounts visible to users

4. **Save Changes**
   - Click "Save Pricing" button
   - Confirm the changes in the modal
   - Changes take effect immediately

### Disabling Offers

To temporarily hide discounts without removing them:
1. Go to Admin Settings
2. Uncheck "Enable Special Offers/Discounts"
3. Discounts are preserved but not shown to users

### Removing Discounts

To remove discounts entirely:
1. Set all discount percentages to 0
2. Save changes
3. Optionally disable offers toggle

## Technical Details

### Data Structure

**Firestore: `settings/plans`**
```json
{
  "week": 99,
  "month": 299,
  "3month": 799,
  "6month": 1499,
  "year": 2499,
  "discounts": {
    "week": 0,
    "month": 20,
    "3month": 25,
    "6month": 30,
    "year": 35
  }
}
```

**Firestore: `settings/system`**
```json
{
  "offersEnabled": true,
  "freeCampaignEnabled": true,
  "newCampaignsEnabled": true,
  "newSignupsEnabled": true
}
```

### Calculation Logic

Discounted price = Original price - (Original price × Discount percentage / 100)

Example:
- Original: ₹299
- Discount: 20%
- Calculation: 299 - (299 × 20 / 100) = 299 - 59.8 = ₹239

Prices are rounded to nearest integer.

### Components Updated

1. **PricingEditor** (`components/admin/PricingEditor.tsx`)
   - Added discount percentage inputs
   - Real-time discount calculation
   - Preview in confirmation modal

2. **PricingSection** (`components/PricingSection.tsx`)
   - Fetches discount data from Firestore
   - Displays discount badges and strikethrough prices
   - Conditional rendering based on `offersEnabled`

3. **PaymentModal** (`components/PaymentModal.tsx`)
   - Shows discounted prices in plan selection
   - Discount badges on applicable plans
   - Uses calculated prices from `feature-toggles`

4. **Feature Toggles** (`lib/feature-toggles.ts`)
   - `getEnabledPlans()` now returns discount information
   - Calculates final prices based on offers enabled status

## Best Practices

### Marketing Strategy
- Use time-limited offers to create urgency
- Highlight bigger discounts on longer plans
- Announce offers through email/social media

### Discount Recommendations
- **Week**: 0-10% (short-term, less discount needed)
- **Month**: 10-20% (most popular, moderate discount)
- **3 Months**: 20-30% (encourage longer commitment)
- **6 Months**: 30-40% (significant savings)
- **Year**: 35-50% (best value, maximum discount)

### Testing
1. Set discounts in admin panel
2. Enable offers toggle
3. Check landing page display
4. Test payment modal
5. Verify prices in payment flow
6. Disable offers and verify they're hidden

## Troubleshooting

### Discounts Not Showing
- Check if "Enable Special Offers/Discounts" is enabled
- Verify discount percentages are > 0
- Clear browser cache and refresh

### Incorrect Calculations
- Ensure discount percentages are between 0-100
- Check Firestore data structure matches expected format
- Verify no negative prices

### Admin Panel Issues
- Ensure admin authentication is working
- Check browser console for errors
- Verify Firestore permissions

## Future Enhancements

Potential improvements:
- Time-based automatic offers (start/end dates)
- User-specific discount codes
- Bulk discount operations
- Discount analytics and tracking
- A/B testing different discount levels
