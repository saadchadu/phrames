# Production Troubleshooting Guide

## 🚨 Current Issue: FUNCTION_INVOCATION_FAILED

The Vercel deployment is crashing with a 500 Internal Server Error. This is typically caused by missing environment variables or configuration issues.

## 🔍 Immediate Diagnosis Steps

### 1. Check Health Endpoint
Visit: `https://your-domain.vercel.app/api/health`

This will show:
- Environment status
- Database connectivity
- Configuration completeness

### 2. Check Vercel Function Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Functions" tab
4. Click on the failing function
5. Check the logs for specific error messages

### 3. Verify Environment Variables
In Vercel Dashboard → Settings → Environment Variables, ensure these are set:

#### Required Variables
```bash
DATABASE_URL=postgres://user:password@host:5432/database
SESSION_SECRET=your-long-random-session-secret-key-here
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=phrames-assets
S3_PUBLIC_BASE_URL=https://your-cdn-domain.com/
S3_REGION=us-east-1
NUXT_PUBLIC_SITE_URL=https://phrames.cleffon.com
```

## 🛠️ Common Fixes

### Fix 1: Missing Environment Variables
**Symptoms**: Function crashes immediately on startup
**Solution**: Add all required environment variables in Vercel Dashboard

### Fix 2: Database Connection Issues
**Symptoms**: App loads but auth fails
**Solution**: 
- Verify DATABASE_URL format: `postgres://user:password@host:5432/database`
- Ensure database server allows connections from Vercel IPs
- Run database migrations: `npx prisma migrate deploy`

### Fix 3: Invalid S3 Configuration
**Symptoms**: Campaign creation fails
**Solution**:
- Verify S3 credentials and bucket permissions
- Ensure S3_PUBLIC_BASE_URL is accessible
- Check CORS settings on S3 bucket

### Fix 4: Session Secret Missing
**Symptoms**: Auth works but sessions don't persist
**Solution**: Set SESSION_SECRET to a long random string (32+ characters)

## 🔧 Step-by-Step Recovery

### Step 1: Set Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each required variable for "Production" environment
3. Redeploy the application

### Step 2: Database Setup
```bash
# If using Vercel Postgres
npx prisma migrate deploy

# If using external database
# Ensure connection string is correct and database is accessible
```

### Step 3: Test Deployment
1. Visit `/api/health` to check system status
2. Try signup/login functionality
3. Test campaign creation (if S3 is configured)

## 📋 Environment Variable Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Random string for session encryption
- [ ] `S3_ENDPOINT` - S3 service endpoint
- [ ] `S3_ACCESS_KEY_ID` - S3 access key
- [ ] `S3_SECRET_ACCESS_KEY` - S3 secret key
- [ ] `S3_BUCKET` - S3 bucket name
- [ ] `S3_PUBLIC_BASE_URL` - Public URL for S3 assets
- [ ] `S3_REGION` - S3 region (e.g., us-east-1)
- [ ] `NUXT_PUBLIC_SITE_URL` - Your domain URL

## 🚀 Quick Deploy Commands

```bash
# Redeploy after fixing environment variables
vercel --prod

# Or trigger redeploy from Vercel Dashboard
# Go to Deployments → Click "Redeploy" on latest deployment
```

## 📞 Emergency Fallback

If the issue persists:

1. **Rollback**: In Vercel Dashboard, promote a previous working deployment
2. **Minimal Config**: Start with just `DATABASE_URL` and `SESSION_SECRET`
3. **Gradual Addition**: Add other environment variables one by one
4. **Local Testing**: Test the exact same environment variables locally first

## 🔍 Debug Information

When reporting issues, include:
- Vercel function logs
- Response from `/api/health` endpoint
- List of configured environment variables (names only, not values)
- Error ID from Vercel error page

## 📚 Useful Links

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment)
- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)