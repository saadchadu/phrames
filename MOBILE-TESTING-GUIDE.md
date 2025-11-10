# Mobile Testing Guide for Phrames

## 🧪 Quick Testing Checklist

### 1. Landing Page (/)
**Mobile (< 640px)**
- [ ] Hero text is readable and centered
- [ ] Buttons are full-width and easy to tap
- [ ] Hero image displays properly
- [ ] "How It Works" cards stack vertically
- [ ] CTA section text is readable
- [ ] Footer is properly formatted

**Tablet (640-1024px)**
- [ ] "How It Works" shows 2 columns
- [ ] Hero section uses more horizontal space
- [ ] Buttons are side-by-side

**Desktop (> 1024px)**
- [ ] "How It Works" shows 4 columns
- [ ] Hero section is side-by-side
- [ ] All spacing looks balanced

### 2. Navigation
**Mobile**
- [ ] Hamburger menu icon appears
- [ ] Menu opens smoothly when tapped
- [ ] Menu items are easy to tap (44px+ height)
- [ ] Active route is highlighted
- [ ] Menu closes when item is selected
- [ ] Logo is visible and properly sized

**Desktop**
- [ ] Full navigation menu visible
- [ ] No hamburger icon
- [ ] Hover states work properly

### 3. Login/Signup Pages
**Mobile**
- [ ] Form is centered and readable
- [ ] Input fields are large enough to tap
- [ ] Keyboard doesn't cause zoom (16px font)
- [ ] Buttons are full-width
- [ ] Google button is easy to tap
- [ ] Error messages display properly

**Desktop**
- [ ] Form is centered with max-width
- [ ] All elements properly spaced

### 4. Dashboard
**Mobile**
- [ ] Header stacks vertically
- [ ] "Refresh" and "Create Campaign" buttons are full-width
- [ ] Campaign cards show 1 per row
- [ ] Card action buttons are easy to tap
- [ ] Empty state displays properly

**Tablet**
- [ ] Campaign cards show 2 per row
- [ ] Header elements side-by-side

**Desktop**
- [ ] Campaign cards show 3 per row
- [ ] All spacing optimal

### 5. Create Campaign
**Mobile**
- [ ] Form fields stack vertically
- [ ] File upload area is large enough
- [ ] Preview image displays properly
- [ ] Radio buttons are easy to select
- [ ] Submit button is full-width

**Desktop**
- [ ] Form shows 2 columns (fields + upload)
- [ ] Layout is balanced

### 6. Campaign View (/campaign/[slug]) - CRITICAL
**Mobile - Before Photo Upload**
- [ ] Frame preview is square and centered
- [ ] "Choose Photo" button is large and easy to tap
- [ ] Campaign details are readable
- [ ] Creator info displays properly

**Mobile - After Photo Upload**
- [ ] Compact header shows at top
- [ ] Canvas is touch-responsive
- [ ] Can drag photo with finger
- [ ] Zoom slider is large and easy to use
- [ ] Zoom +/- buttons are easy to tap
- [ ] "Reset Position" button works
- [ ] "Change Photo" button is full-width
- [ ] "Download Image" button is full-width and prominent
- [ ] Instructions are clear ("Drag to reposition • Pinch to zoom")

**Tablet**
- [ ] Layout shows 2 columns (preview + controls)
- [ ] All controls accessible

**Desktop**
- [ ] 2-column layout optimal
- [ ] Hover states work

### 7. Touch Interactions (Mobile Only)
**Campaign Canvas**
- [ ] Single finger drag moves photo
- [ ] Pinch gesture zooms in/out
- [ ] No accidental page scrolling while dragging
- [ ] Visual feedback when dragging ("Drag to position" tooltip)
- [ ] Smooth performance (no lag)

**Zoom Slider**
- [ ] Thumb is large enough to grab (24px)
- [ ] Smooth sliding motion
- [ ] Visual feedback on active state
- [ ] Percentage updates in real-time

**Buttons**
- [ ] All buttons scale down slightly when tapped (active:scale-95)
- [ ] No double-tap zoom issues
- [ ] Proper spacing between buttons (no accidental taps)

### 8. Modals & Notifications
**Share Modal (Mobile)**
- [ ] Slides up from bottom (bottom sheet style)
- [ ] URL is visible and truncated properly
- [ ] "Copy" button is easy to tap
- [ ] "Share" button works (if supported)
- [ ] "Close" button is accessible
- [ ] Backdrop blur effect visible

**Toast Notifications (Mobile)**
- [ ] Appears at top of screen
- [ ] Full-width on mobile
- [ ] Text is readable
- [ ] Close button is easy to tap
- [ ] Auto-dismisses after 5 seconds
- [ ] Slide-in animation smooth

### 9. Performance Tests
**Mobile Network**
- [ ] Images load progressively
- [ ] No layout shifts during load
- [ ] Smooth scrolling
- [ ] Animations don't cause jank
- [ ] Canvas interactions are responsive

**Low-End Devices**
- [ ] App remains usable
- [ ] No crashes or freezes
- [ ] Acceptable load times

### 10. Orientation Tests (Mobile)
**Portrait Mode**
- [ ] All pages display correctly
- [ ] No horizontal scrolling
- [ ] All content accessible

**Landscape Mode**
- [ ] Layout adapts appropriately
- [ ] Campaign canvas still usable
- [ ] Navigation accessible

## 🎯 Critical User Flows to Test

### Flow 1: New User Sign Up (Mobile)
1. Open site on mobile
2. Tap "Sign Up" in nav
3. Fill out form (check keyboard behavior)
4. Submit form
5. Redirected to dashboard
6. Dashboard displays properly

### Flow 2: Create Campaign (Mobile)
1. From dashboard, tap "Create Campaign"
2. Fill out campaign name (auto-generates slug)
3. Add description
4. Select visibility
5. Upload PNG frame
6. Preview displays
7. Submit campaign
8. Redirected to dashboard
9. New campaign appears

### Flow 3: Use Campaign (Mobile) - MOST IMPORTANT
1. Open campaign link on mobile
2. Campaign details display
3. Tap "Choose Photo"
4. Select photo from device
5. Photo appears behind frame
6. Drag photo to reposition (smooth)
7. Use zoom slider to adjust size
8. Tap zoom +/- buttons
9. Tap "Reset Position" (works)
10. Tap "Download Image"
11. Image downloads with correct composition
12. Supporter count increments

### Flow 4: Share Campaign (Mobile)
1. From dashboard, tap share icon on campaign card
2. Modal slides up from bottom
3. Tap "Copy" button
4. Toast notification confirms copy
5. Close modal
6. Paste link in browser (verify it works)

## 📱 Device-Specific Tests

### iOS Safari
- [ ] No zoom on input focus
- [ ] Pinch-to-zoom works on canvas
- [ ] Smooth scrolling
- [ ] Status bar color correct (#00dd78)
- [ ] Add to Home Screen works
- [ ] PWA mode works

### Android Chrome
- [ ] Touch interactions smooth
- [ ] Zoom controls work
- [ ] Notifications display
- [ ] Add to Home Screen works
- [ ] PWA mode works

### iPad Safari
- [ ] 2-column layouts display
- [ ] Touch interactions work
- [ ] Landscape mode optimal

## 🐛 Common Issues to Check

### Layout Issues
- [ ] No horizontal scrolling on any page
- [ ] No content cut off at edges
- [ ] Proper padding on all sides (minimum 16px)
- [ ] Text doesn't touch screen edges

### Touch Issues
- [ ] No accidental double-taps
- [ ] No zoom on input focus
- [ ] Buttons don't overlap
- [ ] Minimum 44x44px touch targets

### Performance Issues
- [ ] No janky animations
- [ ] Smooth canvas dragging
- [ ] Fast page transitions
- [ ] Images load efficiently

### Visual Issues
- [ ] Consistent spacing
- [ ] Proper font sizes
- [ ] Colors match design
- [ ] Icons properly sized
- [ ] Shadows and borders visible

## ✅ Success Criteria

The app should feel like:
- ✅ A native mobile app (not a website)
- ✅ Smooth and responsive to touch
- ✅ Easy to use with one hand
- ✅ Professional and polished
- ✅ Fast and performant

## 🚀 Testing Tools

### Browser DevTools
```
Chrome DevTools → Device Mode
- iPhone 12 Pro (390x844)
- iPhone SE (375x667)
- Pixel 5 (393x851)
- iPad Air (820x1180)
```

### Real Device Testing
- Use BrowserStack or similar
- Test on actual iOS and Android devices
- Test different screen sizes
- Test different OS versions

### Lighthouse Audit
```bash
# Run Lighthouse for mobile
lighthouse https://phrames.cleffon.com --preset=mobile --view
```

Check for:
- Performance > 90
- Accessibility > 90
- Best Practices > 90
- SEO > 90

## 📊 Expected Results

### Mobile Scores
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### User Satisfaction
- Users can complete tasks easily
- No confusion about how to use features
- Positive feedback on mobile experience
- High engagement on mobile devices

---

**Note**: Focus testing on the Campaign View page (/campaign/[slug]) as this is where users spend most time and interact with the core feature (photo framing).
