# Pricing System Verification

## ✅ All Hardcoded Prices Removed

All components now fetch prices dynamically from Firestore `settings/plans` document.

## Current Firestore Prices

```
Week:     ₹49
Month:    ₹299
3 Month:  ₹799
6 Month:  ₹1499
Year:     ₹2499
```

## Discount Status

```
Week:     10% (configured but not active)
Month:    0%
3 Month:  0%
6 Month:  0%
Year:     0%

Offers Enabled: NO
```

## Where Prices Are Used

### 1. Landing Page (`components/PricingSection.tsx`)
- ✅ Fetches from Firestore on component mount
- ✅ Falls back to correct prices if fetch fails
- ✅ Applies discounts when offers are enabled
- ✅ Shows discount badges and strikethrough pricing

### 2. Payment Modal (`components/PaymentModal.tsx`)
- ✅ Uses `getEnabledPlans()` from feature-toggles
- ✅ Displays discounted prices when offers are enabled
- ✅ Shows discount badges

### 3. Payment API (`app/api/payments/initiate/route.ts`)
- ✅ **CRITICAL**: Fetches price from Firestore at payment time
- ✅ Applies active discounts to payment amount
- ✅ Falls back to PRICING_PLANS if Firestore unavailable
- ✅ Uses correct prices (₹49, ₹299, ₹799, ₹1499, ₹2499)

### 4. Feature Toggles (`lib/feature-toggles.ts`)
- ✅ `getEnabledPlans()` fetches from Firestore
- ✅ Calculates discounted prices
- ✅ Returns offer status
- ✅ Correct fallback prices

### 5. Cashfree Config (`lib/cashfree.ts`)
- ✅ PRICING_PLANS updated with correct prices
- ✅ Marked as fallback values only
- ✅ Not used for actual payments (API fetches from Firestore)

## Admin Controls

### Settings Page (`app/admin/settings/page.tsx`)
Admins can:
1. Set discount percentages (0-100%) for each plan
2. Toggle "Enable Special Offers/Discounts"
3. See real-time preview of discounted prices
4. Save changes that take effect immediately

### Pricing Editor (`components/admin/PricingEditor.tsx`)
Features:
- Regular price inputs
- Discount percentage inputs
- Real-time calculation preview
- Confirmation modal with before/after prices

## How It Works

### Without Offers Enabled
1. User sees regular prices on landing page
2. Payment modal shows regular prices
3. Payment API charges regular price

### With Offers Enabled
1. User sees discounted prices with badges on landing page
2. Original price shown with strikethrough
3. Payment modal shows discounted prices
4. Payment API charges discounted price
5. All calculations use: `price - (price × discount / 100)`

## Testing Checklist

- [x] Prices match Firestore values
- [x] No hardcoded prices in payment flow
- [x] Landing page fetches from Firestore
- [x] Payment modal fetches from Firestore
- [x] Payment API fetches from Firestore
- [x] Discounts calculate correctly
- [x] Offers toggle works
- [x] Admin can update prices
- [x] Admin can set discounts
- [x] Fallback prices are correct

## To Enable Discounts

1. Go to `/admin/settings`
2. Scroll to "Plan Pricing (INR)"
3. Set discount percentages (e.g., 20% for month)
4. Check "Enable Special Offers/Discounts" in System Settings
5. Click "Save Pricing"
6. Visit landing page to see discounts live

## Verification Commands

Check current prices:
```bash
npx tsx scripts/check-current-prices.ts
```

Initialize/reset discounts:
```bash
npx tsx scripts/initialize-discounts.ts
```

## Important Notes

- All prices are now dynamic from Firestore
- Payment API uses Firestore prices (not hardcoded)
- Discounts are applied at payment time
- Offers can be toggled without losing discount values
- Changes take effect immediately (no cache)
- Fallback prices match your actual Firestore prices
