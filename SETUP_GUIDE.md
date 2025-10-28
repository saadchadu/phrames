# Phrames - Complete Setup Guide

## Overview
Phrames is a Twibbonize clone that allows users to create photo frame campaigns. Users can upload PNG frames with transparency, and others can add their photos to create personalized images.

## Features
✅ User authentication (Firebase Auth)
✅ Campaign creation with name, slug, description, and frame upload
✅ Public shareable links for each campaign (`/c/[slug]`)
✅ Image composition in browser (client-side)
✅ Download as PNG or JPEG
✅ Campaign analytics (visits, renders, downloads)
✅ Campaign management (edit, archive, update frame)

## Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project (for authentication, Firestore, and Storage)
- Optional: S3-compatible storage (if you prefer S3 over Firebase Storage)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

#### Required Configuration:

**Session Secret:**
```bash
# Generate with: openssl rand -base64 32
SESSION_SECRET=your-long-random-session-secret-key-here
```

**Firebase Client (Public):**
- Go to Firebase Console → Project Settings → General
- Scroll to "Your apps" and select your web app
- Copy the config values:

```env
NUXT_PUBLIC_FIREBASE_API_KEY=AIza...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Firebase Admin (Server):**
- Go to Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key"
- Open the downloaded JSON file and extract:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**S3 Storage:**
```env
S3_ENDPOINT=https://your-s3-endpoint.com  # Optional for AWS S3
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=phrames-assets
S3_PUBLIC_BASE_URL=https://your-cdn-domain.com/
S3_REGION=us-east-1
```

**Site URL:**
```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000  # Change for production
```

### 3. Firebase Setup

#### Enable Storage:
1. Go to Firebase Console → Storage
2. Click "Create database"
3. Choose "Start in production mode"
4. Update rules to allow public read:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

See [FIREBASE_STORAGE_SETUP.md](FIREBASE_STORAGE_SETUP.md) for detailed instructions.

#### Enable Authentication:
1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. (Optional) Enable "Google" sign-in method

#### Setup Firestore:
1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location
5. The app will automatically create collections as needed

### 4. S3 Storage Setup

#### For AWS S3:
1. Create an S3 bucket
2. Enable public read access for objects
3. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
4. Create IAM user with S3 permissions
5. Use CloudFront or S3 public URL as `S3_PUBLIC_BASE_URL`

#### For DigitalOcean Spaces:
1. Create a Space
2. Set it to public
3. Use the Space endpoint as `S3_ENDPOINT`
4. Use the CDN URL as `S3_PUBLIC_BASE_URL`

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Usage Flow

### Creating a Campaign:
1. Sign up / Log in
2. Go to Dashboard
3. Click "Create Campaign" (or visit `/dashboard/campaigns/new`)
4. Fill in:
   - **Campaign Name**: Display name for your campaign
   - **URL Slug**: Unique identifier for the shareable link
   - **Description**: Optional description shown on public page
   - **Visibility**: Public (discoverable) or Unlisted (link-only)
   - **Frame Image**: PNG with transparency, minimum 1080x1080px
5. Click "Create Campaign"

### After Creation:
- You'll be redirected to the campaign management page
- **Copy the shareable link**: `/c/your-slug`
- Share this link with users who want to create images

### Users Creating Images:
1. Visit the campaign link: `/c/your-slug`
2. Upload their photo
3. Adjust position and zoom
4. Download as PNG or JPEG

### Managing Campaigns:
- View analytics (visits, renders, downloads)
- Edit campaign details
- Replace frame image
- Archive/unarchive campaigns
- Copy shareable link

## API Endpoints

### Authentication:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Campaigns (Protected):
- `GET /api/campaigns` - List user's campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PATCH /api/campaigns/[id]` - Update campaign
- `PATCH /api/campaigns/[id]/frame` - Update frame image
- `POST /api/campaigns/[id]/archive` - Archive campaign
- `POST /api/campaigns/[id]/unarchive` - Unarchive campaign
- `GET /api/campaigns/[id]/stats` - Get analytics

### Public:
- `GET /api/public/campaigns/[slug]` - Get campaign by slug
- `POST /api/public/campaigns/[slug]/metrics` - Record metric
- `POST /api/public/campaigns/[slug]/report` - Report campaign

## Troubleshooting

### "Unauthorized" errors:
- Make sure you're logged in
- Check that Firebase tokens are being sent with requests
- Verify Firebase Admin credentials are correct

### Images not loading:
- Check S3 configuration
- Verify `S3_PUBLIC_BASE_URL` is correct
- Ensure bucket has public read access
- Check CORS settings

### Campaign creation fails:
- Verify PNG has transparency (alpha channel)
- Ensure image is at least 1080x1080px
- Check S3 credentials and permissions
- Verify slug is unique

### Firebase errors:
- Check all Firebase environment variables
- Verify service account has correct permissions
- Ensure Firestore is enabled

## Production Deployment

1. Set production environment variables
2. Update `NUXT_PUBLIC_SITE_URL` to your domain
3. Build the application:
```bash
npm run build
```
4. Start production server:
```bash
npm run start
```

Or deploy to platforms like:
- Vercel
- Netlify
- DigitalOcean App Platform
- AWS (EC2, ECS, Lambda)

## Security Notes

- Never commit `.env` file
- Keep Firebase private key secure
- Use strong session secrets
- Enable Firebase security rules in production
- Implement rate limiting for public endpoints
- Monitor S3 usage and costs

## Support

For issues or questions, check:
- Firebase Console for auth/database errors
- S3 bucket logs for storage issues
- Browser console for client-side errors
- Server logs for API errors
