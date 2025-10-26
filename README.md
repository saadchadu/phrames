# Phrames

A free, Twibbonize-style web app for creating photo frame campaigns. Creators can upload PNG frames with transparency and get shareable links for visitors to create personalized images.

## Features

- **Creator Dashboard**: Sign up, create campaigns, upload PNG frames
- **Public Campaigns**: Shareable links for visitors to use frames
- **Image Composition**: Client-side canvas composition with zoom/pan controls
- **No Watermarks**: Completely free with no limitations
- **Analytics**: Basic metrics tracking (visits, renders, downloads)

## Tech Stack

- **Framework**: Nuxt 3 with TypeScript
- **UI**: Nuxt UI + Tailwind CSS
- **Database**: PostgreSQL with Prisma
- **Auth**: Firebase Authentication
- **Storage**: S3-compatible (Cloudflare R2/AWS S3)
- **Deployment**: Vercel

## Getting Started

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd phrames
   npm install
   ```

2. **Set up Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password
   - Generate a service account key for Firebase Admin
   - Copy the configuration values

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database, Firebase, and S3 credentials
   ```

4. **Set up database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

## Environment Variables

### Database & Storage
- `DATABASE_URL`: PostgreSQL connection string
- `S3_ENDPOINT`: S3-compatible storage endpoint
- `S3_ACCESS_KEY_ID`: Storage access key
- `S3_SECRET_ACCESS_KEY`: Storage secret key
- `S3_BUCKET`: Storage bucket name
- `S3_PUBLIC_BASE_URL`: Public CDN URL for assets
- `S3_REGION`: AWS region (or region for your S3-compatible provider)
- `NUXT_PUBLIC_SITE_URL`: Your domain (e.g., https://phrames.cleffon.com)

### Firebase Configuration
- `NUXT_PUBLIC_FIREBASE_API_KEY`: Firebase Web API key
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase Auth domain
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NUXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID
- `FIREBASE_ADMIN_PROJECT_ID`: Firebase Admin project ID
- `FIREBASE_ADMIN_CLIENT_EMAIL`: Firebase Admin service account email
- `FIREBASE_ADMIN_PRIVATE_KEY`: Firebase Admin service account private key

## Deployment

Deploy to Vercel with:
- Framework Preset: Nuxt 3
- Build Command: `npx nuxi build`
- Output Directory: (leave blank)

Add your domain and configure DNS:
- CNAME: `phrames` → `cname.vercel-dns.com`

## Project Structure

```
/app
  /components     # Vue components
  /composables    # Nuxt composables
  /middleware     # Route middleware
  /pages          # File-based routing
  /server         # Nitro server API
/prisma           # Database schema
```

## License

MIT License - feel free to use for any purpose.
