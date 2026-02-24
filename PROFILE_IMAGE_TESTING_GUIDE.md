# Profile Image System - Testing Guide

## Pre-Deployment Checklist

### 1. Code Review
- [x] `lib/image-compression.ts` - Compression logic
- [x] `components/Avatar.tsx` - Display component
- [x] `app/dashboard/profile/page.tsx` - Upload UI
- [x] `app/api/profile/update/route.ts` - API endpoint
- [x] `storage.rules` - Security rules
- [x] No TypeScript errors

### 2. Build Verification
```bash
npm run build
```
Expected: No errors, successful build

## Deployment Steps

### Step 1: Deploy Storage Rules
```bash
chmod +x deploy-storage-rules.sh
./deploy-storage-rules.sh
```

Or manually:
```bash
firebase deploy --only storage
```

### Step 2: Deploy Application
```bash
# Vercel
vercel --prod

# Or your deployment method
npm run deploy
```

### Step 3: Verify Deployment
- Check Firebase Console → Storage → Rules
- Verify rules updated timestamp
- Check application is live

## Testing Scenarios

### Test 1: Upload JPG Image
**Steps:**
1. Go to `/dashboard/profile`
2. Click "Upload Image"
3. Select a JPG file (2-3MB)
4. Wait for compression

**Expected Results:**
- ✅ Shows "Compressing image..." toast
- ✅ Shows final file size (e.g., "150KB")
- ✅ Image appears in preview
- ✅ File stored as `{uid}.webp` in Storage
- ✅ Final size ≤300KB
- ✅ Image displays correctly

**Verify:**
```
Firebase Console → Storage → profile-images/
- File name: {your-uid}.webp
- Size: ~100-300KB
- Type: image/webp
```

### Test 2: Upload PNG Image
**Steps:**
1. Go to `/dashboard/profile`
2. Click "Upload Image" or "Change Image"
3. Select a PNG file (1-2MB)
4. Wait for compression

**Expected Results:**
- ✅ Converts PNG to WebP
- ✅ Maintains transparency if present
- ✅ Final size ≤300KB
- ✅ Overwrites previous image
- ✅ Same filename: `{uid}.webp`

### Test 3: Upload Large File (>5MB)
**Steps:**
1. Go to `/dashboard/profile`
2. Try to upload a file >5MB

**Expected Results:**
- ✅ Shows error: "File size must be less than 5MB"
- ✅ No upload occurs
- ✅ Previous image unchanged

### Test 4: Upload Invalid File Type
**Steps:**
1. Try to upload a PDF, GIF, or other non-image file

**Expected Results:**
- ✅ Shows error: "Please select a JPG, PNG, or WEBP image"
- ✅ No upload occurs

### Test 5: Remove Custom Image (With Google Photo)
**Prerequisites:** User logged in with Google, has custom image uploaded

**Steps:**
1. Go to `/dashboard/profile`
2. Click "Remove Custom Image"
3. Click "Save Changes"

**Expected Results:**
- ✅ Shows toast: "Custom image removed. Google photo will be used."
- ✅ File deleted from Storage
- ✅ Preview shows Google photo
- ✅ After save, profile uses Google photo
- ✅ Public profile shows Google photo

**Verify:**
```
Firebase Console → Storage → profile-images/
- File {uid}.webp should be deleted

Firestore → users → {uid}
- profileImageUrl: null
- googlePhotoURL: "https://lh3.googleusercontent.com/..."
```

### Test 6: Remove Custom Image (No Google Photo)
**Prerequisites:** User without Google photo, has custom image

**Steps:**
1. Upload custom image
2. Click "Remove Custom Image"
3. Save changes

**Expected Results:**
- ✅ Custom image removed
- ✅ Shows fallback avatar (gradient + initials)
- ✅ Fallback has consistent colors

### Test 7: Google Photo Priority
**Prerequisites:** User logged in with Google (no custom image)

**Steps:**
1. Go to `/dashboard/profile`
2. Observe profile image

**Expected Results:**
- ✅ Shows Google profile photo
- ✅ Indicator: "✓ Using Google profile photo"
- ✅ No storage used
- ✅ Image loads via proxy if needed

### Test 8: Image Display on Public Profile
**Steps:**
1. Upload custom image
2. Save profile
3. Visit `/user/{username}` (public profile)

**Expected Results:**
- ✅ Custom image displays
- ✅ Uses Next.js Image component
- ✅ Lazy loading enabled
- ✅ Proper dimensions
- ✅ Fast load time

### Test 9: Fallback Avatar
**Prerequisites:** User with no images

**Steps:**
1. Create account without Google
2. Don't upload custom image
3. View profile

**Expected Results:**
- ✅ Shows gradient circle
- ✅ First letter of name/username
- ✅ Consistent colors per user
- ✅ Professional appearance

### Test 10: Image Compression Quality
**Steps:**
1. Upload high-quality image (5MB, 4000x3000px)
2. Check compressed result

**Expected Results:**
- ✅ Resized to max 500x500px
- ✅ Converted to WebP
- ✅ Size ≤300KB
- ✅ Good visual quality
- ✅ No visible artifacts

### Test 11: Multiple Uploads (Overwrite)
**Steps:**
1. Upload image A
2. Upload image B
3. Upload image C

**Expected Results:**
- ✅ Each upload overwrites previous
- ✅ Only one file in Storage: `{uid}.webp`
- ✅ No duplicate files
- ✅ Latest image displays

### Test 12: Security - Upload to Another User's Path
**Steps:**
1. Try to upload to `profile-images/{other-uid}.webp`

**Expected Results:**
- ✅ Firebase rules block the upload
- ✅ Error: Permission denied
- ✅ Only own UID allowed

### Test 13: Security - Delete Another User's Image
**Steps:**
1. Try to delete `profile-images/{other-uid}.webp`

**Expected Results:**
- ✅ Firebase rules block deletion
- ✅ Error: Permission denied

### Test 14: Performance - Lazy Loading
**Steps:**
1. Open page with multiple avatars
2. Open DevTools → Network
3. Scroll down slowly

**Expected Results:**
- ✅ Images load only when visible
- ✅ `loading="lazy"` attribute present
- ✅ Reduced initial page load

### Test 15: Performance - Cache Headers
**Steps:**
1. Load profile page
2. Check Network tab → Image request
3. Reload page

**Expected Results:**
- ✅ First load: Downloads image
- ✅ Second load: Loads from cache
- ✅ Cache-Control headers present
- ✅ Fast subsequent loads

## Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive design

## Performance Benchmarks

### Upload Performance
```
Test Image: 3MB JPG, 3000x2000px
Expected Timeline:
- Validation: <100ms
- Compression: 1-2 seconds
- Upload: 1-2 seconds
- Total: <5 seconds
```

### Display Performance
```
Expected Metrics:
- First load: <1 second
- Cached load: <100ms
- Lazy load trigger: When in viewport
- Image size: 100-300KB
```

## Monitoring After Deployment

### Firebase Console Checks

#### Storage Usage
```
Path: Storage → Files → profile-images/
Check:
- File count ≈ active users
- File sizes: 100-300KB each
- All files: .webp format
- No orphaned files
```

#### Storage Rules
```
Path: Storage → Rules
Verify:
- Last updated: Today
- Rules match storage.rules file
```

### Application Monitoring

#### User Feedback
- Monitor for upload errors
- Check compression quality complaints
- Verify image display issues

#### Performance
- Page load times
- Image load times
- Compression duration
- Upload success rate

## Troubleshooting

### Issue: Upload Fails
**Check:**
1. Firebase Storage rules deployed?
2. User authenticated?
3. File size <5MB?
4. Valid image format?

**Debug:**
```javascript
// Browser console
console.log('User UID:', user.uid)
console.log('File size:', file.size)
console.log('File type:', file.type)
```

### Issue: Image Not Displaying
**Check:**
1. URL in Firestore correct?
2. Storage rules allow read?
3. Image proxy working?
4. Network errors?

**Debug:**
```javascript
// Check Firestore
const userDoc = await getDoc(doc(db, 'users', uid))
console.log('Profile data:', userDoc.data())
```

### Issue: Compression Too Slow
**Check:**
1. Image size reasonable?
2. Browser performance?
3. Canvas API supported?

**Optimize:**
- Reduce max dimensions
- Lower quality setting
- Show progress indicator

### Issue: File Size >300KB
**Check:**
1. Compression quality setting
2. Image complexity (high detail)
3. Dimensions too large

**Fix:**
- Lower quality to 0.7
- Reduce max dimensions to 400x400
- Try multiple compression passes

## Success Criteria

### Functional Requirements
- [x] Upload JPG/PNG/WEBP
- [x] Convert to WebP
- [x] Compress to ≤300KB
- [x] Remove custom image
- [x] Fallback to Google photo
- [x] Show gradient avatar
- [x] Public profile display

### Performance Requirements
- [x] Upload <5 seconds
- [x] Display <1 second
- [x] File size ≤300KB
- [x] Lazy loading works
- [x] Cache enabled

### Security Requirements
- [x] Owner-only write
- [x] Public read
- [x] File size limits
- [x] Path validation
- [x] Type validation

### UX Requirements
- [x] Clear feedback
- [x] Progress indicators
- [x] Error messages
- [x] Image preview
- [x] Source indicator

## Post-Launch Monitoring

### Week 1
- Monitor upload success rate
- Check average file sizes
- Verify storage costs
- Collect user feedback

### Month 1
- Analyze storage growth
- Review bandwidth usage
- Check compression quality
- Optimize if needed

### Ongoing
- Monitor Firebase costs
- Clean up orphaned files
- Update compression settings
- Improve UX based on feedback

## Rollback Plan

If issues occur:

### 1. Revert Storage Rules
```bash
git checkout HEAD~1 storage.rules
firebase deploy --only storage
```

### 2. Revert Code
```bash
git revert <commit-hash>
git push
```

### 3. Redeploy
```bash
vercel --prod
```

## Support Resources

### Documentation
- `PROFILE_IMAGE_OPTIMIZATION.md` - Full system docs
- `PROFILE_IMAGE_IMPLEMENTATION_SUMMARY.md` - Quick reference
- Firebase Storage docs: https://firebase.google.com/docs/storage

### Code Files
- `lib/image-compression.ts` - Compression logic
- `components/Avatar.tsx` - Display component
- `storage.rules` - Security rules

### Monitoring
- Firebase Console: https://console.firebase.google.com
- Vercel Dashboard: https://vercel.com/dashboard
- Browser DevTools: Network & Console tabs
