# Deployment Guide - Next.js Phrames App

## 🚀 Deploy to Vercel (Recommended)

### 1. Prepare Your Repository
```bash
cd next-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/phrames-nextjs.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `next-app` (if in subdirectory)
6. Build Command: `npm run build` (default)
7. Output Directory: (leave empty)

### 3. Environment Variables
Add these in Vercel dashboard under Settings → Environment Variables:

```env
DATABASE_URL=postgresql://username:password@host:5432/phrames
SESSION_SECRET=your-32-character-session-secret-here
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-cdn-url.com
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 4. Database Setup
After deployment, run database migration:
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Run database setup
vercel env pull .env.local
npm run db:push
```

### 5. Custom Domain (Optional)
1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_SITE_URL` environment variable

## 🗄️ Database Options (Free Tiers)

### Option 1: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string to `DATABASE_URL`

### Option 2: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string to `DATABASE_URL`

### Option 3: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string to `DATABASE_URL`

## 📦 Storage Options (Free Tiers)

### Option 1: Cloudflare R2 (Recommended)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Create R2 bucket
3. Generate API tokens
4. Set up custom domain for public access

### Option 2: AWS S3
1. Create S3 bucket
2. Set up IAM user with S3 permissions
3. Configure bucket policy for public read access

## 🔧 Troubleshooting

### Build Errors
- Make sure all environment variables are set
- Check that `DATABASE_URL` is accessible from Vercel
- Verify S3 credentials are correct

### Runtime Errors
- Check Vercel function logs
- Ensure database is accessible
- Verify all API routes are working

### Database Connection Issues
- Make sure database allows external connections
- Check connection string format
- Verify SSL settings if required

## ✅ Post-Deployment Checklist

- [ ] App loads at your domain
- [ ] Signup/login works
- [ ] Dashboard is accessible
- [ ] Database connection is working
- [ ] File uploads work (if S3 configured)
- [ ] Public campaign pages load
- [ ] All environment variables are set

## 🎯 No Firebase Required

This app is completely independent and doesn't use:
- ❌ Firebase Authentication
- ❌ Firebase Firestore
- ❌ Firebase Storage
- ❌ Firebase Functions

Instead it uses:
- ✅ PostgreSQL with Prisma
- ✅ Email/password authentication
- ✅ Session-based auth
- ✅ S3-compatible storage

Your deployment should work without any Firebase configuration!