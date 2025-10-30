# Phrames - Complete Next.js Production App

A complete Twibbonize-style photo frame campaign platform built with Next.js 14, following your exact Figma design specifications.

## 🚀 Features

- 🎨 **Exact Figma Design**: Matches your design tokens, colors, typography, and layout
- 🔐 **Email Authentication**: Secure signup/login with bcrypt password hashing
- 📊 **Campaign Management**: Create, edit, and manage frame campaigns
- 🖼️ **PNG Frame Upload**: Server-side transparency validation
- 🌐 **Public Campaign Pages**: `/c/{slug}` URLs for sharing
- 🎯 **Client-side Composition**: Canvas-based image processing (privacy-first)
- 📈 **Analytics**: Visit, render, and download tracking
- 🚫 **No Watermarks**: Completely free, no ads
- ⚡ **Production Ready**: Optimized for Vercel deployment

## 📁 Project Structure

```
next-app/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── campaigns/     # Campaign CRUD
│   │   └── public/        # Public API (no auth)
│   ├── c/[slug]/          # Public campaign pages
│   ├── dashboard/         # Creator dashboard
│   ├── login/             # Authentication pages
│   ├── signup/            # User registration
│   ├── globals.css        # Global styles + design tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page (exact Figma design)
├── components/ui/         # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Session management
│   ├── db.ts             # Prisma client
│   ├── png.ts            # PNG transparency validation
│   └── s3.ts             # File storage
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies with Prisma
├── tailwind.config.js    # Figma design tokens
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Design System (From Figma)

### Colors
- **Primary Green**: `#00dd78` (brand color)
- **Dark**: `#002400` (text/accents)
- **Gray Scale**: 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Typography
- **Font**: Inter (Google Fonts)
- **Display Sizes**: 6xl (60px), 5xl (48px), 4xl (36px), 3xl (30px), 2xl (24px), xl (20px)
- **Body**: lg (18px), base (16px), sm (14px), xs (12px)

### Components
- **Buttons**: Primary (solid green), Secondary (outline), Ghost (text only)
- **Cards**: Clean borders with subtle shadows
- **Inputs**: Focus rings matching brand colors

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd next-app
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure your database and storage:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/phrames"
   SESSION_SECRET="your-32-character-secret"
   S3_ENDPOINT="https://your-s3-endpoint.com"
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   S3_BUCKET="your-bucket-name"
   S3_PUBLIC_BASE_URL="https://your-cdn-url.com"
   ```

4. **Set up the database:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🗄️ Database Schema

Uses PostgreSQL with Prisma ORM:

- **Users**: Email/password authentication
- **Sessions**: Secure session management
- **Campaigns**: Frame campaigns with metadata
- **Assets**: PNG frame files with dimensions
- **CampaignStats**: Daily analytics (visits, renders, downloads)

## 📝 Exact Figma Implementation

### Landing Page
- **Hero**: "Create Beautiful Photo Frames And Share to the Globe"
- **Two-Button CTA**: "Create a Campaign" + "Try a Demo Frame"
- **Microcopy**: "No design skills needed — just creativity"
- **4-Step Process**: Sign Up → Upload Frame → Share Link → Community Joins In
- **Featured Campaigns**: Grid layout with sample campaigns

### Authentication
- **Email/Password**: Secure bcrypt hashing
- **Session Cookies**: httpOnly, secure, 30-day expiry
- **Form Validation**: Zod schema validation

### Campaign Management
- **Create**: Name, description, slug, PNG upload
- **Validation**: Server-side PNG transparency checking
- **Storage**: S3-compatible file storage
- **Sharing**: Public URLs at `/c/{slug}`

### Public Campaign Pages
- **No Login Required**: Visitors can use immediately
- **Image Upload**: Client-side processing only
- **Canvas Composition**: Real-time preview with frame overlay
- **Download**: PNG/JPEG export, no watermarks
- **Privacy**: Photos never uploaded to server

## 🌐 Deployment (Vercel)

1. **Framework Preset**: Next.js (auto-detected)
2. **Build Command**: `npm run build`
3. **Output Directory**: (leave empty - Next.js handles `.next`)

### Environment Variables for Production:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-32-char-secret
S3_ENDPOINT=https://your-s3-endpoint
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-cdn-url
NEXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
```

## 🎯 Acceptance Criteria

- ✅ **Creator Flow**: Signup → Create campaign → Upload PNG → Get shareable link
- ✅ **Visitor Flow**: Open `/c/{slug}` → Upload photo → Adjust → Download
- ✅ **No Watermarks**: Completely free, no ads
- ✅ **Privacy-First**: Visitor photos never leave browser
- ✅ **PNG Validation**: Server-side transparency checking
- ✅ **Analytics**: Metrics tracking and dashboard display
- ✅ **Figma Design**: Exact colors, typography, spacing, responsive
- ✅ **Production Ready**: Optimized for Vercel deployment

## 🔧 Development Commands

```bash
# Development
npm run dev

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Create migration

# Production
npm run build
npm start

# Quality
npm run lint
npm run type-check
```

## 📊 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Email/password with bcrypt
- **Storage**: S3-compatible (AWS S3, Cloudflare R2, etc.)
- **Styling**: Tailwind CSS with Figma design tokens
- **UI Components**: Radix UI primitives
- **Validation**: Zod schemas
- **Image Processing**: Sharp (server) + Canvas (client)
- **Deployment**: Vercel optimized

## 🎨 Microcopy (From Figma)

### Hero Section
- **Headline**: "Create Beautiful Photo Frames And Share to the Globe"
- **Subtext**: "Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. Upload your PNG frames and let visitors create personalized images instantly."
- **Tagline**: "No design skills needed — just creativity."

### How It Works
1. **Sign Up**: "Create your free creator account and start building your first campaign."
2. **Upload Frame**: "Add your PNG with transparent areas. Our system validates the transparency automatically."
3. **Share Link**: "Invite your audience with a simple shareable link. No signup required for visitors."
4. **Community Joins In**: "Supporters add your frame and share their personalized images across social media."

### Call-to-Action
- **Primary**: "Turn your cause into a shared visual moment."
- **Secondary**: "Create shareable photo frames that help your message spread across social media."

This is a **complete, production-ready** Next.js application that implements every feature from your detailed specifications!