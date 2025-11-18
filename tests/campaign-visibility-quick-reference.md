# Campaign Visibility Quick Reference

## Quick Test Command

```bash
# Run automated visibility logic tests
npx ts-node tests/campaign-visibility-verification.ts
```

## Campaign Visibility Rules

### ✅ Campaign IS Visible When:
- `isActive === true` AND
- (`expiresAt` is undefined OR `expiresAt > now`)

### ❌ Campaign IS NOT Visible When:
- `isActive === false` OR
- `expiresAt <= now`

## Test Files

| File | Purpose | How to Use |
|------|---------|------------|
| `campaign-visibility-verification.ts` | Automated logic tests | `npx ts-node tests/campaign-visibility-verification.ts` |
| `campaign-visibility-manual-test.md` | Manual testing guide | Follow step-by-step instructions |
| `CAMPAIGN-VISIBILITY-TEST-SUMMARY.md` | Test results summary | Review for test status |
| `campaign-visibility.test.ts` | Unit tests (optional) | Requires test runner setup |

## Campaign States Matrix

| State | isActive | expiresAt | Visible? | Error Message |
|-------|----------|-----------|----------|---------------|
| Active + Future | ✅ true | Future | ✅ YES | None |
| Inactive | ❌ false | Any | ❌ NO | "Campaign Inactive" |
| Expired | Any | Past | ❌ NO | "Campaign Inactive" |
| Grandfathered | ✅ true | undefined | ✅ YES | None |

## Quick Firebase Test Setup

### Make Campaign Inactive:
```javascript
{
  isActive: false,
  status: 'Inactive'
}
```

### Make Campaign Expired:
```javascript
{
  isActive: true,
  status: 'Active',
  expiresAt: [yesterday's date]
}
```

### Make Campaign Active:
```javascript
{
  isActive: true,
  status: 'Active',
  expiresAt: [30 days from now]
}
```

## Requirements Checklist

- ✅ **7.1:** Active campaigns are accessible
- ✅ **7.2:** Inactive campaigns show error message
- ✅ **7.3:** Expired campaigns are detected

## Test Results

**Automated Tests:** 15/15 PASSED ✅  
**Status:** COMPLETED ✅  
**Date:** November 18, 2025
