# Phrames Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Firestore Setup
- [ ] Create a Firebase project (if not already)
- [ ] Enable Firestore in production mode
- [ ] Enable Authentication providers (Email/Password + Google)
- [ ] Download Admin SDK service account credentials

### 2. S3 Storage Setup
- [ ] Create S3 bucket (AWS S3 or Cloudflare R2)
- [ ] Configure CORS for your domain
- [ ] Get access keys and endpoint URL
- [ ] Set up CDN/public URL for assets

### 3. Environment Variables
Required for production:

```bash
SESSION_SECRET=your-long-random-session-secret-key-here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NUXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=phrames-assets
S3_PUBLIC_BASE_URL=https://your-cdn-domain.com/
S3_REGION=us-east-1
NUXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
```

## 🚀 Vercel Deployment

### 1. Connect Repository
- [ ] Push code to GitHub/GitLab
- [ ] Connect repository to Vercel
- [ ] Import project

### 2. Configure Build Settings
- **Framework Preset**: Nuxt 3
- **Build Command**: `npx nuxi build`
- **Install Command**: `npm install`
- **Output Directory**: Leave blank (Nuxt handles it)
- **Node.js Version**: 18.x or 20.x

### 3. Environment Variables
- [ ] Add all environment variables in Vercel dashboard
- [ ] Ensure SESSION_SECRET is a long random string
- [ ] Verify Firebase Admin credentials are correct
- [ ] Test S3 credentials

### 4. Domain Setup
- [ ] Add custom domain: `phrames.cleffon.com`
- [ ] Configure DNS: CNAME `phrames` → `cname.vercel-dns.com`
- [ ] Wait for SSL certificate provisioning

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Home page loads correctly
- [ ] User signup works
- [ ] User login works
- [ ] Dashboard accessible after login
- [ ] Campaign creation works
- [ ] PNG upload and validation works
- [ ] Public campaign links work (/c/[slug])

### 2. Image Composition
- [ ] Frame displays correctly on public page
- [ ] Image upload works
- [ ] Canvas composition works
- [ ] Download functionality works
- [ ] EXIF rotation works

### 3. Analytics
- [ ] Visit metrics recorded
- [ ] Render metrics recorded
- [ ] Download metrics recorded
- [ ] Campaign stats display correctly

## 🔧 Troubleshooting

### Common Issues
1. **Firebase Admin**: Ensure `FIREBASE_PRIVATE_KEY` preserves newline characters (`\n`)
2. **S3 Upload Errors**: Check bucket permissions and CORS settings
3. **Session Issues**: Ensure SESSION_SECRET is set and consistent
4. **Build Errors**: Check for missing dependencies or TypeScript errors

### Logs
- Check Vercel function logs for server errors
- Use browser dev tools for client-side issues

## 📊 Monitoring

### Performance
- [ ] Page load times < 3s
- [ ] Image upload/processing < 10s
- [ ] Firestore read/write latency within limits

### Security
- [ ] HTTPS enabled
- [ ] Session cookies secure
- [ ] S3 bucket not publicly writable
- [ ] Environment variables not exposed

## 🎯 Success Criteria

- ✅ Users can sign up and log in
- ✅ Creators can upload PNG frames and create campaigns
- ✅ Public links work for visitors
- ✅ Image composition and download works
- ✅ No build errors or runtime errors
- ✅ Site accessible at https://phrames.cleffon.com
- ✅ All features work without watermarks or paywalls

## 📝 Notes

- Authentication flows through Firebase (email/password + Google)
- Creator sessions are stored in Firestore with 30-day expiration
- Images are processed client-side with Canvas API
- S3 is used only for frame storage, not user uploads
- Analytics are stored in daily aggregates
