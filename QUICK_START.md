# Quick Start Guide - Phrames (Twibbonize Clone)

> **Note:** Phrames now uses Firebase Authentication + Firestore instead of PostgreSQL/Prisma. Any legacy references to `DATABASE_URL` in this guide can be skipped—use the Firebase variables described in `FIRESTORE_DATABASE.md` instead.

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+
- PostgreSQL database
- S3-compatible storage (AWS S3, Cloudflare R2, etc.)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/phrames"

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET="your-super-secret-key-min-32-chars"

# S3 Storage
S3_ENDPOINT="https://s3.amazonaws.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="phrames"
S3_PUBLIC_BASE_URL="https://your-cdn-domain.com/"
S3_REGION="us-east-1"

# Site URL
NUXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 📦 Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/phrames.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework Preset: **Nuxt 3**
4. Build Command: `npx nuxi build`
5. Output Directory: **(leave blank)**
6. Add environment variables (same as .env)

### 3. Configure Database
Use a managed PostgreSQL service:
- **Vercel Postgres** (easiest)
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **Neon** (serverless Postgres)

### 4. Configure Storage
Use S3-compatible storage:
- **Cloudflare R2** (free tier: 10GB)
- **AWS S3** (pay as you go)
- **DigitalOcean Spaces**
- **Backblaze B2**

### 5. Run Migrations on Production
```bash
# In Vercel, add this to your build command:
npx prisma migrate deploy && npx nuxi build
```

## 🎨 Usage

### As a Creator
1. **Sign up** at `/signup`
2. **Create a campaign** at `/dashboard/campaigns/new`
3. **Upload a PNG frame** with transparent areas
4. **Share the link** `/c/your-slug` with anyone
5. **View stats** on your dashboard

### As a Visitor
1. **Open the share link** `/c/campaign-slug`
2. **Upload your photo** (JPG, PNG, or HEIC)
3. **Adjust position** with zoom and drag
4. **Download** your framed photo (PNG or JPEG)
5. **No login required!**

## 🔧 Common Tasks

### Create a Test User
```bash
# Using Prisma Studio
npx prisma studio

# Or via API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Check Logs
```bash
# Development
npm run dev

# Production (Vercel)
# View logs in Vercel dashboard
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database is accessible
- Verify SSL settings if required

### S3 Upload Fails
- Verify S3 credentials
- Check bucket permissions
- Ensure CORS is configured:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

### Session/Auth Issues
- Ensure `SESSION_SECRET` is set
- Check cookie settings in production
- Verify `NUXT_PUBLIC_SITE_URL` is correct

### Build Fails on Vercel
- Check Node.js version (18+)
- Ensure all environment variables are set
- Run `npm run build` locally first

## 📚 Key Files

- `nuxt.config.ts` - Nuxt configuration
- `prisma/schema.prisma` - Database schema
- `server/api/` - API endpoints
- `pages/` - Frontend pages
- `components/` - Vue components
- `composables/` - Reusable logic

## 🎯 Next Steps

1. **Customize branding** - Update logo, colors, text
2. **Add rate limiting** - Protect auth endpoints
3. **Set up monitoring** - Track errors and performance
4. **Add analytics** - Google Analytics, Plausible, etc.
5. **Custom domain** - Configure in Vercel
6. **Email notifications** - Welcome emails, reports, etc.

## 💡 Tips

- Test with different image sizes and formats
- Use PNG frames with clear transparent areas
- Keep frame files under 5MB for best performance
- Monitor S3 storage usage
- Regularly backup your database

## 🆘 Support

- Check `TWIBBONIZE_CLONE_STATUS.md` for implementation details
- Review `DEVELOPMENT_GUIDE.md` for development info
- See `DEPLOYMENT_CHECKLIST.md` for deployment steps

## 🎉 You're Ready!

Your Twibbonize clone is fully functional and ready to use. Start creating campaigns and sharing beautiful framed photos!

**Remember:** This app is completely free - no ads, no watermarks, no paywalls. Enjoy! 🚀
