# Profile Image System - Quick Reference

## 🎯 Image Priority
```
profileImageUrl → googlePhotoURL → Fallback Avatar
```

## 📁 Storage Path
```
/profile-images/{uid}.webp
```

## 🔧 Key Functions

### Upload Image
```typescript
import { compressImage } from '@/lib/image-compression'
import { uploadImage } from '@/lib/storage'

const file = e.target.files[0]
const compressed = await compressImage(file)
const url = await uploadImage(compressed, `profile-images/${uid}.webp`)
```

### Remove Image
```typescript
import { deleteImage } from '@/lib/storage'

await deleteImage(`profile-images/${uid}.webp`)
await updateProfile({ profileImageUrl: null })
```

### Display Avatar
```typescript
import Avatar from '@/components/Avatar'

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

## 📊 Compression Settings
```typescript
{
  maxWidth: 500,
  maxHeight: 500,
  maxSizeKB: 300,
  quality: 0.85,
  format: 'webp'
}
```

## 🔒 Storage Rules
```javascript
// Read: Public
allow read: if true;

// Write: Owner only, 1MB max
allow create, update: if isAuthenticated() && 
                        isImage() &&
                        request.resource.size < 1 * 1024 * 1024 &&
                        fileName.matches('^' + request.auth.uid + '\\.webp$');

// Delete: Owner only
allow delete: if isAuthenticated() && 
                fileName.matches('^' + request.auth.uid + '\\.webp$');
```

## 🚀 Deployment
```bash
# Deploy storage rules
firebase deploy --only storage

# Deploy app
vercel --prod
```

## ✅ Validation
```typescript
// Client-side
validateProfileImage(file)
// Checks: type, size <5MB

// Server-side (Firebase rules)
// Enforces: 1MB max, owner-only, .webp extension
```

## 📈 Performance Targets
- Upload: <5s
- Display: <1s
- File size: ≤300KB
- Storage/user: ~200KB

## 🐛 Debug Commands
```javascript
// Check user data
const userDoc = await getDoc(doc(db, 'users', uid))
console.log(userDoc.data())

// Check storage
// Firebase Console → Storage → profile-images/

// Check compression
console.log('Original:', file.size / 1024, 'KB')
console.log('Compressed:', compressed.size / 1024, 'KB')
```

## 📝 Database Schema
```typescript
interface User {
  uid: string
  displayName?: string
  username?: string
  googlePhotoURL?: string | null  // Never overwritten
  profileImageUrl?: string | null // Custom upload
  bio?: string
  location?: string
  website?: string
  createdAt: Timestamp
}
```

## 🎨 Avatar Sizes
```typescript
'sm': 32px   // Lists, comments
'md': 48px   // Default
'lg': 96px   // Profile cards
'xl': 128px  // Profile pages
```

## 🔄 User Flow

### Upload
1. Select image (JPG/PNG/WEBP)
2. Validate (<5MB)
3. Compress to WebP (≤300KB)
4. Upload to Storage
5. Save URL to Firestore
6. Display in UI

### Remove
1. Click "Remove Custom Image"
2. Delete from Storage
3. Set profileImageUrl = null
4. Fallback to googlePhotoURL
5. Or show gradient avatar

## 💰 Cost Optimization
- Google photos: **0 bytes** (direct link)
- Custom uploads: **~200KB** average
- 10K users = **~2GB** storage
- Cache: 7 days (Firebase) + 1 year (Next.js)
- WebP: **25-35% smaller** than JPEG

## 🔗 Related Files
- `lib/image-compression.ts` - Compression
- `lib/avatar.ts` - Display logic
- `components/Avatar.tsx` - Component
- `app/dashboard/profile/page.tsx` - Upload UI
- `storage.rules` - Security
- `PROFILE_IMAGE_OPTIMIZATION.md` - Full docs
- `PROFILE_IMAGE_TESTING_GUIDE.md` - Testing

## 🆘 Common Issues

### Upload fails
- Check Firebase rules deployed
- Verify user authenticated
- Check file size <5MB

### Image not showing
- Check URL in Firestore
- Verify storage rules allow read
- Check browser console for errors

### Compression slow
- Normal for large images (1-3s)
- Show progress indicator
- Consider reducing max dimensions

### File size >300KB
- Lower quality setting
- Reduce max dimensions
- Check image complexity
