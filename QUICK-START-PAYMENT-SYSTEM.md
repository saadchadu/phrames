# Quick Start: Paid Campaign System

Get your paid campaign system up and running in 15 minutes.

## Prerequisites
- Firebase project configured
- Vercel account
- Cashfree merchant account

## Step 1: Get Cashfree Credentials (5 min)

1. Sign up at https://www.cashfree.com/
2. Go to **Developers → API Keys → Sandbox**
3. Copy your:
   - Client ID
   - Client Secret

## Step 2: Configure Environment Variables (3 min)

Create `.env.local` in your project root:

```env
# Cashfree
CASHFREE_CLIENT_ID=your_sandbox_client_id
CASHFREE_CLIENT_SECRET=your_sandbox_client_secret
CASHFREE_ENV=SANDBOX

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Admin (get from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Step 3: Deploy Firestore Rules (2 min)

```bash
firebase deploy --only firestore:rules
```

## Step 4: Test Locally (3 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit http://localhost:3000 and:
1. Create a campaign
2. Payment modal should open
3. Select a plan
4. Use test card: **4111 1111 1111 1111**
5. Campaign should activate!

## Step 5: Deploy Cloud Function (2 min)

```bash
# Copy function files
cp functions-setup/index.ts functions/src/index.ts

# Deploy
cd functions
npm install
cd ..
firebase deploy --only functions:scheduledCampaignExpiryCheck
```

## That's It! 🎉

Your paid campaign system is now running locally.

## Next Steps

### To Go Live:

1. **Get Production Credentials**:
   - Complete Cashfree KYC
   - Get production API keys

2. **Update Vercel Environment Variables**:
   ```
   CASHFREE_ENV=PRODUCTION
   CASHFREE_CLIENT_ID=production_client_id
   CASHFREE_CLIENT_SECRET=production_client_secret
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Configure Cashfree Webhook**:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`

4. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Test Cards (Sandbox)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4007 0000 0027 8403
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Pricing Plans

| Plan | Price | Days |
|------|-------|------|
| 1 Week | ₹49 | 7 |
| 1 Month | ₹199 | 30 |
| 3 Months | ₹499 | 90 |
| 6 Months | ₹999 | 180 |
| 1 Year | ₹1599 | 365 |

## Troubleshooting

**Payment modal not opening?**
- Check console for errors
- Verify environment variables are set

**Payment not activating campaign?**
- Check Vercel function logs
- Verify webhook URL in Cashfree dashboard

**Campaigns not expiring?**
- Check Cloud Function is deployed: `firebase functions:list`
- View logs: `firebase functions:log`

## Need Help?

- 📖 Full Guide: `PAYMENT-SYSTEM-DEPLOYMENT.md`
- 🧪 Testing: `PAYMENT-SYSTEM-TESTING.md`
- 📋 Summary: `PAYMENT-SYSTEM-SUMMARY.md`

## Support

- Cashfree: support@cashfree.com
- Firebase: https://firebase.google.com/support

---

**Ready to accept payments!** 💰
