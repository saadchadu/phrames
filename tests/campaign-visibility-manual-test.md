# Campaign Visibility Manual Test Guide

**Task:** 12.5 Test public campaign visibility  
**Requirements:** 7.1, 7.2, 7.3  
**Date:** November 18, 2025

## Overview

This document provides step-by-step instructions for manually testing public campaign visibility based on different campaign states (active, inactive, expired).

## Prerequisites

- Access to the Phrames application (local or deployed)
- At least one test campaign created
- Access to Firebase Console to modify campaign data
- Browser with developer tools

## Test Scenarios

### Test 1: Verify Active Campaigns Are Accessible

**Requirement:** 7.1

**Setup:**
1. Create or identify a campaign with the following properties:
   - `isActive: true`
   - `status: 'Active'`
   - `expiresAt: [future date, e.g., 30 days from now]`
   - `planType: 'month'`

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Observe the page content

**Expected Results:**
- ✅ Campaign page loads successfully
- ✅ Campaign name and description are displayed
- ✅ Frame preview is visible
- ✅ "Choose Photo" button is available
- ✅ Creator information is shown
- ✅ Status badge shows "Active"
- ✅ No error message is displayed

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 2: Verify Inactive Campaigns Show Error Message

**Requirement:** 7.2

**Setup:**
1. Create or modify a campaign with the following properties:
   - `isActive: false`
   - `status: 'Inactive'`
   - No `expiresAt` or any date

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Observe the page content

**Expected Results:**
- ✅ Campaign page loads but shows error state
- ✅ Error message displays: "Campaign Inactive"
- ✅ Subtitle displays: "This campaign is currently inactive. Please contact the creator to reactivate it."
- ✅ Campaign slug is shown for reference
- ✅ No campaign content (frame, upload button) is visible
- ✅ Gray warning icon is displayed

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 3: Verify Expired Campaigns Show Error Message

**Requirement:** 7.2, 7.3

**Setup:**
1. Create or modify a campaign with the following properties:
   - `isActive: true` (or `false` if expiry check has run)
   - `status: 'Active'` (or `'Inactive'` if expiry check has run)
   - `expiresAt: [past date, e.g., yesterday]`
   - `planType: 'week'`

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Observe the page content

**Expected Results:**
- ✅ Campaign page loads but shows error state
- ✅ Error message displays: "Campaign Inactive"
- ✅ Subtitle displays: "This campaign is currently inactive. Please contact the creator to reactivate it."
- ✅ No campaign content is visible
- ✅ Same error UI as inactive campaign

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 4: Test Campaign Expiring Soon (Still Active)

**Requirement:** 7.1, 7.3

**Setup:**
1. Create or modify a campaign with the following properties:
   - `isActive: true`
   - `status: 'Active'`
   - `expiresAt: [date 2 hours from now]`
   - `planType: 'week'`

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Observe the page content

**Expected Results:**
- ✅ Campaign page loads successfully
- ✅ Campaign is fully accessible
- ✅ All features work normally
- ✅ Campaign is visible even though expiry is soon

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 5: Test Grandfathered Campaign (No Expiry)

**Requirement:** 7.1

**Setup:**
1. Create or modify a campaign with the following properties:
   - `isActive: true`
   - `status: 'Active'`
   - No `expiresAt` field (undefined)

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Observe the page content

**Expected Results:**
- ✅ Campaign page loads successfully
- ✅ Campaign is fully accessible
- ✅ All features work normally
- ✅ No expiry date is shown

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 6: Test Campaign State Transition

**Requirement:** 7.1, 7.2, 7.3

**Setup:**
1. Start with an active campaign with future expiry

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Verify campaign is accessible
3. In Firebase Console, update the campaign:
   - Set `isActive: false`
   - Set `status: 'Inactive'`
4. Refresh the campaign page
5. Observe the change

**Expected Results:**
- ✅ Initially, campaign is visible and accessible
- ✅ After update, campaign shows error message
- ✅ Error message indicates campaign is inactive
- ✅ Transition happens immediately after refresh

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 7: Test Different Campaign States

**Requirement:** 7.1, 7.2, 7.3

**Setup:**
Create 4 test campaigns with different states:

**Campaign A: Active + Future Expiry**
- `isActive: true`
- `expiresAt: [30 days from now]`

**Campaign B: Inactive**
- `isActive: false`
- No expiry or any expiry

**Campaign C: Expired**
- `isActive: true` or `false`
- `expiresAt: [1 day ago]`

**Campaign D: Grandfathered**
- `isActive: true`
- No `expiresAt` field

**Steps:**
1. Visit each campaign's public URL
2. Document the visibility for each

**Expected Results:**

| Campaign | Expected Visibility | Expected Message |
|----------|-------------------|------------------|
| A (Active + Future) | ✅ Visible | None |
| B (Inactive) | ❌ Not Visible | "Campaign Inactive" |
| C (Expired) | ❌ Not Visible | "Campaign Inactive" |
| D (Grandfathered) | ✅ Visible | None |

**Actual Results:**

| Campaign | Actual Visibility | Actual Message | Pass/Fail |
|----------|------------------|----------------|-----------|
| A | | | [ ] |
| B | | | [ ] |
| C | | | [ ] |
| D | | | [ ] |

**Notes:**
```
[Add any observations here]
```

---

### Test 8: Test Browser Console for Visibility Logic

**Requirement:** 7.1, 7.3

**Setup:**
1. Use any test campaign

**Steps:**
1. Navigate to the campaign's public URL: `/campaign/[slug]`
2. Open browser developer tools (F12)
3. Check the Console tab for log messages
4. Look for visibility check logs

**Expected Results:**
- ✅ Console shows "Loading campaign with slug: [slug]"
- ✅ Console shows "Campaign data loaded: [data]"
- ✅ If inactive/expired, console shows "Campaign is inactive or expired"
- ✅ No JavaScript errors in console

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Console Output:**
```
[Paste relevant console output here]
```

---

### Test 9: Test Direct URL Access

**Requirement:** 7.1, 7.2

**Setup:**
1. Have both an active and inactive campaign

**Steps:**
1. Copy the public URL of an active campaign
2. Open in a new incognito/private browser window
3. Verify accessibility
4. Repeat with inactive campaign URL

**Expected Results:**
- ✅ Active campaign is accessible in incognito mode
- ✅ Inactive campaign shows error in incognito mode
- ✅ No authentication required to view error message
- ✅ Behavior is consistent across browser sessions

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

### Test 10: Test Mobile Responsiveness

**Requirement:** 7.1, 7.2

**Setup:**
1. Have both an active and inactive campaign

**Steps:**
1. Open active campaign on mobile device or mobile emulator
2. Verify visibility and layout
3. Open inactive campaign on mobile device
4. Verify error message display

**Expected Results:**
- ✅ Active campaign displays correctly on mobile
- ✅ Inactive campaign error message is readable on mobile
- ✅ Error icon and text are properly sized
- ✅ Layout is responsive and user-friendly

**Actual Results:**
- [ ] Pass
- [ ] Fail

**Notes:**
```
[Add any observations here]
```

---

## How to Modify Campaign Data in Firebase

### Using Firebase Console:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to Firestore Database
4. Find the `campaigns` collection
5. Locate your test campaign by slug
6. Click on the document
7. Edit the fields:
   - `isActive`: boolean (true/false)
   - `status`: string ('Active' or 'Inactive')
   - `expiresAt`: timestamp (click to edit date/time)
8. Save changes

### Creating Test Dates:

**Future Date (30 days):**
- Current date + 30 days
- Example: If today is Nov 18, 2025, use Dec 18, 2025

**Past Date (1 day ago):**
- Current date - 1 day
- Example: If today is Nov 18, 2025, use Nov 17, 2025

**Expiring Soon (2 hours):**
- Current time + 2 hours
- Example: If now is 10:00 PM, use 12:00 AM (next day)

---

## Test Summary

### Requirements Coverage

- **Requirement 7.1:** Active campaign visibility check
  - Tests: 1, 4, 5, 7, 8, 9, 10
  - Status: [ ] Pass / [ ] Fail

- **Requirement 7.2:** Inactive campaign error message
  - Tests: 2, 3, 6, 7, 9, 10
  - Status: [ ] Pass / [ ] Fail

- **Requirement 7.3:** Expired campaign detection
  - Tests: 3, 4, 6, 7, 8
  - Status: [ ] Pass / [ ] Fail

### Overall Test Results

- Total Tests: 10
- Passed: ___
- Failed: ___
- Blocked: ___

### Issues Found

```
[List any issues or bugs discovered during testing]
```

### Recommendations

```
[Add any recommendations for improvements]
```

---

## Sign-off

**Tester Name:** ___________________  
**Date:** ___________________  
**Status:** [ ] All Tests Passed [ ] Issues Found  

**Notes:**
```
[Final notes and observations]
```
