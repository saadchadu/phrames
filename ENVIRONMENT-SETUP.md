# Environment Configuration Guide

This document explains the environment variable setup and validation for the Phrames application.

## Environment Files

The application uses the following environment files:

- `.env.example` - Template with all required variables (committed to git)
- `.env.local` - Local development environment (NOT committed to git)
- `.env` - Legacy file (being phased out)

## Required Environment Variables

### Firebase Client Configuration (Public)
These variables are safe to expose in the browser:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Admin Configuration (Private - Server-side only)
These must NEVER be exposed to the client:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Cashfree Payment Gateway (Private - Server-side only)
Required for payment processing:

```bash
CASHFREE_CLIENT_ID=your-cashfree-client-id
CASHFREE_CLIENT_SECRET=your-cashfree-client-secret
CASHFREE_ENV=SANDBOX  # or PRODUCTION
```

### Application Configuration

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL for payment callbacks
NEXT_PUBLIC_SITE_URL=https://phrames.cleffon.com  # Public site URL
SESSION_SECRET=your-32-character-secret  # Generate with: openssl rand -base64 32
```

## Environment Validation

The application automatically validates all required environment variables on startup using the instrumentation hook.

### Validation Process

1. **Startup Validation** (`instrumentation.ts`)
   - Runs once when the Next.js server starts
   - Validates all required environment variables
   - Logs warnings for missing optional variables
   - Throws error in production if critical variables are missing

2. **Runtime Validation** (`lib/env-validation.ts`)
   - Payment routes validate Cashfree configuration before processing
   - Prevents payment processing with invalid configuration

### Validation Functions

```typescript
// Validate all environment variables
import { validateEnvironment } from '@/lib/env-validation'
const result = validateEnvironment()

// Validate Cashfree-specific configuration
import { validateCashfreeConfig } from '@/lib/env-validation'
const cashfreeCheck = validateCashfreeConfig()
```

## Setup Instructions

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Check the console for validation results:
   ```
   🔍 Validating environment configuration...
   ✅ Environment configuration validated successfully
   ```

### Production Deployment (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all required variables from `.env.example`
4. Set the appropriate environment (Production/Preview/Development)
5. Redeploy the application

### Cashfree Configuration

1. **Sandbox Mode** (Testing):
   - Get credentials from [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
   - Set `CASHFREE_ENV=SANDBOX`
   - Use test cards for payments

2. **Production Mode** (Live):
   - Complete KYC verification on Cashfree
   - Get production credentials
   - Set `CASHFREE_ENV=PRODUCTION`
   - Test thoroughly before going live

## Troubleshooting

### Missing Environment Variables

If you see validation errors on startup:

```
❌ Environment Configuration Errors:
   - CASHFREE_CLIENT_ID is not configured - payment processing will fail
   - CASHFREE_CLIENT_SECRET is not configured - payment processing will fail
```

**Solution**: Add the missing variables to your `.env.local` file or Vercel environment variables.

### Payment Processing Fails

If payments fail with configuration errors:

1. Check that all Cashfree variables are set
2. Verify `NEXT_PUBLIC_APP_URL` matches your deployment URL
3. Check Cashfree dashboard for API credential issues
4. Verify `CASHFREE_ENV` is set to correct environment

### Instrumentation Not Running

If you don't see validation logs on startup:

1. Ensure `experimental.instrumentationHook` is enabled in `next.config.js`
2. Delete `.next` folder and rebuild: `rm -rf .next && npm run dev`
3. Check that `instrumentation.ts` is in the root directory

## Security Best Practices

1. ✅ Never commit `.env.local` to version control
2. ✅ Keep `.env.example` updated with all required variables (without values)
3. ✅ Use different credentials for development and production
4. ✅ Rotate secrets regularly
5. ✅ Use Vercel's encrypted environment variables for production
6. ✅ Never expose server-side variables (without `NEXT_PUBLIC_` prefix) to the client

## References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Cashfree Documentation](https://docs.cashfree.com/)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
