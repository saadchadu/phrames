# Vercel Deployment Guide - Paid Campaign System

This guide provides step-by-step instructions for deploying the Phrames application with the paid campaign system to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm i -g vercel`
- All environment variables ready (see below)
- Firebase project configured
- Cashfree account with API credentials

## Step 1: Prepare Environment Variables

You need to add the following environment variables to your Vercel project. Have these values ready:

### Firebase Client Configuration (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Admin Configuration (Private - Server-side only)
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Session Secret
```
SESSION_SECRET=
```

### Public URLs
```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_APP_URL=
```

### Cashfree Payment Configuration
```
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_ENV=SANDBOX
```

## Step 2: Deploy to Vercel via CLI

### Option A: First-time Deployment

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No (for new project)
   - Project name? phrames (or your preferred name)
   - Directory? ./
   - Override settings? No

### Option B: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project settings
4. Deploy

## Step 3: Add Environment Variables in Vercel Dashboard

1. **Navigate to Project Settings**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

2. **Add Each Variable**:
   For each environment variable:
   - Click "Add New"
   - Enter variable name (e.g., `CASHFREE_CLIENT_ID`)
   - Enter variable value
   - Select environments: Production, Preview, Development
   - Click "Save"

3. **Important Variables to Add**:

   **Public Variables** (NEXT_PUBLIC_*):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_SITE_URL` (e.g., https://phrames.cleffon.com)
   - `NEXT_PUBLIC_APP_URL` (e.g., https://phrames.cleffon.com)

   **Private Variables** (Server-side only):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (include quotes and newlines: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n")
   - `SESSION_SECRET`
   - `CASHFREE_CLIENT_ID`
   - `CASHFREE_CLIENT_SECRET`
   - `CASHFREE_ENV` (SANDBOX for testing, PRODUCTION for live)

4. **Redeploy After Adding Variables**:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

### 4.1 Check Build Success

1. Go to Vercel Dashboard → Deployments
2. Verify latest deployment shows "Ready"
3. Check build logs for any errors

### 4.2 Test Application Access

1. Visit your production URL
2. Verify homepage loads correctly
3. Test user authentication (login/signup)
4. Check that dashboard is accessible

### 4.3 Test Payment System

1. **Create a Test Campaign**:
   - Login to your account
   - Navigate to /create
   - Fill in campaign details
   - Click "Publish"

2. **Verify Payment Modal**:
   - Payment modal should open
   - All 5 pricing plans should display
   - Prices should be correct (₹49, ₹199, ₹499, ₹999, ₹1599)

3. **Test Payment Initiation**:
   - Select a plan
   - Click "Continue to Checkout"
   - Should redirect to Cashfree checkout page

4. **Complete Test Payment** (Sandbox):
   - Use test card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: Any future date
   - Complete payment

5. **Verify Campaign Activation**:
   - Should redirect back to dashboard
   - Campaign should show "Active" badge
   - Expiry date should be displayed
   - Campaign should be accessible via public URL

### 4.4 Test API Endpoints

Test payment initiation endpoint:
```bash
curl -X POST https://your-domain.com/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"campaignId": "test-id", "planType": "week"}'
```

Test webhook endpoint (should return 405 for GET):
```bash
curl https://your-domain.com/api/payments/webhook
```

## Step 5: Configure Cashfree Webhook

1. **Login to Cashfree Dashboard**:
   - Go to https://merchant.cashfree.com/

2. **Navigate to Webhooks**:
   - Click "Developers" → "Webhooks"

3. **Add Webhook URL**:
   - Click "Add Webhook"
   - Enter URL: `https://your-domain.com/api/payments/webhook`
   - Select events:
     - `PAYMENT_SUCCESS_WEBHOOK`
     - `PAYMENT_FAILED_WEBHOOK`
   - Save configuration

4. **Test Webhook**:
   - Complete a test payment
   - Check Vercel function logs for webhook receipt
   - Verify campaign activates after payment

## Step 6: Monitor Deployment

### 6.1 Check Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs [deployment-url]
```

Or in Vercel Dashboard:
- Go to your project
- Click "Logs" tab
- Filter by function or time range

### 6.2 Monitor Payment Processing

1. **Check Firestore**:
   - Open Firebase Console
   - Navigate to Firestore Database
   - Check `payments` collection for new records
   - Verify campaigns have correct payment fields

2. **Check Cashfree Dashboard**:
   - View transactions in Cashfree dashboard
   - Verify payment status matches Firestore

### 6.3 Set Up Alerts

In Vercel Dashboard:
1. Go to Settings → Notifications
2. Enable alerts for:
   - Deployment failures
   - Function errors
   - High error rates

## Step 7: Production Checklist

Before going live with real payments:

- [ ] All environment variables added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] Cashfree webhook configured with production URL
- [ ] Test payment completed successfully in sandbox
- [ ] Campaign activates after test payment
- [ ] Public campaign page shows active campaigns only
- [ ] Dashboard displays correct status badges
- [ ] Firestore security rules deployed
- [ ] Firebase Cloud Function deployed for expiry checks
- [ ] Error monitoring configured
- [ ] Backup plan ready for rollback

### Switch to Production Mode

When ready for live payments:

1. **Update Cashfree Credentials**:
   - In Vercel Dashboard → Environment Variables
   - Update `CASHFREE_CLIENT_ID` to production value
   - Update `CASHFREE_CLIENT_SECRET` to production value
   - Update `CASHFREE_ENV` to `PRODUCTION`

2. **Redeploy**:
   ```bash
   vercel --prod
   ```

3. **Test with Real Payment**:
   - Create a test campaign
   - Complete a small payment (₹49)
   - Verify everything works correctly

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Run `npm install` locally and commit package-lock.json

**Error**: "Environment variable not found"
- **Solution**: Check all required variables are added in Vercel dashboard

### Payment Initiation Fails

**Error**: "Payment system is not configured"
- **Solution**: Verify Cashfree environment variables are set correctly
- Check variable names match exactly (case-sensitive)

**Error**: "Unauthorized"
- **Solution**: Check Firebase Admin credentials are correct
- Verify `FIREBASE_PRIVATE_KEY` includes quotes and newlines

### Webhook Not Working

**Error**: Payments succeed but campaigns don't activate
- **Solution**: 
  1. Check webhook URL in Cashfree dashboard
  2. View Vercel function logs for webhook endpoint
  3. Verify webhook signature verification is working
  4. Check Firestore for payment records

### Environment Variables Not Loading

**Error**: Variables undefined in production
- **Solution**:
  1. Verify variables are added for "Production" environment
  2. Redeploy after adding variables
  3. Check variable names match code exactly

## Rollback Procedure

If issues occur after deployment:

1. **Instant Rollback**:
   - Go to Vercel Dashboard → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI**:
   ```bash
   vercel rollback
   ```

3. **Disable Payments Temporarily**:
   - Set `CASHFREE_ENV` to invalid value
   - Redeploy

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. For API routes:

```typescript
// In API route
export const config = {
  runtime: 'edge', // Use Edge Runtime for faster response
}
```

### Monitor Performance

1. Go to Vercel Dashboard → Analytics
2. Check:
   - Response times
   - Error rates
   - Traffic patterns

## Security Best Practices

- [ ] Never commit `.env.local` to Git
- [ ] Use environment variables for all secrets
- [ ] Enable Vercel's DDoS protection
- [ ] Set up rate limiting for payment endpoints
- [ ] Regularly rotate API keys
- [ ] Monitor for suspicious payment activity
- [ ] Keep dependencies updated

## Cost Monitoring

### Vercel Costs
- **Hobby Plan**: Free (limited bandwidth)
- **Pro Plan**: $20/month (recommended for production)

### Monitor Usage
1. Go to Vercel Dashboard → Usage
2. Check:
   - Bandwidth usage
   - Function invocations
   - Build minutes

## Next Steps

After successful deployment:

1. **Test Complete User Flow**:
   - Create campaign → Pay → Activate → Expire → Reactivate

2. **Monitor First 24 Hours**:
   - Watch for errors in logs
   - Check payment success rate
   - Verify webhook processing

3. **User Acceptance Testing**:
   - Have test users complete full flow
   - Gather feedback on payment experience

4. **Documentation**:
   - Update user documentation with production URLs
   - Create FAQ for common payment issues

5. **Marketing**:
   - Announce paid campaign system to users
   - Communicate pricing and benefits

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Cashfree Docs**: https://docs.cashfree.com/
- **Firebase Docs**: https://firebase.google.com/docs

## Maintenance Schedule

### Daily
- Check error logs
- Monitor payment success rate

### Weekly
- Review Vercel analytics
- Check for dependency updates
- Review Cashfree transaction reports

### Monthly
- Analyze payment conversion rates
- Review and optimize performance
- Update documentation as needed

---

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback

# Check environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME
```

---

**Deployment Complete!** 🎉

Your paid campaign system is now live on Vercel. Monitor the first few payments closely and be ready to rollback if any issues occur.
