# Quick Deployment Guide

## 🚀 Deploy to Production in 5 Steps

### Step 1: Update Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and update:

```bash
# Critical - Change from SANDBOX to PRODUCTION
CASHFREE_ENV=PRODUCTION

# Update to production domain
NEXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com

# Verify these are set correctly
CASHFREE_CLIENT_ID=your-production-client-id
CASHFREE_CLIENT_SECRET=your-production-client-secret
```

### Step 2: Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules,storage
```

### Step 3: Verify Build Passes

```bash
npm run build
npm run type-check
```

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

Vercel will automatically deploy when you push to main.

### Step 5: Post-Deployment Verification

After deployment completes, test these critical flows:

1. **Homepage**: Visit https://phrames.cleffon.com
2. **User Registration**: Create a test account
3. **Campaign Creation**: Create a test campaign
4. **Payment Flow**: Test with a small amount
5. **Invoice Download**: Verify PDF generation works
6. **Admin Panel**: Check admin access

## ⚠️ Important Notes

### Payment Gateway
- Cashfree webhook URL must be configured: `https://phrames.cleffon.com/api/payments/webhook`
- Test with small amounts first
- Monitor webhook delivery in Cashfree dashboard

### GST Calculation
- ✅ Fixed: Payment gateway already includes GST
- Invoice now correctly shows breakdown without double-adding GST

### Known Issues Fixed
- ✅ All TypeScript errors resolved
- ✅ Console logs removed from production code
- ✅ Chart components type errors fixed
- ✅ Chromium import issues resolved
- ✅ All documentation files cleaned up

## 📊 Monitoring After Launch

### First Hour
- Check Vercel deployment logs
- Monitor error rates in Vercel dashboard
- Test payment flow with real transaction
- Verify webhook is receiving events

### First Day
- Monitor user registrations
- Check payment success rate
- Review any error logs
- Verify invoice generation

### First Week
- Review user feedback
- Monitor performance metrics
- Check for any edge cases
- Optimize based on usage patterns

## 🆘 Rollback Plan

If something goes wrong:

1. **Quick Rollback in Vercel**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Revert Environment Variables**
   - Change `CASHFREE_ENV` back to `SANDBOX`
   - Update URLs if needed

3. **Check Logs**
   - Vercel: Functions logs
   - Firebase: Firestore logs
   - Cashfree: Webhook logs

## 📞 Support Contacts

- **Vercel**: https://vercel.com/support
- **Firebase**: https://console.firebase.google.com/support
- **Cashfree**: https://merchant.cashfree.com/support

## ✅ Deployment Checklist

Before deploying:
- [ ] All environment variables updated in Vercel
- [ ] Firebase rules deployed
- [ ] Build passes locally
- [ ] Type check passes
- [ ] Cashfree webhook URL configured
- [ ] Domain DNS pointed to Vercel
- [ ] SSL certificate active

After deploying:
- [ ] Homepage loads correctly
- [ ] User can register/login
- [ ] Campaign creation works
- [ ] Payment flow completes
- [ ] Invoice downloads work
- [ ] Admin panel accessible
- [ ] No console errors in browser

---

**Ready to deploy?** Just push to main and Vercel will handle the rest!

```bash
git push origin main
```

Then watch the deployment at: https://vercel.com/dashboard
