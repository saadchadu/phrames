/**
 * Avatar utility functions for profile images
 */

export interface UserAvatarData {
  profileImageUrl?: string | null
  googlePhotoURL?: string | null
  displayName?: string
  username?: string
}

/**
 * Get the profile image URL based on priority:
 * 1. Custom uploaded image (profileImageUrl)
 * 2. Google profile photo (googlePhotoURL)
 * 3. null (will show fallback avatar)
 */
export function getProfileImageUrl(user: UserAvatarData): string | null {
  if (user.profileImageUrl) {
    return user.profileImageUrl
  }
  if (user.googlePhotoURL) {
    return user.googlePhotoURL
  }
  return null
}

/**
 * Check if image URL is from Google and needs proxy
 */
export function needsImageProxy(url: string | null): boolean {
  if (!url) return false
  return url.includes('googleusercontent.com')
}

/**
 * Get proxied image URL for Google images
 */
export function getProxiedImageUrl(url: string | null): string | null {
  if (!url) return null
  if (needsImageProxy(url)) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`
  }
  return url
}

/**
 * Get display image URL (with proxy if needed)
 */
export function getDisplayImageUrl(user: UserAvatarData): string | null {
  const imageUrl = getProfileImageUrl(user)
  return getProxiedImageUrl(imageUrl)
}

/**
 * Get initials for fallback avatar
 */
export function getInitials(user: UserAvatarData): string {
  const name = user.displayName || user.username || 'U'
  return name.charAt(0).toUpperCase()
}

/**
 * Get gradient background for fallback avatar
 */
export function getAvatarGradient(user: UserAvatarData): string {
  const name = user.displayName || user.username || 'User'
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  const hue = Math.abs(hash % 360)
  return `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 30) % 360}, 70%, 50%))`
}

/**
 * Check if user has a custom uploaded image
 */
export function hasCustomImage(user: UserAvatarData): boolean {
  return !!user.profileImageUrl
}

/**
 * Check if user has a Google photo
 */
export function hasGooglePhoto(user: UserAvatarData): boolean {
  return !!user.googlePhotoURL
}
