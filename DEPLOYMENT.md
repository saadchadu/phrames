# Deployment Guide - Phrames Next.js App

This guide will help you deploy your Phrames application to production using Vercel or Firebase Hosting.

## 🚀 Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- Firebase project set up

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `next-app` (if in monorepo)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Add Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## 🔥 Deploy to Firebase Hosting

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created

### Step 1: Initialize Firebase Hosting
```bash
cd next-app
firebase login
firebase init hosting
```

Select:
- Use an existing project
- Choose your Firebase project
- Public directory: `out`
- Configure as single-page app: Yes
- Set up automatic builds: No

### Step 2: Configure Next.js for Static Export
Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### Step 3: Build and Deploy
```bash
npm run build
firebase deploy
```

## 🔧 Production Configuration

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Campaigns collection
    match /campaigns/{campaignId} {
      allow read: if resource.data.visibility == 'Public' || 
                     (request.auth != null && request.auth.uid == resource.data.createdBy);
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.createdBy &&
                       validateCampaign(request.resource.data);
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.createdBy &&
                       validateCampaign(request.resource.data);
      allow delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
  }
  
  function validateCampaign(data) {
    return data.keys().hasAll(['campaignName', 'slug', 'visibility', 'frameURL', 'status', 'createdBy']) &&
           data.campaignName is string &&
           data.slug is string &&
           data.visibility in ['Public', 'Unlisted'] &&
           data.frameURL is string &&
           data.status in ['Active', 'Inactive'] &&
           data.createdBy is string;
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /campaigns/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024 && // 10MB limit
                      request.resource.contentType.matches('image/png');
    }
  }
}
```

### Environment Variables for Production

#### Required Variables
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔒 Security Checklist

### Before Going Live

- [ ] Firebase security rules are properly configured
- [ ] Environment variables are set in production
- [ ] Firebase Auth domains include your production domain
- [ ] CORS is configured for your domain in Firebase
- [ ] SSL certificate is active (automatic with Vercel/Firebase)
- [ ] Error monitoring is set up (optional: Sentry)

### Firebase Console Settings

1. **Authentication**:
   - Add your production domain to authorized domains
   - Configure OAuth redirect URIs for Google sign-in

2. **Firestore**:
   - Deploy security rules
   - Set up indexes if needed

3. **Storage**:
   - Deploy security rules
   - Configure CORS if needed

## 📊 Performance Optimization

### Next.js Optimizations
```javascript
// next.config.js
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable experimental features
  experimental: {
    optimizeCss: true,
  },
}
```

### Firebase Performance
- Enable Firebase Performance Monitoring
- Use Firebase CDN for global distribution
- Implement proper caching strategies

## 🐛 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
- Ensure all `NEXT_PUBLIC_` variables are set
- Check for typos in variable names
- Verify Firebase project configuration

#### Firebase Connection Issues
- Check Firebase project ID matches environment
- Verify API keys are correct
- Ensure Firebase services are enabled

### Debug Production Issues

#### Enable Debug Mode
```env
NEXT_PUBLIC_DEBUG=true
```

#### Check Browser Console
- Look for Firebase authentication errors
- Check network requests for failed API calls
- Verify environment variables are loaded

## 📈 Monitoring

### Set Up Analytics
```javascript
// lib/analytics.js
import { getAnalytics } from 'firebase/analytics'
import { app } from './firebase'

export const analytics = getAnalytics(app)
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- Firebase Crashlytics
- Vercel Analytics

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

If you encounter issues during deployment:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review Firebase console for errors
3. Check Vercel deployment logs
4. Open an issue on GitHub

---

Your Phrames app is now ready for production! 🎉