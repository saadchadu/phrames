# Quick Start Guide - Next.js Phrames App

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd next-app
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
# Database (use a free PostgreSQL from Railway, Supabase, or Neon)
DATABASE_URL="postgresql://username:password@host:5432/phrames"

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET="your-32-character-session-secret-here"

# S3 Storage (use Cloudflare R2 for free tier)
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="your-r2-access-key"
S3_SECRET_ACCESS_KEY="your-r2-secret-key"
S3_BUCKET="phrames-frames"
S3_PUBLIC_BASE_URL="https://your-custom-domain.com"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Set Up Database
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
Visit [http://localhost:3000](http://localhost:3000)

## 🎯 What You'll See

- **Landing Page**: Exact Figma design with your copy
- **Sign Up**: Create account with email/password
- **Dashboard**: Campaign management interface
- **Public Pages**: `/c/{slug}` for sharing campaigns

## 🔧 Free Services You Can Use

### Database (PostgreSQL)
- **Neon**: https://neon.tech (free tier)
- **Supabase**: https://supabase.com (free tier)
- **Railway**: https://railway.app (free tier)

### Storage (S3-Compatible)
- **Cloudflare R2**: https://cloudflare.com/products/r2/ (10GB free)
- **AWS S3**: https://aws.amazon.com/s3/ (5GB free)

### Deployment
- **Vercel**: https://vercel.com (free for personal projects)

## 📝 Key Features Working

✅ **Authentication**: Email/password signup and login
✅ **Landing Page**: Exact Figma design implementation
✅ **Database**: PostgreSQL with Prisma ORM
✅ **File Upload**: PNG transparency validation
✅ **Public Pages**: Shareable campaign URLs
✅ **Canvas Composition**: Client-side image processing
✅ **No Watermarks**: Completely free downloads

## 🚀 Deploy to Production

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is **production-ready** and doesn't depend on Firebase at all!