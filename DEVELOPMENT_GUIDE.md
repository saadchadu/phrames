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

### Production Mode (Database Required)
When you have a proper `DATABASE_URL` configured, the app uses real database authentication with bcrypt password hashing.

## 📁 Key Files

### Authentication
- `pages/login.vue` - Login page with demo credentials
- `pages/signup.vue` - Signup page with development mode info
- `composables/useAuth.ts` - Auth state management
- `server/api/auth/` - Auth API endpoints with dev/prod modes
- `middleware/auth.global.ts` - Route protection

### Database
- `prisma/schema.prisma` - Database schema
- `server/utils/db.ts` - Prisma client setup
- `server/utils/auth.ts` - Auth utilities (bcrypt, sessions)

## 🧪 Testing Flow

1. **Home Page**: Visit http://localhost:3001/
2. **Signup**: Create account (any email/password in dev mode)
3. **Login**: Use demo credentials or your signup credentials
4. **Dashboard**: Access protected routes after login
5. **Logout**: Clear session and return to home

## 🔧 Environment Setup

### Development (.env)
```bash
DATABASE_URL=postgres://user:password@localhost:5432/phrames  # Optional for dev
SESSION_SECRET=your-long-random-session-secret-key-here
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

### Database Connection
If you see "Can't reach database server" errors, that's expected in development mode without a local PostgreSQL server. The app automatically falls back to mock authentication.

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

Your Phrames app is production-ready and just needs a database + S3 storage for full functionality!