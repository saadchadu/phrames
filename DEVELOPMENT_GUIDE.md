# Phrames Development Guide

## 🚀 Quick Start

Your Phrames app is ready for development and testing!

### Development Server
```bash
npm run dev
```
Server runs on: http://localhost:3001/

## 🔐 Authentication Testing

### Development Mode (No Database Required)
The app automatically detects when you're in development mode without a database and provides mock authentication:

#### Login Testing
- **URL**: http://localhost:3001/login
- **Demo Credentials**:
  - Email: `demo@phrames.com`
  - Password: `demo123`

#### Signup Testing
- **URL**: http://localhost:3001/signup
- **Any email/password works** in development mode
- Minimum 6 characters for password

### Production Mode (Firebase Required)
When Firebase credentials are configured, the app uses real authentication backed by Firebase Authentication and persists creator sessions in Firestore.

## 📁 Key Files

### Authentication
- `pages/login.vue` - Login page with demo credentials
- `pages/signup.vue` - Signup page with development mode info
- `composables/useAuth.ts` - Auth state management
- `server/api/auth/` - Auth API endpoints with dev/prod modes
- `middleware/auth.global.ts` - Route protection

### Data Layer
- `server/utils/firestore.ts` - Firestore client + helpers
- `server/utils/auth.ts` - Auth utilities (Firebase, sessions)

## 🧪 Testing Flow

1. **Home Page**: Visit http://localhost:3001/
2. **Signup**: Create account (any email/password in dev mode)
3. **Login**: Use demo credentials or your signup credentials
4. **Dashboard**: Access protected routes after login
5. **Logout**: Clear session and return to home

## 🔧 Environment Setup

### Development (.env)
```bash
SESSION_SECRET=your-long-random-session-secret-key-here
FIREBASE_PROJECT_ID=your-project-id                           # Optional for dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com  # Optional for dev
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" # Optional for dev
NUXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key            # Optional for dev
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com # Optional for dev
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id               # Optional for dev
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com  # Optional for dev
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789            # Optional for dev
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456      # Optional for dev
S3_ENDPOINT=https://your-s3-endpoint.com                      # Optional for dev
S3_ACCESS_KEY_ID=your-access-key                              # Optional for dev
S3_SECRET_ACCESS_KEY=your-secret-key                          # Optional for dev
S3_BUCKET=phrames-assets                                      # Optional for dev
S3_PUBLIC_BASE_URL=https://your-cdn-domain.com/               # Optional for dev
S3_REGION=us-east-1                                           # Optional for dev
NUXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Production
All environment variables are required for production deployment.

## 🚨 Known Development Issues

### Browser Extension Errors
The console shows many errors from browser extensions (password managers, etc.). These are **not related to your app** and can be ignored:
- `background.js:1 Unchecked runtime.lastError`
- `Could not establish connection. Receiving end does not exist`

### Firebase Connection
If you see errors about missing Firebase credentials in development, that's expected when you haven't configured them yet. The app automatically falls back to mock authentication.

## 🎯 Next Steps

1. **Test Authentication**: Try login/signup with the demo credentials
2. **Explore Dashboard**: Navigate to protected routes
3. **Campaign Creation**: Test the campaign creation flow (may need S3 setup)
4. **Deploy**: Follow `DEPLOYMENT_CHECKLIST.md` for production deployment

## 📞 Troubleshooting

### Auth Not Working
- Check if you're using the demo credentials: `demo@phrames.com` / `demo123`
- Clear browser cookies and try again
- Check browser network tab for API errors

### Server Errors
- Restart development server: `npm run dev`
- Clear Nuxt cache: `rm -rf .nuxt .output && npm run dev`

### Database Errors
- Expected in development mode without PostgreSQL
- App automatically uses mock authentication
- For real database testing, set up PostgreSQL locally

Your Phrames app is production-ready—just wire up Firebase + S3 storage for full functionality!
