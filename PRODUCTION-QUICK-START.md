# Production Quick Start Guide

## 🚀 Deploy in 5 Steps

### Step 1: Security Audit (2 minutes)
```bash
./scripts/security-audit.sh
```
Fix any critical issues before proceeding.

### Step 2: Deploy Firebase (5 minutes)
```bash
# Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# Deploy functions
cd functions
npm install && npm run build
firebase deploy --only functions
cd ..
```

### Step 3: Configure Vercel (3 minutes)
Set environment variables in Vercel dashboard:
- All `NEXT_PUBLIC_FIREBASE_*` variables
- `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` (production)
- `NEXT_PUBLIC_CASHFREE_ENV=PROD`
- `NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com`

### Step 4: Deploy to Vercel (2 minutes)
```bash
vercel --prod
```

### Step 5: Post-Deployment (5 minutes)
1. Visit `/admin/migrate-emails` and run migration
2. Test user registration
3. Test campaign creation
4. Test payment with ₹49
5. Verify campaign activation

## ✅ Production Checklist

**Before Launch:**
- [ ] Security audit passed
- [ ] All env vars configured
- [ ] Firebase rules deployed
- [ ] Functions deployed
- [ ] Vercel deployed
- [ ] Domain configured
- [ ] SSL active

**After Launch:**
- [ ] Email migration completed
- [ ] Test flows verified
- [ ] Monitoring active
- [ ] Legal pages accessible
- [ ] Analytics tracking

## 🆘 Quick Troubleshooting

**Webhook not working?**
- Check Cashfree dashboard webhook URL
- Verify: `https://your-domain.com/api/payments/webhook`
- Check Firebase Functions logs

**Payment not activating campaign?**
- Check Firebase Functions logs
- Verify webhook signature
- Check Firestore payment records

**Images not uploading?**
- Verify Storage rules deployed
- Check file size < 10MB
- Verify PNG format with transparency

## 📞 Support

- Technical: Check Firebase/Vercel logs
- Business: https://cleffon.com

## 🎯 Success Metrics

Monitor first 24 hours:
- User registrations
- Campaign creations
- Payment success rate
- Error rate < 1%

---

**Production URL:** https://phrames.cleffon.com

**Status:** Ready to Deploy ✅
