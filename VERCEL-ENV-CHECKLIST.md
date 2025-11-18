# Vercel Environment Variables Checklist

Use this checklist to ensure all required environment variables are properly configured in your Vercel project.

## How to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. For each variable below:
   - Click "Add New"
   - Enter the variable name
   - Enter the variable value
   - Select environments: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

## Required Environment Variables

### 🔥 Firebase Client Configuration (Public)

These variables are safe to expose in the browser and are required for Firebase client SDK.

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - **Value**: Your Firebase API key
  - **Example**: `AIzaSyA5tamwShPZ2be9aaXQNso547qDVeOI1aw`
  - **Where to find**: Firebase Console → Project Settings → General

- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - **Value**: Your Firebase auth domain
  - **Example**: `phrames-app.firebaseapp.com`
  - **Where to find**: Firebase Console → Project Settings → General

- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - **Value**: Your Firebase project ID
  - **Example**: `phrames-app`
  - **Where to find**: Firebase Console → Project Settings → General

- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - **Value**: Your Firebase storage bucket
  - **Example**: `phrames-app.firebasestorage.app`
  - **Where to find**: Firebase Console → Project Settings → General

- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - **Value**: Your Firebase messaging sender ID
  - **Example**: `452206245013`
  - **Where to find**: Firebase Console → Project Settings → General

- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
  - **Value**: Your Firebase app ID
  - **Example**: `1:452206245013:web:209a1883f3caba9f7c979c`
  - **Where to find**: Firebase Console → Project Settings → General

### 🔐 Firebase Admin Configuration (Private - Server-side only)

These variables are used for server-side Firebase Admin SDK and must be kept secret.

- [ ] `FIREBASE_PROJECT_ID`
  - **Value**: Your Firebase project ID (same as above)
  - **Example**: `phrames-app`
  - **Where to find**: Firebase Console → Project Settings → General

- [ ] `FIREBASE_CLIENT_EMAIL`
  - **Value**: Your Firebase service account email
  - **Example**: `firebase-adminsdk-fbsvc@phrames-app.iam.gserviceaccount.com`
  - **Where to find**: Firebase Console → Project Settings → Service Accounts → Generate new private key

- [ ] `FIREBASE_PRIVATE_KEY`
  - **Value**: Your Firebase service account private key
  - **Format**: Must include quotes and newlines: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
  - **Important**: Copy the entire key including BEGIN/END markers
  - **Where to find**: Firebase Console → Project Settings → Service Accounts → Generate new private key

### 🔑 Session Secret

- [ ] `SESSION_SECRET`
  - **Value**: A random 32+ character string
  - **Generate**: Run `openssl rand -base64 32` in terminal
  - **Example**: `your-32-character-session-secret-here`
  - **Important**: Keep this secret and unique

### 🌐 Public URLs

- [ ] `NEXT_PUBLIC_SITE_URL`
  - **Value**: Your production domain
  - **Example**: `https://phrames.cleffon.com`
  - **Important**: No trailing slash

- [ ] `NEXT_PUBLIC_APP_URL`
  - **Value**: Your production domain (same as above for production)
  - **Example**: `https://phrames.cleffon.com`
  - **Important**: Used for payment callbacks, no trailing slash

### 💳 Cashfree Payment Gateway (Private - Server-side only)

These variables are required for payment processing and must be kept secret.

#### For Testing (Sandbox)

- [ ] `CASHFREE_CLIENT_ID`
  - **Value**: Your Cashfree sandbox client ID
  - **Where to find**: Cashfree Dashboard → Developers → API Keys → Sandbox
  - **Example**: `TEST123456789`

- [ ] `CASHFREE_CLIENT_SECRET`
  - **Value**: Your Cashfree sandbox client secret
  - **Where to find**: Cashfree Dashboard → Developers → API Keys → Sandbox
  - **Example**: `cfsk_ma_test_xxxxxxxxxxxxx`

- [ ] `CASHFREE_ENV`
  - **Value**: `SANDBOX`
  - **Important**: Use SANDBOX for testing

#### For Production (Live Payments)

When ready to accept real payments, update these variables:

- [ ] `CASHFREE_CLIENT_ID`
  - **Value**: Your Cashfree production client ID
  - **Where to find**: Cashfree Dashboard → Developers → API Keys → Production
  - **Important**: Only use after completing KYC verification

- [ ] `CASHFREE_CLIENT_SECRET`
  - **Value**: Your Cashfree production client secret
  - **Where to find**: Cashfree Dashboard → Developers → API Keys → Production
  - **Important**: Keep this absolutely secret

- [ ] `CASHFREE_ENV`
  - **Value**: `PRODUCTION`
  - **Important**: Only change to PRODUCTION when ready for live payments

## Verification Steps

After adding all environment variables:

### 1. Verify Variables Are Set

```bash
# List all environment variables
vercel env ls
```

You should see all variables listed above.

### 2. Redeploy Application

After adding or updating environment variables, you must redeploy:

```bash
vercel --prod
```

### 3. Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check "Building" logs for any errors
4. Verify deployment status is "Ready"

### 4. Test Environment Variables

Run the verification script:

```bash
./scripts/verify-deployment.sh https://your-domain.com
```

### 5. Manual Testing

1. **Test Firebase Connection**:
   - Visit your site
   - Try to sign up / log in
   - Should work without errors

2. **Test Payment System**:
   - Create a campaign
   - Click "Publish"
   - Payment modal should open
   - Click "Continue to Checkout"
   - Should redirect to Cashfree (no errors about missing config)

## Common Issues

### Issue: "Firebase: Error (auth/invalid-api-key)"

**Solution**: Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is set correctly in Vercel.

### Issue: "Payment system is not configured"

**Solution**: 
- Verify `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, and `CASHFREE_ENV` are set
- Check variable names are exactly correct (case-sensitive)
- Redeploy after adding variables

### Issue: "Firebase Admin initialization failed"

**Solution**:
- Check `FIREBASE_PRIVATE_KEY` includes quotes and newlines
- Format should be: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- Verify `FIREBASE_CLIENT_EMAIL` is correct

### Issue: Variables not loading in production

**Solution**:
- Ensure variables are added for "Production" environment
- Redeploy after adding variables
- Clear browser cache and try again

### Issue: CORS errors

**Solution**:
- Verify `NEXT_PUBLIC_APP_URL` matches your actual domain
- Check for trailing slashes (should not have them)
- Ensure HTTPS is used in production

## Security Best Practices

- ✅ Never commit `.env.local` to Git
- ✅ Use different Cashfree credentials for sandbox vs production
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use Vercel's environment variable encryption
- ✅ Limit access to Vercel project settings
- ✅ Monitor for unauthorized access attempts
- ✅ Keep Firebase Admin credentials secure

## Environment-Specific Configuration

### Development
- Use sandbox Cashfree credentials
- Use `http://localhost:3000` for `NEXT_PUBLIC_APP_URL`

### Preview (Vercel Preview Deployments)
- Use sandbox Cashfree credentials
- Use preview URL for `NEXT_PUBLIC_APP_URL`

### Production
- Use production Cashfree credentials (after KYC)
- Use production domain for `NEXT_PUBLIC_APP_URL`
- Set `CASHFREE_ENV=PRODUCTION`

## Quick Copy Template

Copy this template and fill in your values:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Session
SESSION_SECRET=

# URLs
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_URL=

# Cashfree (Private)
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_ENV=SANDBOX
```

## Support

If you encounter issues:

1. Check Vercel deployment logs: `vercel logs --follow`
2. Review Firebase Console for authentication errors
3. Check Cashfree Dashboard for API credential issues
4. Refer to TROUBLESHOOTING.md for common solutions

---

**✅ Checklist Complete?**

Once all variables are added and verified:
- [ ] All environment variables added to Vercel
- [ ] Application redeployed
- [ ] Build successful
- [ ] Manual testing passed
- [ ] Payment flow tested in sandbox
- [ ] Ready for production (or ready to test)

**Next Step**: Proceed with testing the payment flow using the guide in PAYMENT-SYSTEM-TESTING.md
