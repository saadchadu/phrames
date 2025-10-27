# Phrames Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Database Setup
- [ ] Create PostgreSQL database (Vercel Postgres, Supabase, or other)
- [ ] Get DATABASE_URL connection string
- [ ] Run migrations: `npx prisma migrate deploy`

### 2. S3 Storage Setup
- [ ] Create S3 bucket (AWS S3 or Cloudflare R2)
- [ ] Configure CORS for your domain
- [ ] Get access keys and endpoint URL
- [ ] Set up CDN/public URL for assets

### 3. Environment Variables
Required for production:

```bash
DATABASE_URL=postgres://user:password@host:5432/database
SESSION_SECRET=your-long-random-session-secret-key-here
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
- [ ] Verify DATABASE_URL is correct
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
1. **Database Connection**: Verify DATABASE_URL format and credentials
2. **S3 Upload Errors**: Check bucket permissions and CORS settings
3. **Session Issues**: Ensure SESSION_SECRET is set and consistent
4. **Build Errors**: Check for missing dependencies or TypeScript errors

### Logs
- Check Vercel function logs for server errors
- Use browser dev tools for client-side issues
- Monitor database logs for query issues

## 📊 Monitoring

### Performance
- [ ] Page load times < 3s
- [ ] Image upload/processing < 10s
- [ ] Database query performance

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

- The app uses credentials authentication (no Firebase)
- Sessions are stored in PostgreSQL with 30-day expiration
- Images are processed client-side with Canvas API
- S3 is used only for frame storage, not user uploads
- Analytics are stored in daily aggregates