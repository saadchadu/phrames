# Profile Image Optimization System

## Overview
Cost-optimized profile image system that prioritizes Google photoURL and compresses custom uploads to WebP format.

## Image Priority Logic

```
if (profileImageUrl exists) {
  → Use custom uploaded image
} else if (googlePhotoURL exists) {
  → Use Google profile photo
} else {
  → Show fallback avatar (gradient with initials)
}
```

## Database Structure

### Firestore `/users/{uid}`
```typescript
{
  displayName: string
  username: string
  googlePhotoURL: string | null  // Stored on signup, never overwritten
  profileImageUrl: string | null // Custom uploaded image URL
  bio: string
  location: string
  website: string
  createdAt: Timestamp
}
```

## Image Upload Optimization

### Client-Side Compression (`lib/image-compression.ts`)
- Validates file type (JPG, PNG, WEBP)
- Rejects files > 5MB before processing
- Resizes to max 500x500px
- Converts to WebP format
- Compresses to ≤300KB
- Strips EXIF metadata automatically

### Storage Path
```
/profile-images/{uid}.webp
```
- Consistent naming
- Overwrites on update (no duplicates)
- Easy to delete

## Firebase Storage Rules

```javascript
match /profile-images/{fileName} {
  // Public read for profile display
  allow read: if true;
  
  // Only owner can upload/update (max 1MB)
  allow create, update: if isAuthenticated() && 
                          isImage() &&
                          request.resource.size < 1 * 1024 * 1024 &&
                          fileName.matches('^' + request.auth.uid + '\\.webp$');
  
  // Only owner can delete
  allow delete: if isAuthenticated() && 
                  fileName.matches('^' + request.auth.uid + '\\.webp$');
}
```

## Remove Custom Image

When user clicks "Remove Custom Image":
1. Delete file from Firebase Storage (`profile-images/{uid}.webp`)
2. Set `profileImageUrl = null` in Firestore
3. System automatically falls back to `googlePhotoURL`

## Avatar Component

### Features
- Uses Next.js `Image` component for optimization
- Lazy loading enabled
- Proper width/height attributes
- Fallback to gradient avatar with initials
- Error handling for failed image loads

### Sizes
- `sm`: 32x32px (8x8 Tailwind)
- `md`: 48x48px (12x12 Tailwind)
- `lg`: 96x96px (24x24 Tailwind)
- `xl`: 128x128px (32x32 Tailwind)

## Bandwidth Optimization

### Next.js Image Optimization
```typescript
<Image
  src={imageUrl}
  width={pixelSize}
  height={pixelSize}
  loading="lazy"
  unoptimized={imageUrl.includes('googleusercontent.com')}
/>
```

### Cache Headers
- Firebase Storage: 7 days cache
- Next.js images: 1 year cache (configured in `next.config.js`)

## Cost Benefits

### Storage Savings
- Google photos: 0 bytes (direct link)
- Custom uploads: ~100-300KB (vs 2-5MB uncompressed)
- Single file per user (no versions)

### Bandwidth Savings
- WebP format: 25-35% smaller than JPEG
- Lazy loading: Only loads when visible
- Next.js optimization: Serves optimal size per device
- Long cache duration: Reduces repeat downloads

## Implementation Files

### Core Files
- `lib/image-compression.ts` - Compression utilities
- `lib/avatar.ts` - Avatar logic and helpers
- `components/Avatar.tsx` - Avatar display component
- `app/dashboard/profile/page.tsx` - Profile edit page
- `app/api/profile/update/route.ts` - Profile update API

### Configuration
- `storage.rules` - Firebase Storage security rules
- `next.config.js` - Next.js image optimization config

## Usage Example

### Upload Custom Image
```typescript
const file = e.target.files[0]
const compressedFile = await compressImage(file)
const url = await uploadImage(compressedFile, `profile-images/${uid}.webp`)
await updateProfile({ profileImageUrl: url })
```

### Remove Custom Image
```typescript
await deleteImage(`profile-images/${uid}.webp`)
await updateProfile({ profileImageUrl: null })
// System automatically shows googlePhotoURL
```

### Display Avatar
```typescript
<Avatar 
  user={{
    profileImageUrl: user.profileImageUrl,
    googlePhotoURL: user.googlePhotoURL,
    displayName: user.displayName,
    username: user.username
  }}
  size="lg"
  showBorder
/>
```

## Performance Metrics

### Target Metrics
- ✅ Image size: ≤300KB
- ✅ Upload time: <3 seconds
- ✅ Load time: <500ms (cached)
- ✅ Storage per user: ~200KB average
- ✅ Bandwidth per view: ~50KB (with cache)

### Scalability
- 10,000 users = ~2GB storage
- 100,000 users = ~20GB storage
- Minimal bandwidth cost with caching

## Security

### Upload Validation
- Client-side: File type, size, dimensions
- Server-side: Firebase rules enforce 1MB max
- Path validation: Only `{uid}.webp` allowed

### Access Control
- Read: Public (for profile display)
- Write: Owner only
- Delete: Owner only

## Fallback Avatar

When no image is available:
- Shows first letter of displayName or username
- Gradient background (deterministic based on name)
- Consistent colors per user
- Professional appearance

## Testing Checklist

- [ ] Upload JPG → converts to WebP
- [ ] Upload PNG → converts to WebP
- [ ] Upload >5MB → rejected
- [ ] Final size ≤300KB
- [ ] Remove custom image → shows Google photo
- [ ] No Google photo → shows fallback
- [ ] Image loads with lazy loading
- [ ] Cache headers present
- [ ] Storage rules enforce ownership
- [ ] Duplicate upload overwrites old file

## Deployment

1. Deploy storage rules:
   ```bash
   firebase deploy --only storage
   ```

2. Verify Next.js config includes Firebase Storage domain

3. Test image upload and compression

4. Monitor storage usage in Firebase Console

## Monitoring

### Firebase Console
- Storage usage: `/profile-images/`
- File count: Should equal active users
- Bandwidth: Monitor download patterns

### Performance
- Image load times in browser DevTools
- Compression ratio (original vs final size)
- Cache hit rate

## Future Enhancements

- [ ] Progressive image loading (blur placeholder)
- [ ] Image cropping tool
- [ ] Multiple image sizes (thumbnail, full)
- [ ] CDN integration for faster delivery
- [ ] Automatic cleanup of deleted user images
