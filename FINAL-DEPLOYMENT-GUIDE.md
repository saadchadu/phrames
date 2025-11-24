# Final Deployment Guide - Phrames

## 🚀 Pre-Deployment Checklist

### 1. Security Audit
Run the security audit script:
```bash
./scripts/security-audit.sh
```

Fix any critical issues before proceeding.

### 2. Environment Variables

#### Vercel Environment Variables
Set these in Vercel dashboard (Settings → Environment Variables):

**Firebase Configuration:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Cashfree Configuration:**
```
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret_key
NEXT_PUBLIC_CASHFREE_ENV=PROD
```

**Application URLs:**
```
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com
```

#### Firebase Functions Environment Variables
```bash
cd functions
firebase functions:config:set \
  cashfree.app_id="your_production_app_id" \
  cashfree.secret_key="your_production_secret_key" \
  app.url="https://phrames.cleffon.com"
```

### 3. Firebase Setup

#### Deploy Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

#### Create Firestore Indexes
Required indexes for optimal performance:
- Collection: `campaigns`
  - Fields: `createdBy` (Ascending), `createdAt` (Descending)
  - Fields: `visibility` (Ascending), `status` (Ascending), `isActive` (Ascending), `createdAt` (Descending)

Create these in Firebase Console or they'll be auto-created on first query.

#### Deploy Firebase Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Verify function deployment:
```bash
./verify-function-deployment.sh
```

### 4. Database Migration

Run the email migration for existing campaigns:
1. Deploy the application first
2. Navigate to `/admin/migrate-emails`
3. Click "Run Migration"
4. Verify all campaigns have `createdByEmail` field

### 5. Vercel Deployment

#### Initial Deployment
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Configure Domain
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain: `phrames.cleffon.com`
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued (automatic)

### 6. Post-Deployment Verification

#### Test Critical Flows

**1. User Registration**
- [ ] Sign up with email
- [ ] Sign up with Google
- [ ] Verify email validation
- [ ] Check user profile creation

**2. Campaign Creation**
- [ ] Create first free campaign
- [ ] Verify campaign is active for 1 month
- [ ] Check campaign visibility on landing page
- [ ] Test image upload validation

**3. Payment Flow**
- [ ] Create second campaign (should require payment)
- [ ] Test payment with small amount (₹49)
- [ ] Verify webhook delivery
- [ ] Check campaign activation after payment
- [ ] Verify payment logging

**4. Campaign Features**
- [ ] Test campaign page access
- [ ] Test image generation
- [ ] Test download functionality
- [ ] Test share functionality
- [ ] Test QR code generation
- [ ] Verify analytics tracking

**5. Campaign Expiry**
- [ ] Wait for or manually trigger expiry check
- [ ] Verify expired campaigns become inactive
- [ ] Test reactivation flow
- [ ] Check email notifications (if implemented)

#### Performance Testing
```bash
# Run Lighthouse audit
npx lighthouse https://phrames.cleffon.com --view

# Check Core Web Vitals
# Use PageSpeed Insights: https://pagespeed.web.dev/
```

Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

#### Security Testing
- [ ] Verify HTTPS is enforced
- [ ] Test authentication on protected routes
- [ ] Verify API routes are protected
- [ ] Test webhook signature verification
- [ ] Check for exposed secrets in client code

### 7. Monitoring Setup

#### Firebase Console
- Set up budget alerts
- Enable Cloud Logging
- Configure error reporting

#### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Set up custom events if needed

#### Regular Monitoring
Run these scripts periodically:
```bash
# Check system health
./scripts/check-system-health.sh

# Monitor payment logs
./scripts/analyze-payment-logs.sh

# Monitor dashboard
./scripts/monitor-dashboard.sh
```

### 8. Legal Pages

Verify these pages are accessible:
- [ ] Terms & Conditions: `/terms`
- [ ] Refund Policy: `/refund-policy`
- [ ] Footer links working on all pages

### 9. SEO Verification

- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt is accessible
- [ ] Check meta tags on all pages
- [ ] Verify Open Graph tags
- [ ] Test social media sharing

### 10. Backup Strategy

#### Firestore Backup
Set up automated backups in Firebase Console:
1. Go to Firestore → Backups
2. Enable automated backups
3. Set retention period (recommended: 30 days)

#### Code Backup
- [ ] Ensure all code is pushed to Git
- [ ] Tag the production release
- [ ] Document the deployment version

## 🔧 Troubleshooting

### Common Issues

**Issue: Webhook not receiving events**
- Verify webhook URL in Cashfree dashboard
- Check Firebase Functions logs
- Verify signature verification is working
- Test with Cashfree webhook testing tool

**Issue: Campaign not activating after payment**
- Check Firebase Functions logs
- Verify webhook was received
- Check payment status in Firestore
- Manually trigger activation if needed

**Issue: Images not uploading**
- Check Firebase Storage rules
- Verify file size limits
- Check image validation logic
- Review browser console for errors

**Issue: Authentication errors**
- Verify Firebase config in environment variables
- Check Firebase Authentication is enabled
- Verify authorized domains in Firebase Console

## 📊 Success Metrics

Monitor these KPIs after launch:

**Week 1:**
- User registration rate
- Campaign creation rate
- Payment conversion rate
- Error rate

**Month 1:**
- User retention
- Campaign renewal rate
- Average campaign duration
- Support ticket volume

**Ongoing:**
- Monthly active users
- Revenue growth
- Feature usage
- Performance metrics

## 🆘 Support & Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor payment success rate
- Review user feedback

**Weekly:**
- Review analytics
- Check system performance
- Update documentation

**Monthly:**
- Security audit
- Dependency updates
- Feature planning
- Cost optimization

### Emergency Contacts

**Technical Issues:**
- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/support
- Cashfree Support: https://www.cashfree.com/contact-us

**Business Contact:**
- Website: https://cleffon.com

## 🎉 Launch Announcement

After successful deployment and verification:

1. **Soft Launch**
   - Test with small group of users
   - Monitor for issues
   - Gather feedback

2. **Public Launch**
   - Announce on social media
   - Update company website
   - Send to existing users (if any)

3. **Post-Launch**
   - Monitor closely for first 48 hours
   - Be ready to rollback if needed
   - Respond to user feedback quickly

## 📝 Deployment Log

Document each deployment:

```
Date: [Date]
Version: [Version]
Deployed By: [Name]
Changes: [Summary of changes]
Issues: [Any issues encountered]
Rollback Plan: [How to rollback if needed]
```

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] All environment variables configured
- [ ] Firebase rules deployed
- [ ] Firebase Functions deployed
- [ ] Security audit passed
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Legal pages accessible
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Team trained on support procedures
- [ ] Rollback plan documented
- [ ] Success metrics defined

---

**Status:** Ready for Production 🚀

**Deployment Date:** _____________

**Deployed By:** _____________

**Production URL:** https://phrames.cleffon.com

---

Good luck with your launch! 🎉
