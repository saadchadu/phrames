# 🚀 Deployment Guide - Go Live!

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all production environment variables are set:

```bash
# Vercel Dashboard → Your Project → Settings → Environment Variables

# Firebase (Production)
FIREBASE_PROJECT_ID=phrames-app
FIREBASE_CLIENT_EMAIL=your-service-account@phrames-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=phrames-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=phrames-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=phrames-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Cashfree (PRODUCTION MODE!)
CASHFREE_CLIENT_ID=your-production-client-id
CASHFREE_CLIENT_SECRET=your-production-secret
CASHFREE_ENV=PRODUCTION
NEXT_PUBLIC_CASHFREE_ENV=PRODUCTION

# App URL
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Firebase Setup

#### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

#### Deploy Storage Rules (if needed)
```bash
firebase deploy --only storage
```

#### Verify Firebase Console Settings
- ✅ Email/Password auth enabled
- ✅ Google OAuth enabled
- ✅ Email verification enabled
- ✅ Authorized domains include: phrames.cleffon.com

### 3. Cashfree Setup

#### Switch to Production
1. Log in to Cashfree Dashboard
2. Switch to Production mode
3. Get Production API keys
4. Update environment variables
5. Configure webhook URL: `https://phrames.cleffon.com/api/webhooks/cashfree`
6. Test with small payment

### 4. Build & Test Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start

# Open http://localhost:3000 and test:
# - Signup flow
# - Login flow
# - Campaign creation
# - Payment flow (use test mode first)
```

## Deployment Steps

### Option 1: Vercel (Recommended)

#### First Time Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables (do this in Vercel Dashboard)
# Then deploy
vercel --prod
```

#### Subsequent Deployments
```bash
# Deploy to production
vercel --prod

# Or just push to main branch (auto-deploy)
git push origin main
```

### Option 2: Manual Deployment

```bash
# Build
npm run build

# Deploy .next folder and other files to your hosting
# Ensure Node.js 18+ is installed on server
# Run: npm start
```

## Post-Deployment Verification

### 1. Check All Pages Load
- [ ] Homepage: https://phrames.cleffon.com
- [ ] About: https://phrames.cleffon.com/about
- [ ] Contact: https://phrames.cleffon.com/contact
- [ ] Login: https://phrames.cleffon.com/login
- [ ] Signup: https://phrames.cleffon.com/signup
- [ ] Blog: https://phrames.cleffon.com/blog
- [ ] Terms: https://phrames.cleffon.com/terms
- [ ] Privacy: https://phrames.cleffon.com/privacy-policy

### 2. Test Critical Flows

#### Signup Flow
1. Go to /signup
2. Enter email (use real email)
3. Create account
4. Check verification email received
5. Click verification link
6. Verify email is verified

#### Login Flow
1. Go to /login
2. Enter credentials
3. Verify redirect to dashboard
4. Check user data loads

#### Campaign Creation
1. Go to /create
2. Upload frame image
3. Fill campaign details
4. Create campaign
5. Verify campaign appears in dashboard

#### Payment Flow (IMPORTANT!)
1. Create a campaign
2. Click "Activate Campaign"
3. Select a plan
4. Try to pay (use small amount first!)
5. Complete payment
6. Verify campaign activates
7. Check payment appears in admin panel

### 3. Admin Panel Check
1. Login as admin (saadchadu@gmail.com)
2. Check all admin pages load
3. Verify user management works
4. Verify campaign management works
5. Verify payment tracking works
6. Test refund flow (if needed)

### 4. SEO Verification
- [ ] Check robots.txt: https://phrames.cleffon.com/robots.txt
- [ ] Check sitemap: https://phrames.cleffon.com/sitemap.xml
- [ ] Verify meta tags (view page source)
- [ ] Test mobile-friendliness: https://search.google.com/test/mobile-friendly
- [ ] Test page speed: https://pagespeed.web.dev/

### 5. Analytics Check
- [ ] Google Analytics tracking works
- [ ] Events are being recorded
- [ ] Real-time data shows up

## Monitoring Setup

### 1. Error Tracking (Optional but Recommended)

#### Sentry Setup
```bash
npm install @sentry/nextjs

# Follow setup wizard
npx @sentry/wizard@latest -i nextjs
```

### 2. Uptime Monitoring

Free options:
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- StatusCake: https://www.statuscake.com

Set up alerts for:
- Website down
- Response time > 3 seconds
- SSL certificate expiry

### 3. Performance Monitoring

Use:
- Vercel Analytics (built-in)
- Google PageSpeed Insights
- Web Vitals monitoring

## Rollback Plan

If something goes wrong:

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Manual
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## Launch Announcement

### 1. Social Media
- [ ] Twitter announcement
- [ ] LinkedIn post
- [ ] Facebook post
- [ ] Instagram story

### 2. Communities
- [ ] Product Hunt launch
- [ ] Reddit (relevant subreddits)
- [ ] Indie Hackers
- [ ] Hacker News (Show HN)

### 3. Email
- [ ] Send to beta users (if any)
- [ ] Send to waiting list (if any)
- [ ] Personal network announcement

### 4. SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Submit to web directories

## Support Preparation

### 1. Support Email
Set up: support@phrames.cleffon.com or support@cleffon.com

### 2. FAQ Page
Create common questions and answers

### 3. Response Templates
Prepare templates for:
- Payment issues
- Technical problems
- Feature requests
- Refund requests

### 4. Monitoring
- Check support email daily
- Monitor social media mentions
- Watch error logs
- Review user feedback

## Success Metrics

Track these KPIs:
- Daily signups
- Email verification rate
- Campaign creation rate
- Payment conversion rate
- User retention rate
- Page load time
- Error rate
- Support tickets

## Emergency Contacts

- **Vercel Support**: vercel.com/support
- **Firebase Support**: firebase.google.com/support
- **Cashfree Support**: support@cashfree.com
- **Domain Registrar**: [Your registrar support]

---

## 🎉 YOU'RE READY TO LAUNCH!

Everything is set up and ready. Just:
1. ✅ Set environment variables
2. ✅ Deploy to production
3. ✅ Test critical flows
4. ✅ Monitor for issues
5. ✅ Announce launch!

**Good luck with your launch! 🚀**

Need help? Check the logs:
- Vercel: Dashboard → Your Project → Logs
- Firebase: Console → Firestore → Usage
- Cashfree: Dashboard → Transactions
