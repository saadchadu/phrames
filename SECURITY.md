# Security Guide

This document outlines the security measures implemented in Phrames and best practices for maintaining security.

## 🔒 Security Features

### 1. Authentication & Authorization

- **Firebase Authentication**: Secure user authentication with email/password and Google OAuth
- **Protected Routes**: AuthGuard component prevents unauthorized access to protected pages
- **Session Management**: Automatic session handling with Firebase Auth
- **Password Requirements**: Minimum 6 characters (enforced by Firebase)

### 2. Database Security (Firestore)

**Security Rules** (`firestore.rules`):
- Users can only create/update/delete their own data
- Campaign owners have full control over their campaigns
- Public read access for campaigns (required for sharing)
- Input validation at the database level
- Prevents unauthorized data modification

**Key Rules**:
```
- Users can only modify their own profile
- Only authenticated users can create campaigns
- Only campaign owners can edit/delete their campaigns
- Slug format validation (lowercase, numbers, hyphens only)
- URL validation (must be HTTPS)
- Field type and length validation
```

### 3. Storage Security (Firebase Storage)

**Security Rules** (`storage.rules`):
- Users can only upload to their own folders
- File type validation (images only)
- File size limit (10MB max)
- Public read access for campaign images
- Authenticated write access only

### 4. Input Validation & Sanitization

**Client-Side** (`lib/security.ts`):
- Email format validation
- URL validation
- Slug sanitization (removes special characters)
- Campaign name length limits (100 chars)
- Image file validation
- XSS prevention (HTML escaping)

**Validation Functions**:
- `sanitizeString()` - Remove HTML tags and trim
- `sanitizeSlug()` - Convert to URL-safe format
- `isValidEmail()` - Email format check
- `isValidURL()` - URL format check
- `isValidImageFile()` - File type and size check

### 5. HTTP Security Headers

**Configured in** `next.config.js`:
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options` - Prevent clickjacking
- `X-Content-Type-Options` - Prevent MIME sniffing
- `X-XSS-Protection` - XSS filter
- `Referrer-Policy` - Control referrer information
- `Permissions-Policy` - Disable unnecessary browser features

### 6. Rate Limiting

**Client-Side Rate Limiter** (`lib/security.ts`):
- Prevents brute force attacks
- Configurable attempt limits
- Time-window based throttling
- Per-action rate limiting

### 7. Image Processing Security

- **Client-side processing**: Images processed in browser (no server uploads)
- **Canvas API**: Secure image manipulation
- **CORS handling**: Proper cross-origin resource handling
- **File validation**: Type and size checks before processing

### 8. Environment Variables

**Protected Secrets**:
- Firebase credentials in `.env.local`
- Never committed to version control
- Server-side only variables (if needed)
- Public variables prefixed with `NEXT_PUBLIC_`

## 🛡️ Security Best Practices

### For Developers

1. **Never commit secrets**
   ```bash
   # Always use .env.local for sensitive data
   # Check .gitignore includes .env.local
   ```

2. **Validate all inputs**
   ```typescript
   import { sanitizeString, isValidEmail } from '@/lib/security'
   
   const cleanInput = sanitizeString(userInput, 100)
   if (!isValidEmail(email)) {
     // Handle invalid email
   }
   ```

3. **Use security utilities**
   ```typescript
   import { RateLimiter } from '@/lib/security'
   
   const limiter = new RateLimiter(5, 60000) // 5 attempts per minute
   if (!limiter.canAttempt(userId)) {
     // Rate limit exceeded
   }
   ```

4. **Deploy security rules**
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   
   # Deploy Storage rules
   firebase deploy --only storage
   ```

### For Users

1. **Use strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers
   - Avoid common passwords

2. **Enable 2FA** (if available in Firebase project)

3. **Keep browser updated**

4. **Use HTTPS only**

## 🚨 Security Checklist

### Before Deployment

- [ ] Deploy Firestore security rules
- [ ] Deploy Storage security rules
- [ ] Verify all environment variables are set
- [ ] Enable Firebase App Check (optional but recommended)
- [ ] Set up Firebase Security Rules testing
- [ ] Review and update CORS settings
- [ ] Enable Firebase Authentication email verification
- [ ] Set up monitoring and alerts
- [ ] Review all public API endpoints
- [ ] Test authentication flows

### Regular Maintenance

- [ ] Review Firebase security rules monthly
- [ ] Update dependencies regularly
- [ ] Monitor Firebase usage for anomalies
- [ ] Review user reports and logs
- [ ] Update security headers as needed
- [ ] Audit user permissions
- [ ] Check for security advisories

## 🔍 Security Testing

### Manual Testing

1. **Authentication**
   ```
   - Try accessing protected routes without login
   - Test password reset flow
   - Verify session expiration
   ```

2. **Authorization**
   ```
   - Try editing another user's campaign
   - Try deleting another user's data
   - Test visibility settings
   ```

3. **Input Validation**
   ```
   - Submit forms with XSS payloads
   - Try SQL injection patterns
   - Test with oversized files
   - Submit invalid email formats
   ```

### Automated Testing

```bash
# Run Firebase emulator with security rules
firebase emulators:start --only firestore,storage

# Test security rules
npm run test:security
```

## 📊 Monitoring

### Firebase Console

- Monitor authentication attempts
- Check for unusual storage access patterns
- Review Firestore read/write metrics
- Set up alerts for suspicious activity

### Application Logs

- Log failed authentication attempts
- Track rate limit violations
- Monitor error rates
- Review user-reported issues

## 🐛 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@cleffon.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 📚 Additional Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 🔄 Updates

This security guide is regularly updated. Last updated: 2024

---

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant and keep your dependencies updated!
