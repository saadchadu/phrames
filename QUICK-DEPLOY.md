# Quick Deploy to Vercel - Command Reference

This is a quick reference for deploying to Vercel. For detailed instructions, see VERCEL-DEPLOYMENT-GUIDE.md.

## Prerequisites

- Vercel account created
- All environment variables ready (see VERCEL-ENV-CHECKLIST.md)
- Git repository pushed to remote

## Quick Deploy Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Production

```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (first time) or **Yes** (subsequent)
- Project name? **phrames** (or your choice)
- Directory? **./`**
- Override settings? **No**

### 4. Add Environment Variables

Go to Vercel Dashboard:
1. https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from VERCEL-ENV-CHECKLIST.md

**Required Variables**:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
SESSION_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_APP_URL
CASHFREE_CLIENT_ID
CASHFREE_CLIENT_SECRET
CASHFREE_ENV
```

### 5. Redeploy After Adding Variables

```bash
vercel --prod
```

### 6. Configure Cashfree Webhook

1. Login to Cashfree: https://merchant.cashfree.com/
2. Go to Developers → Webhooks
3. Add webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select events: PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK
5. Save

### 7. Verify Deployment

```bash
./scripts/verify-deployment.sh https://your-domain.com
```

### 8. Test Payment Flow

1. Visit your site
2. Sign up / Login
3. Create a campaign
4. Click "Publish"
5. Select a plan
6. Complete payment with test card:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: Any future date
7. Verify campaign activates

## Useful Commands

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Logs for specific deployment
vercel logs [deployment-url]
```

### List Deployments

```bash
vercel ls
```

### Rollback to Previous Deployment

```bash
vercel rollback
```

### Check Environment Variables

```bash
vercel env ls
```

### Add Environment Variable via CLI

```bash
vercel env add VARIABLE_NAME
```

### Remove Environment Variable

```bash
vercel env rm VARIABLE_NAME
```

### Link Local Project to Vercel

```bash
vercel link
```

### Deploy to Preview (not production)

```bash
vercel
```

## Quick Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs [deployment-url]

# Test build locally
npm run build
```

### Environment Variables Not Working

1. Verify variables added for "Production" environment
2. Check variable names (case-sensitive)
3. Redeploy: `vercel --prod`

### Payment System Not Working

1. Check Cashfree variables are set
2. Verify `CASHFREE_ENV=SANDBOX` or `PRODUCTION`
3. Check webhook URL in Cashfree dashboard
4. View logs: `vercel logs --follow`

### Firebase Connection Issues

1. Verify all Firebase variables are set
2. Check `FIREBASE_PRIVATE_KEY` format (includes quotes and newlines)
3. Ensure Firebase project is active

## Monitoring

### Check Deployment Status

```bash
vercel ls
```

### Monitor Logs

```bash
vercel logs --follow
```

### Check Build Status

Go to: https://vercel.com/dashboard → Your Project → Deployments

## Production Checklist

Before going live:

- [ ] All environment variables added
- [ ] Deployment successful (status: Ready)
- [ ] Verification script passes
- [ ] Authentication works
- [ ] Campaign creation works
- [ ] Payment flow tested in sandbox
- [ ] Webhook configured in Cashfree
- [ ] Logs show no errors

## Switch to Production Mode

When ready for real payments:

1. Update environment variables in Vercel:
   - `CASHFREE_CLIENT_ID` → production value
   - `CASHFREE_CLIENT_SECRET` → production value
   - `CASHFREE_ENV=PRODUCTION`

2. Redeploy:
   ```bash
   vercel --prod
   ```

3. Update Cashfree webhook to production URL

4. Test with small payment (₹49)

## Support

- **Detailed Guide**: VERCEL-DEPLOYMENT-GUIDE.md
- **Environment Variables**: VERCEL-ENV-CHECKLIST.md
- **Pre-Deployment**: PRE-DEPLOYMENT-CHECKLIST.md
- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support

---

**Ready to deploy?** Run: `vercel --prod`
