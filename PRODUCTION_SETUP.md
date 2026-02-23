# Phrames Production Setup Guide

## 🚀 Quick Start

Your application is now optimized for production with:
- ✅ Security headers and CSP
- ✅ Image optimization (WebP/AVIF)
- ✅ Performance optimizations
- ✅ Caching strategies
- ✅ Error boundaries
- ✅ Rate limiting headers

## 📋 Vercel Dashboard Configuration

### 1. Security Settings

#### Enable Deployment Protection
1. Go to **Project Settings** → **Deployment Protection**
2. Enable **Vercel Authentication** for Preview Deployments
3. Enable **Password Protection** for Production (optional)

#### Configure Vercel WAF (Firewall)
1. Go to **Project Settings** → **Firewall**
2. Enable **Managed Rulesets**:
   - ✅ OWASP Core Rule Set
   - ✅ Known Bots Protection
   - ✅ Rate Limiting
3. Add **IP Blocking** rules if needed
4. Configure **Custom Rules** for your use case

#### Enable Log Drains
1. Go to **Project Settings** → **Log Drains**
2. Choose your logging provider (Datadog, Logtail, etc.)
3. Configure the integration

### 2. Performance Settings

#### Enable Speed Insights
1. Go to **Project Settings** → **Speed Insights**
2. Click **Enable Speed Insights**
3. Monitor Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

#### Configure Function Settings
1. Go to **Project Settings** → **Functions**
2. Verify regions match your Firebase/database location
3. Check memory allocation (default: 1024 MB)
4. Review max duration settings

### 3. Cost Optimization

#### Enable Spend Management
1. Go to **Account Settings** → **Billing**
2. Set up **Usage Alerts**:
   - Bandwidth threshold
   - Function execution threshold
   - Build minutes threshold
3. Configure **Spending Limits** (optional)

#### Enable Fluid Compute (if available)
1. Go to **Project Settings** → **Functions**
2. Enable **Fluid Compute** for better cold start performance

### 4. Monitoring & Observability

#### Enable Observability Plus (Pro/Enterprise)
1. Go to **Project Settings** → **Observability**
2. Enable **Observability Plus**
3. Configure:
   - Error tracking
   - Performance monitoring
   - Traffic analysis

### 5. Team & Access Management

#### Configure Access Roles
1. Go to **Team Settings** → **Members**
2. Review and assign appropriate roles:
   - **Owner**: Full access
   - **Member**: Deploy and manage projects
   - **Viewer**: Read-only access

#### Enable SAML SSO (Enterprise)
1. Go to **Team Settings** → **Security**
2. Configure **SAML SSO**
3. Set up **SCIM** for user provisioning

## 🔒 Security Checklist

### Completed ✅
- [x] Content Security Policy (CSP) configured
- [x] Security headers implemented
- [x] HTTPS enforced (HSTS)
- [x] XSS protection enabled
- [x] Clickjacking protection (X-Frame-Options)
- [x] MIME type sniffing prevention
- [x] Referrer policy configured
- [x] Permissions policy set

### To Configure in Vercel Dashboard
- [ ] Deployment Protection enabled
- [ ] Vercel WAF configured
- [ ] Log Drains enabled
- [ ] Preview Deployment Suffix set
- [ ] Access roles reviewed
- [ ] SAML SSO enabled (Enterprise)
- [ ] Audit Logs enabled (Enterprise)

## ⚡ Performance Checklist

### Completed ✅
- [x] Image optimization (Next.js Image)
- [x] WebP/AVIF format support
- [x] Lazy loading for images
- [x] Font optimization (preconnect)
- [x] Script optimization (defer)
- [x] Compression enabled
- [x] Console logs removed in production
- [x] Caching headers configured
- [x] Bundle size optimized

### To Configure in Vercel Dashboard
- [ ] Speed Insights enabled
- [ ] Function regions optimized
- [ ] Observability Plus enabled (Pro/Enterprise)
- [ ] Function failover configured (Enterprise)

## 💰 Cost Optimization Checklist

### Completed ✅
- [x] Image optimization configured
- [x] Function durations set appropriately
- [x] ISR revalidation configured
- [x] Caching strategies implemented

### To Configure in Vercel Dashboard
- [ ] Spend Management alerts set
- [ ] Usage monitoring configured
- [ ] Fluid Compute enabled
- [ ] Resource limits reviewed

## 🔧 Environment Variables

### Required Production Variables
```bash
# Firebase (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cashfree (Production)
NEXT_PUBLIC_CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
NEXT_PUBLIC_CASHFREE_ENV=PROD

# Application
NEXT_PUBLIC_APP_URL=https://phrames.cleffon.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### Setting Environment Variables in Vercel
1. Go to **Project Settings** → **Environment Variables**
2. Add each variable with appropriate scope:
   - **Production**: Production deployments only
   - **Preview**: Preview deployments only
   - **Development**: Local development only

## 📊 Monitoring & Alerts

### Google Search Console
1. Monitor Core Web Vitals
2. Check for indexing issues
3. Review mobile usability
4. Monitor search performance

### Vercel Analytics
1. Monitor deployment frequency
2. Track build times
3. Review function execution times
4. Monitor bandwidth usage

### Firebase Console
1. Monitor Firestore usage
2. Check Storage usage
3. Review Authentication metrics
4. Monitor Function invocations

## 🚨 Incident Response

### Rollback Procedure
1. Go to **Vercel Dashboard** → **Deployments**
2. Find the last stable deployment
3. Click **"..."** → **"Promote to Production"**
4. Verify rollback successful
5. Investigate issue in staging
6. Fix and redeploy

### Emergency Contacts
- **Vercel Support**: support@vercel.com
- **Firebase Support**: firebase-support@google.com
- **Cashfree Support**: support@cashfree.com

## 📈 Performance Targets

### Core Web Vitals Goals
- **LCP**: < 2.5 seconds (Good)
- **FID**: < 100 milliseconds (Good)
- **CLS**: < 0.1 (Good)

### Additional Metrics
- **TTFB**: < 600ms
- **Page Load**: < 3s
- **Bundle Size**: < 500KB (initial)

## 🔄 Regular Maintenance

### Daily
- Monitor error logs
- Check deployment status
- Review performance metrics

### Weekly
- Review security logs
- Check usage and costs
- Update dependencies (if needed)

### Monthly
- Security audit
- Performance optimization review
- Cost optimization review
- Documentation update

## 📚 Additional Resources

- [Vercel Production Checklist](https://vercel.com/docs/production-checklist)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Firebase Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [Web Vitals](https://web.dev/vitals/)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## ✅ Deployment Complete

Your application is now production-ready with:
1. ✅ Security hardening
2. ✅ Performance optimization
3. ✅ Monitoring setup
4. ✅ Cost optimization
5. ✅ Error handling

### Next Steps:
1. Configure remaining items in Vercel Dashboard
2. Set up monitoring alerts
3. Test rollback procedure
4. Document incident response plan
5. Schedule regular maintenance

---

**Last Updated**: February 23, 2026  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
