# Pre-Deployment Checklist for Vercel

Complete this checklist before deploying to Vercel to ensure a smooth deployment.

## 🔍 Pre-Deployment Verification

### 1. Local Build Test

- [ ] Run local build successfully
  ```bash
  npm run build
  ```
  - Should complete without errors
  - Check for any TypeScript errors
  - Verify no missing dependencies

- [ ] Test local production build
  ```bash
  npm run build
  npm start
  ```
  - Application should run on http://localhost:3000
  - Test key pages: home, login, signup, create, dashboard

### 2. Environment Variables Ready

- [ ] All Firebase credentials collected
  - API Key
  - Auth Domain
  - Project ID
  - Storage Bucket
  - Messaging Sender ID
  - App ID
  - Admin credentials (Project ID, Client Email, Private Key)

- [ ] Cashfree credentials ready
  - Sandbox Client ID
  - Sandbox Client Secret
  - (Production credentials if going live)

- [ ] Session secret generated
  ```bash
  openssl rand -base64 32
  ```

- [ ] Production URLs determined
  - Site URL (e.g., https://phrames.cleffon.com)
  - App URL (same as site URL for production)

### 3. Firebase Configuration

- [ ] Firestore security rules deployed
  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] Storage security rules deployed
  ```bash
  firebase deploy --only storage:rules
  ```

- [ ] Firebase Authentication enabled
  - Email/Password provider enabled
  - Authorized domains include your production domain

- [ ] Firebase Storage bucket created and configured

- [ ] Test Firebase connection locally
  - Sign up works
  - Login works
  - Campaign creation works

### 4. Cashfree Configuration

- [ ] Cashfree account created and verified

- [ ] Sandbox API credentials obtained
  - Login to Cashfree Dashboard
  - Navigate to Developers → API Keys → Sandbox
  - Copy Client ID and Client Secret

- [ ] Webhook URL ready
  - Format: `https://your-domain.com/api/payments/webhook`
  - Will configure after deployment

### 5. Code Quality Checks

- [ ] No console.errors in production code

- [ ] All TypeScript errors resolved
  ```bash
  npm run type-check
  ```

- [ ] ESLint passes (if configured)
  ```bash
  npm run lint
  ```

- [ ] No sensitive data in code
  - No hardcoded API keys
  - No passwords or secrets
  - Check with: `git grep -i "password\|secret\|key" --exclude-dir=node_modules`

### 6. Git Repository

- [ ] All changes committed
  ```bash
  git status
  ```

- [ ] `.env.local` is in `.gitignore`
  ```bash
  cat .gitignore | grep .env.local
  ```

- [ ] No sensitive files committed
  ```bash
  git log --all --full-history -- "*.env*"
  ```

- [ ] Push to remote repository
  ```bash
  git push origin main
  ```

### 7. Dependencies

- [ ] All dependencies installed
  ```bash
  npm install
  ```

- [ ] No critical vulnerabilities
  ```bash
  npm audit
  ```

- [ ] package-lock.json is committed
  ```bash
  git ls-files | grep package-lock.json
  ```

### 8. API Routes Testing

- [ ] Payment initiation endpoint works locally
  - Test with authenticated request
  - Verify error handling

- [ ] Webhook endpoint exists
  - Located at `app/api/payments/webhook/route.ts`
  - Signature verification implemented

- [ ] Analytics endpoint works (if applicable)

### 9. Component Testing

- [ ] Payment Modal displays correctly
  - All 5 pricing plans visible
  - Prices correct (₹49, ₹199, ₹499, ₹999, ₹1599)
  - Selection works
  - Mobile responsive

- [ ] Dashboard shows campaign status
  - Active/Inactive badges
  - Expiry countdown
  - Reactivate button for inactive campaigns

- [ ] Public campaign page respects visibility
  - Active campaigns accessible
  - Inactive campaigns show error

### 10. Documentation

- [ ] README.md updated with deployment info

- [ ] Environment variables documented
  - See VERCEL-ENV-CHECKLIST.md

- [ ] Deployment guide reviewed
  - See VERCEL-DEPLOYMENT-GUIDE.md

## 🚀 Deployment Steps

Once all checks pass, proceed with deployment:

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy to Production

```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (for first deployment)
- Project name? **phrames** (or your preferred name)
- Directory? **./`**
- Override settings? **No**

### Step 4: Add Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from VERCEL-ENV-CHECKLIST.md
3. Select all environments (Production, Preview, Development)

### Step 5: Redeploy

After adding environment variables:

```bash
vercel --prod
```

### Step 6: Configure Cashfree Webhook

1. Go to Cashfree Dashboard → Developers → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - PAYMENT_SUCCESS_WEBHOOK
   - PAYMENT_FAILED_WEBHOOK
4. Save configuration

### Step 7: Verify Deployment

Run verification script:

```bash
./scripts/verify-deployment.sh https://your-domain.com
```

### Step 8: Manual Testing

1. **Test Authentication**:
   - Sign up with new account
   - Login with existing account
   - Logout

2. **Test Campaign Creation**:
   - Create a new campaign
   - Upload images
   - Set campaign details
   - Click "Publish"

3. **Test Payment Flow**:
   - Payment modal should open
   - Select a plan
   - Click "Continue to Checkout"
   - Complete payment with test card:
     - Card: 4111 1111 1111 1111
     - CVV: 123
     - Expiry: Any future date

4. **Verify Campaign Activation**:
   - Should redirect to dashboard
   - Campaign should show "Active" badge
   - Expiry date should be displayed
   - Public URL should be accessible

5. **Test Dashboard**:
   - View all campaigns
   - Check status badges
   - Test edit functionality
   - Test share functionality

## 🔧 Post-Deployment Tasks

After successful deployment:

- [ ] Monitor Vercel logs for errors
  ```bash
  vercel logs --follow
  ```

- [ ] Check Firestore for payment records
  - Open Firebase Console
  - Navigate to Firestore
  - Check `payments` collection

- [ ] Verify Cashfree transactions
  - Login to Cashfree Dashboard
  - Check Transactions section

- [ ] Test from different devices
  - Desktop browser
  - Mobile browser
  - Different networks

- [ ] Set up monitoring alerts
  - Vercel deployment notifications
  - Error rate alerts
  - Payment failure alerts

- [ ] Update DNS (if needed)
  - Point domain to Vercel
  - Verify SSL certificate

- [ ] Announce to users
  - Update documentation
  - Send announcement email
  - Update social media

## ⚠️ Common Issues and Solutions

### Build Fails

**Issue**: "Module not found"
- Run `npm install` locally
- Commit `package-lock.json`
- Redeploy

**Issue**: "TypeScript errors"
- Run `npm run type-check` locally
- Fix all errors
- Commit and redeploy

### Environment Variables Not Working

**Issue**: Variables undefined in production
- Verify variables added for "Production" environment
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Payment System Not Working

**Issue**: "Payment system is not configured"
- Check Cashfree variables are set in Vercel
- Verify variable names: `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_ENV`
- Redeploy

**Issue**: Webhook not receiving events
- Verify webhook URL in Cashfree dashboard
- Check Vercel function logs
- Ensure webhook endpoint is accessible

### Firebase Connection Issues

**Issue**: "Firebase: Error (auth/invalid-api-key)"
- Check `NEXT_PUBLIC_FIREBASE_API_KEY` is set
- Verify API key is correct
- Check Firebase project settings

**Issue**: "Firebase Admin initialization failed"
- Verify `FIREBASE_PRIVATE_KEY` format includes quotes and newlines
- Check `FIREBASE_CLIENT_EMAIL` is correct
- Ensure service account has proper permissions

## 📊 Success Criteria

Deployment is successful when:

- ✅ Application builds without errors
- ✅ All pages load correctly
- ✅ User authentication works
- ✅ Campaign creation works
- ✅ Payment modal opens and displays plans
- ✅ Payment flow completes successfully
- ✅ Campaigns activate after payment
- ✅ Dashboard shows correct status
- ✅ Public campaigns are accessible
- ✅ Webhook processes payments
- ✅ No errors in Vercel logs

## 🎉 Deployment Complete!

Once all checks pass and testing is successful:

1. Document the deployment date and version
2. Create a backup of current configuration
3. Monitor for 24-48 hours
4. Gather user feedback
5. Plan for next iteration

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Firebase Docs**: https://firebase.google.com/docs
- **Cashfree Docs**: https://docs.cashfree.com/
- **Project Issues**: Check TROUBLESHOOTING.md

---

**Ready to Deploy?** ✅

If all items are checked, proceed with the deployment steps above!
