# Deployment Guide for Phrames

## Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password provider
   - Create a service account key for Firebase Admin SDK
   - Note down all configuration values

2. **Database Setup**
   - Set up a PostgreSQL database (recommended: Supabase, Railway, or Neon)
   - Run migrations: `npx prisma migrate deploy`

3. **Storage Setup**
   - Set up S3-compatible storage (Cloudflare R2 recommended)
   - Create a bucket for assets
   - Configure CORS for web uploads

## Vercel Deployment

### 1. Connect Repository
- Import your repository to Vercel
- Select "Nuxt.js" as the framework preset

### 2. Environment Variables
Add all environment variables from `.env.example`:

**Database & Storage:**
```
DATABASE_URL=your_postgresql_connection_string
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_r2_access_key
S3_SECRET_ACCESS_KEY=your_r2_secret_key
S3_BUCKET=phrames-assets
S3_PUBLIC_BASE_URL=https://your-custom-domain.com/
NUXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
```

**Firebase Configuration:**
```
NUXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

### 3. Build Settings
- **Framework Preset**: Nuxt.js
- **Build Command**: `npm run build`
- **Output Directory**: (leave blank)
- **Install Command**: `npm install`

### 4. Domain Configuration
- Add custom domain: `phrames.cleffon.com`
- Configure DNS: CNAME `phrames` → `cname.vercel-dns.com`

## Post-Deployment Checklist

### 1. Database Migration
```bash
npx prisma migrate deploy
```

### 2. Firebase Security Rules
Update Firestore security rules if using Firestore for user data:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. CORS Configuration
Configure CORS for your S3 bucket to allow web uploads:
```json
[
  {
    "AllowedOrigins": ["https://phrames.cleffon.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Test Core Functionality
- [ ] User signup/login works
- [ ] Campaign creation works
- [ ] Image upload works
- [ ] Public campaign pages load
- [ ] Image composition works
- [ ] Download functionality works
- [ ] Analytics tracking works

### 5. Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Configure CDN caching headers
- [ ] Optimize images with Vercel Image Optimization
- [ ] Monitor Core Web Vitals

### 6. Security Checklist
- [ ] All environment variables are secure
- [ ] Firebase security rules are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is in place
- [ ] Input validation is working

## Monitoring & Maintenance

### Error Tracking
Consider adding error tracking:
- Sentry for error monitoring
- Vercel Analytics for performance
- Firebase Analytics for user behavior

### Database Maintenance
- Regular backups
- Monitor query performance
- Clean up old data periodically

### Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment

## Troubleshooting

### Common Issues

1. **Firebase Auth not working**
   - Check Firebase configuration
   - Verify domain is added to authorized domains
   - Check browser console for errors

2. **Database connection issues**
   - Verify DATABASE_URL is correct
   - Check database server status
   - Ensure migrations are applied

3. **Image upload failures**
   - Check S3 credentials
   - Verify CORS configuration
   - Check bucket permissions

4. **Build failures**
   - Check all environment variables are set
   - Verify Node.js version compatibility
   - Check for TypeScript errors

### Support
For deployment issues, check:
- Vercel deployment logs
- Browser developer console
- Server logs in Vercel dashboard