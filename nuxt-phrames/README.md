# Phrames - Nuxt 3 Production App

A complete Twibbonize-style photo frame campaign platform built with Nuxt 3, following your Figma design specifications.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd nuxt-phrames
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure your database:**
   ```bash
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
nuxt-phrames/
├── app.vue                 # Root app component
├── nuxt.config.ts         # Nuxt configuration
├── tailwind.config.ts     # Tailwind + Figma design tokens
├── prisma/
│   └── schema.prisma      # Database schema
├── assets/css/
│   └── main.css          # Global styles + component classes
├── components/
│   ├── Navbar.vue        # Navigation component
│   ├── Hero.vue          # Hero section with two buttons
│   ├── HowItWorks.vue    # 4-step process
│   ├── CampaignCard.vue  # Campaign preview cards
│   ├── Footer.vue        # Site footer
│   ├── FrameUpload.vue   # PNG frame uploader
│   └── ImageComposer.vue # Canvas-based image composition
├── pages/
│   ├── index.vue         # Landing page
│   ├── signup.vue        # User registration
│   ├── login.vue         # User authentication
│   ├── dashboard/
│   │   ├── index.vue     # Creator dashboard
│   │   └── campaigns/
│   │       ├── index.vue # Campaign list
│   │       ├── new.vue   # Create campaign
│   │       └── [id].vue  # Edit campaign
│   └── c/
│       └── [slug].vue    # Public campaign page
├── server/
│   ├── api/
│   │   ├── auth/         # Authentication endpoints
│   │   ├── campaigns/    # Campaign CRUD
│   │   └── public/       # Public API (no auth)
│   └── utils/
│       ├── db.ts         # Prisma client
│       ├── auth.ts       # Session management
│       ├── s3.ts         # File storage
│       └── png.ts        # PNG validation
└── middleware/
    └── auth.ts           # Route protection
```

## 🎨 Design System (From Figma)

### Colors
- **Primary Green**: `#00dd78` (brand color)
- **Dark**: `#002400` (text/accents)
- **Gray Scale**: 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Typography
- **Font**: Inter (Google Fonts)
- **Display Sizes**: 2xl (60px), xl (48px), lg (36px), md (30px), sm (24px), xs (20px)
- **Body**: Base (16px), lg (18px), sm (14px), xs (12px)

### Components
- **Buttons**: Primary (solid green), Secondary (outline), Ghost (text only)
- **Cards**: Basic border + shadow, Elevated (larger shadow)
- **Inputs**: Border + focus ring matching brand colors

## 🔧 Features Implemented

### ✅ Landing Page (Figma Design)
- Hero section with exact copy: "Create Beautiful Photo Frames And Share to the Globe"
- Two-button CTA: "Create a Campaign" (primary) + "Try a Demo Frame" (secondary)
- 4-step "How it Works" section with your copy
- Featured campaigns grid
- Responsive design matching Figma breakpoints

### ✅ Authentication System
- Email + password signup/login
- Secure session management (httpOnly cookies)
- Password hashing with bcrypt
- Rate limiting on auth routes

### ✅ Campaign Management
- Create campaigns with PNG frame upload
- Server-side PNG transparency validation
- Unique slug generation for shareable URLs
- Public/Unlisted visibility options
- S3-compatible storage for frame assets

### ✅ Public Campaign Pages (`/c/{slug}`)
- No-login photo upload and composition
- Client-side canvas-based image processing
- Zoom, pan, and positioning controls
- Live preview with frame overlay
- Download PNG/JPEG (no watermarks)
- Privacy-first: visitor photos never uploaded

### ✅ Analytics & Metrics
- Visit, render, and download tracking
- Daily aggregated statistics
- Creator dashboard with 7-day charts
- Lightweight, privacy-focused metrics

### ✅ Image Composition Engine
- Client-side canvas processing
- EXIF auto-rotation support
- Maintains frame aspect ratio
- Export size optimization (1080-2048px)
- Web Worker support for performance
- sRGB color space normalization

## 🌐 Deployment (Vercel)

1. **Connect your repository to Vercel**

2. **Framework Preset**: Nuxt 3 (auto-detected)

3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: (leave empty - Nuxt handles `.output`)

4. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://...
   SESSION_SECRET=your-32-char-secret
   S3_ENDPOINT=https://your-s3-endpoint
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET=your-bucket-name
   S3_PUBLIC_BASE_URL=https://your-cdn-url
   NUXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
   ```

5. **Deploy**: Vercel will automatically build and deploy

## 📝 Microcopy (From Figma)

### Hero Section
- **Headline**: "Create Beautiful Photo Frames And Share to the Globe"
- **Subtext**: "Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. Upload your PNG frames and let visitors create personalized images instantly."
- **Tagline**: "No design skills needed — just creativity."

### How It Works Steps
1. **Sign Up**: "Create your free creator account and start building your first campaign."
2. **Upload Frame**: "Add your PNG with transparent areas. Our system validates the transparency automatically."
3. **Share Link**: "Invite your audience with a simple shareable link. No signup required for visitors."
4. **Community Joins In**: "Supporters add your frame and share their personalized images across social media."

### Call-to-Action
- **Primary**: "Turn your cause into a shared visual moment."
- **Secondary**: "Create shareable photo frames that help your message spread across social media."

## 🎯 Acceptance Criteria

- ✅ Creator can sign up, create campaigns with transparent PNG frames
- ✅ Shareable links work: `/c/{slug}` format
- ✅ Visitors can upload photos, adjust under frame, preview, and download
- ✅ No watermarks, no ads, completely free
- ✅ Visitor photos never leave the browser (privacy-first)
- ✅ Metrics increment and display in creator dashboard
- ✅ UI matches Figma design (colors, typography, spacing, responsive)
- ✅ PNG transparency validation on server-side
- ✅ Accessible markup and keyboard navigation
- ✅ Production-ready deployment on Vercel

## 🚀 Next Steps

1. **Export your Figma assets** (SVG icons, optimized images)
2. **Replace placeholder images** with your actual campaign examples
3. **Configure your S3-compatible storage** (AWS S3, Cloudflare R2, etc.)
4. **Set up your production database** (PostgreSQL recommended)
5. **Deploy to Vercel** using the Nuxt 3 preset
6. **Add your custom domain** when ready

The app is production-ready and follows all your specifications from the detailed requirements!