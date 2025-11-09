# Security Setup Guide - Quick Start

## 🚀 Quick Setup (5 minutes)

### Step 1: Deploy Security Rules

```bash
# Make the script executable (already done)
chmod +x deploy-security.sh

# Run the deployment script
./deploy-security.sh
```

Or manually:
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### Step 2: Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Check **Firestore Database** → **Rules** tab
4. Check **Storage** → **Rules** tab
5. Verify rules are active

### Step 3: Test Security

Try these tests to verify security is working:

**Test 1: Unauthorized Access**
- Log out of your app
- Try to access `/dashboard`
- Should redirect to login ✅

**Test 2: Campaign Ownership**
- Create a campaign as User A
- Log in as User B
- Try to edit User A's campaign
- Should fail ✅

**Test 3: File Upload**
- Try uploading a non-image file
- Should be rejected ✅

**Test 4: Invalid Input**
- Try creating a campaign with special characters in slug
- Should be sanitized automatically ✅

## 📋 What's Been Implemented

### ✅ Files Created

1. **firestore.rules** - Database security rules
2. **storage.rules** - File storage security rules
3. **lib/security.ts** - Security utilities and validation
4. **SECURITY.md** - Comprehensive security documentation
5. **deploy-security.sh** - Automated deployment script
6. **next.config.js** - Updated with security headers

### ✅ Security Features

- **Authentication**: Firebase Auth with protected routes
- **Authorization**: User-based access control
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: HTML escaping and sanitization
- **CSRF Protection**: Firebase Auth tokens
- **Rate Limiting**: Client-side rate limiter
- **Secure Headers**: HTTP security headers
- **File Validation**: Type and size checks
- **SQL Injection**: N/A (using Firestore, not SQL)

## 🔒 Security Rules Summary

### Firestore Rules

```
✅ Users can only modify their own data
✅ Only authenticated users can create campaigns
✅ Only campaign owners can edit/delete campaigns
✅ Input validation (slug format, URL format, etc.)
✅ Public read access for campaigns (required for sharing)
```

### Storage Rules

```
✅ Users can only upload to their own folders
✅ Image files only (validated)
✅ 10MB file size limit
✅ Public read access for campaign images
✅ Authenticated write access only
```

## 🛡️ Security Headers

Your app now sends these security headers:

- `Strict-Transport-Security` - Forces HTTPS
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-XSS-Protection` - XSS filter
- `Referrer-Policy` - Controls referrer info
- `Permissions-Policy` - Disables unnecessary features

## 🔍 How to Use Security Utilities

### Sanitize User Input

```typescript
import { sanitizeString, sanitizeSlug } from '@/lib/security'

// Sanitize general text
const cleanText = sanitizeString(userInput, 100)

// Sanitize URL slugs
const cleanSlug = sanitizeSlug(userInput)
```

### Validate Input

```typescript
import { isValidEmail, isValidURL, isValidSlug } from '@/lib/security'

if (!isValidEmail(email)) {
  setError('Invalid email format')
}

if (!isValidSlug(slug)) {
  setError('Invalid slug format')
}
```

### Rate Limiting

```typescript
import { RateLimiter } from '@/lib/security'

const limiter = new RateLimiter(5, 60000) // 5 attempts per minute

if (!limiter.canAttempt(userId)) {
  setError('Too many attempts. Please try again later.')
  return
}
```

### Validate Files

```typescript
import { isValidImageFile } from '@/lib/security'

const validation = isValidImageFile(file)
if (!validation.valid) {
  setError(validation.error)
  return
}
```

## ⚠️ Important Notes

1. **Deploy Rules First**: Always deploy security rules before going live
2. **Test Thoroughly**: Test all security features before production
3. **Monitor Usage**: Check Firebase Console regularly for anomalies
4. **Update Dependencies**: Keep all packages up to date
5. **Review Rules**: Review security rules monthly

## 🆘 Troubleshooting

### "Permission Denied" Errors

**Problem**: Users getting permission denied when accessing data

**Solution**:
1. Check if security rules are deployed
2. Verify user is authenticated
3. Check if user owns the resource
4. Review Firestore rules in Firebase Console

### Rules Not Working

**Problem**: Security rules don't seem to be active

**Solution**:
```bash
# Redeploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage

# Check deployment status
firebase projects:list
```

### File Upload Fails

**Problem**: Can't upload images

**Solution**:
1. Check file size (must be < 10MB)
2. Check file type (must be image/*)
3. Verify Storage rules are deployed
4. Check Firebase Storage bucket exists

## 📚 Next Steps

1. ✅ Deploy security rules (done above)
2. ✅ Test security features
3. 📖 Read full [SECURITY.md](./SECURITY.md) documentation
4. 🔄 Set up monitoring in Firebase Console
5. 📧 Configure email verification (optional)
6. 🔐 Enable 2FA for admin accounts (recommended)

## 🎉 You're Secure!

Your Phrames app now has enterprise-level security! 

For detailed information, see [SECURITY.md](./SECURITY.md)

---

**Questions?** Check the full security documentation or Firebase docs.
