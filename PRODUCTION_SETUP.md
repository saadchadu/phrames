# 🚀 Production Setup Guide

> **Note:** The production stack now relies on Firebase Authentication + Firestore. Legacy PostgreSQL steps referenced in earlier docs are no longer required.

## ✅ Firebase Setup Required

Your app is **production-ready** and requires Firebase plus object storage to function. No more mock data or development fallbacks!

---

## 📋 Required Setup

### 1. PostgreSQL Database

You **must** have a PostgreSQL database running. Choose one option:

#### Option A: Local PostgreSQL (for development)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb phrames
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb phrames
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install and start PostgreSQL service
- Create database using pgAdmin

#### Option B: Docker (easiest for development)

```bash
docker run --name phrames-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=phrames \
  -p 5432:5432 \
  -d postgres:14

# Add to .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/phrames"
```

#### Option C: Cloud Database (for production)

**Free Tier Options:**
- **[Supabase](https://supabase.com)** - 500MB free, easy setup
- **[Railway](https://railway.app)** - $5 free credit
- **[Neon](https://neon.tech)** - Serverless Postgres, free tier
- **[Vercel Postgres](https://vercel.com/storage/postgres)** - Integrated with Vercel

**Paid Options:**
- **AWS RDS** - Managed PostgreSQL
- **Google Cloud SQL** - Managed PostgreSQL
- **DigitalOcean Managed Databases** - Starting at $15/month

---

## 🔧 Environment Variables

### Required Variables

Add these to your `.env` file:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/phrames"

# Session Secret (REQUIRED)
SESSION_SECRET="your-super-secret-key-min-32-chars"

# Firebase Client (REQUIRED)
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (REQUIRED)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# S3 Storage (REQUIRED for campaign creation)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=phrames
S3_PUBLIC_BASE_URL=https://your-cdn.com/
S3_REGION=us-east-1

# Site URL
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🗄️ Database Setup

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Migrations

**Development:**
```bash
npx prisma migrate dev
```

**Production:**
```bash
npx prisma migrate deploy
```

### 3. Verify Connection

```bash
npx prisma db pull
```

If successful, you'll see your schema synced!

### 4. View Database (Optional)

```bash
npx prisma studio
```

Opens a GUI at `http://localhost:5555` to view your data.

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name
4. Create project

### 2. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google**
4. Add support email

### 3. Get Firebase Config

**Client Config:**
1. Go to **Project Settings**
2. Scroll to "Your apps"
3. Click web icon (</>)
4. Copy config values

**Admin SDK:**
1. Go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Download JSON file
4. Extract values for `.env`

### 4. Configure Authorized Domains

1. Go to **Authentication** → **Settings**
2. Add authorized domains:
   - `localhost` (for development)
   - Your production domain

---

## 📦 S3 Storage Setup

### Option A: Cloudflare R2 (Recommended)

**Why R2:**
- Free tier: 10GB storage
- No egress fees
- S3-compatible API
- Fast CDN

**Setup:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to R2 → Create bucket
3. Create API token
4. Add to `.env`:
```env
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-r2-access-key
S3_SECRET_ACCESS_KEY=your-r2-secret-key
S3_BUCKET=phrames
S3_PUBLIC_BASE_URL=https://your-r2-domain.com/
S3_REGION=auto
```

### Option B: AWS S3

1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Get access keys
4. Configure CORS
5. Add to `.env`

### Option C: DigitalOcean Spaces

1. Create Space
2. Generate API keys
3. Add to `.env`

---

## 🚀 Running the App

### Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] PostgreSQL database is running
- [ ] `DATABASE_URL` is set in `.env`
- [ ] Prisma migrations completed successfully
- [ ] Firebase project created
- [ ] Firebase Email/Password enabled
- [ ] Firebase Google Sign-In enabled
- [ ] Firebase config added to `.env`
- [ ] Firebase Admin SDK configured
- [ ] S3/R2 bucket created
- [ ] S3 credentials added to `.env`
- [ ] `SESSION_SECRET` is set (32+ characters)
- [ ] Dev server starts without errors

---

## 🧪 Testing

### 1. Test Authentication

```bash
# Start server
npm run dev

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Test Database Connection

```bash
# Open Prisma Studio
npx prisma studio

# Check tables exist:
# - users
# - sessions
# - campaigns
# - assets
# - campaign_stats_daily
```

### 3. Test Full Flow

1. Go to `/signup`
2. Sign up with email/password or Google
3. Should redirect to `/dashboard`
4. Should show empty campaigns
5. Click "Create Campaign"
6. Upload PNG frame
7. Campaign should be created
8. Should appear in dashboard

---

## 🐛 Troubleshooting

### "Can't reach database server"

**Cause:** Database not running or wrong connection string

**Solution:**
```bash
# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Docker
docker ps | grep postgres

# Test connection
psql $DATABASE_URL
```

### "Firebase not initialized"

**Cause:** Missing Firebase config

**Solution:**
- Check all `NUXT_PUBLIC_FIREBASE_*` variables in `.env`
- Restart dev server
- Clear browser cache

### "Invalid authentication token"

**Cause:** Firebase Admin SDK not configured

**Solution:**
- Verify `FIREBASE_PRIVATE_KEY` format (keep `\n` characters)
- Check `FIREBASE_CLIENT_EMAIL` matches service account
- Ensure `FIREBASE_PROJECT_ID` is correct

### "Service temporarily unavailable"

**Cause:** Database connection failed

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Run migrations: `npx prisma migrate deploy`
- Check database logs

---

## 📊 Monitoring

### Database

```bash
# View database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('phrames'));"

# View table sizes
psql $DATABASE_URL -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public';"

# View active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### Application

- Check server logs for errors
- Monitor Firebase Console for auth activity
- Check S3 bucket usage
- Monitor database connection pool

---

## 🎉 You're Ready!

Your app is now **fully production-ready** with:
- ✅ Real database (PostgreSQL)
- ✅ Firebase Authentication
- ✅ S3 storage
- ✅ No development fallbacks
- ✅ Production-grade security

### Next Steps:
1. ✅ Set up all required services
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Test authentication
5. ✅ Create your first campaign
6. ✅ Deploy to production

**Your Twibbonize clone is ready to launch!** 🚀
