# Paid Campaign System - Deployment Guide

This guide will help you deploy the complete paid-only campaign activation system with Cashfree payment integration and automatic expiry management.

## Prerequisites

- Firebase project with Firestore and Authentication enabled
- Cashfree merchant account (sign up at https://www.cashfree.com/)
- Vercel account for deployment
- Node.js 18+ installed locally

## Step 1: Cashfree Setup

### 1.1 Create Cashfree Account

1. Sign up at https://www.cashfree.com/
2. Complete KYC verification
3. Navigate to Developers → API Keys

### 1.2 Get API Credentials

1. **Sandbox Credentials** (for testing):
   - Go to Developers → API Keys → Sandbox
   - Copy `Client ID` and `Client Secret`

2. **Production Credentials** (for live payments):
   - Complete business verification
   - Go to Developers → API Keys → Production
   - Copy `Client ID` and `Client Secret`

### 1.3 Configure Webhook

1. Go to Developers → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - `PAYMENT_SUCCESS_WEBHOOK`
   - `PAYMENT_FAILED_WEBHOOK`
4. Save webhook configuration

## Step 2: Environment Variables

### 2.1 Local Development

Create `.env.local` file in project root:

```env
# Firebase Configuration (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (for API routes)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Cashfree Configuration
CASHFREE_CLIENT_ID=your-cashfree-client-id
CASHFREE_CLIENT_SECRET=your-cashfree-client-secret
CASHFREE_ENV=SANDBOX
# Change to PRODUCTION for live payments

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.2 Vercel Deployment

Add environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. For production, set `CASHFREE_ENV=PRODUCTION`

**Important**: Make sure to add variables for all environments (Production, Preview, Development)

## Step 3: Firestore Security Rules

Deploy updated security rules:

```bash
firebase deploy --only firestore:rules
```

The rules have been updated to:
- Prevent client-side modification of payment fields
- Allow only active campaigns to be publicly visible
- Restrict payment and expiry log access

## Step 4: Deploy to Vercel

### 4.1 Initial Deployment

```bash
# Install dependencies
npm install

# Build and test locally
npm run build
npm run dev

# Deploy to Vercel
vercel --prod
```

### 4.2 Verify Deployment

1. Check that all environment variables are set
2. Test payment initiation endpoint:
   ```bash
   curl https://your-domain.com/api/payments/initiate
   ```
3. Verify webhook endpoint is accessible:
   ```bash
   curl https://your-domain.com/api/payments/webhook
   ```

## Step 5: Firebase Cloud Functions

### 5.1 Initialize Functions

```bash
firebase init functions
```

Select:
- TypeScript
- ESLint (optional)
- Install dependencies

### 5.2 Copy Function Files

```bash
cp functions-setup/index.ts functions/src/index.ts
cp functions-setup/package.json functions/package.json
cp functions-setup/tsconfig.json functions/tsconfig.json
```

### 5.3 Deploy Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

### 5.4 Verify Function Deployment

```bash
firebase functions:list
```

You should see `scheduledCampaignExpiryCheck` listed.

## Step 6: Testing

### 6.1 Test Payment Flow (Sandbox)

1. Create a new campaign
2. Click "Publish" to open payment modal
3. Select a plan
4. Click "Continue to Checkout"
5. Use Cashfree test cards:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4007 0000 0027 8403
   - CVV: Any 3 digits
   - Expiry: Any future date

### 6.2 Test Webhook

1. Complete a test payment
2. Check Firestore:
   - Campaign should have `isActive: true`
   - Campaign should have `expiresAt` timestamp
   - Payment record should exist in `payments` collection

### 6.3 Test Expiry Function

Manually trigger the function:

```bash
firebase functions:shell
```

Then run:
```javascript
scheduledCampaignExpiryCheck()
```

Or wait for the scheduled run at midnight UTC.

### 6.4 Test Public Campaign Access

1. Try accessing an inactive campaign: Should show "Campaign Inactive" message
2. Try accessing an active campaign: Should work normally
3. Try accessing an expired campaign: Should show "Campaign Inactive" message

## Step 7: Go Live

### 7.1 Switch to Production

1. Update Vercel environment variables:
   - `CASHFREE_ENV=PRODUCTION`
   - `CASHFREE_CLIENT_ID=production-client-id`
   - `CASHFREE_CLIENT_SECRET=production-client-secret`

2. Redeploy:
   ```bash
   vercel --prod
   ```

### 7.2 Update Cashfree Webhook

1. Go to Cashfree Dashboard → Developers → Webhooks
2. Update webhook URL to production domain
3. Verify webhook is active

### 7.3 Test Production Payment

1. Create a test campaign
2. Complete a real payment with a small amount (₹49)
3. Verify campaign activates
4. Check expiry date is correct

## Step 8: Monitoring

### 8.1 Payment Monitoring

Monitor payments in:
- Cashfree Dashboard → Transactions
- Firestore → `payments` collection
- Vercel → Functions → Logs

### 8.2 Expiry Function Monitoring

```bash
# View function logs
firebase functions:log --only scheduledCampaignExpiryCheck

# Check expiry logs in Firestore
# Collection: expiryLogs
```

### 8.3 Error Tracking

Set up alerts for:
- Payment initiation failures
- Webhook processing errors
- Expiry function failures

## Troubleshooting

### Payment Initiation Fails

**Error**: "Payment system is not configured"
- **Solution**: Check Cashfree environment variables are set in Vercel

**Error**: "Invalid authentication token"
- **Solution**: Ensure Firebase Admin credentials are correct

### Webhook Not Receiving Events

**Error**: Payments succeed but campaigns don't activate
- **Solution**: 
  1. Check webhook URL in Cashfree dashboard
  2. Verify webhook endpoint is accessible
  3. Check Vercel function logs for errors

### Campaigns Not Expiring

**Error**: Expired campaigns still showing as active
- **Solution**:
  1. Check Cloud Function is deployed: `firebase functions:list`
  2. View function logs: `firebase functions:log`
  3. Manually trigger function to test

### CORS Errors

**Error**: CORS errors when initiating payment
- **Solution**: Ensure `NEXT_PUBLIC_APP_URL` is set correctly

## Security Checklist

- [ ] Cashfree credentials stored as environment variables (not in code)
- [ ] Webhook signature verification enabled in production
- [ ] Firestore security rules deployed
- [ ] Payment fields protected from client-side modification
- [ ] Firebase Admin credentials secured
- [ ] HTTPS enforced for all payment flows
- [ ] Rate limiting configured on payment endpoints

## Support

### Cashfree Support
- Email: support@cashfree.com
- Docs: https://docs.cashfree.com/

### Firebase Support
- Docs: https://firebase.google.com/docs
- Community: https://firebase.google.com/community

## Next Steps

After successful deployment:

1. **Monitor First Week**: Watch for any payment or expiry issues
2. **User Testing**: Have a few users test the complete flow
3. **Analytics**: Track payment conversion rates
4. **Optimization**: Adjust pricing or plans based on user feedback
5. **Email Notifications**: Consider adding expiry warning emails
6. **Auto-Renewal**: Consider implementing subscription auto-renewal

## Rollback Plan

If issues occur:

1. **Disable Payments**: Set `CASHFREE_ENV` to invalid value to prevent new payments
2. **Revert Code**: Use Vercel's instant rollback feature
3. **Pause Function**: Disable Cloud Function in Firebase Console
4. **Communicate**: Notify users of temporary payment system maintenance

## Cost Estimates

### Cashfree Fees
- Transaction fee: ~2% + ₹3 per transaction
- No setup or monthly fees

### Firebase Costs
- Cloud Functions: ~$0.40 per million invocations
- Firestore: Included in free tier for moderate usage
- Expected monthly cost: < $5 for small to medium traffic

### Vercel Costs
- Hobby plan: Free
- Pro plan: $20/month (recommended for production)

## Maintenance

### Weekly
- Check payment success rates
- Review error logs
- Monitor expiry function execution

### Monthly
- Review Cashfree transaction reports
- Analyze campaign activation rates
- Check for any security updates

### Quarterly
- Review and optimize pricing plans
- Update dependencies
- Performance optimization
