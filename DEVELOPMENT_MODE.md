# 🛠️ Development Mode Guide

## Working Without a Database

Your app now supports **development mode** which allows you to test Firebase Authentication without setting up a PostgreSQL database!

---

## ✅ What Works in Development Mode

### Authentication ✅
- ✅ Firebase Email/Password signup
- ✅ Firebase Email/Password login
- ✅ Google Sign-In
- ✅ Session management (mock sessions)
- ✅ User authentication state
- ✅ Protected routes

### What Doesn't Work ❌
- ❌ Campaign creation (requires database)
- ❌ Campaign management (requires database)
- ❌ User data persistence (no database)
- ❌ Analytics/stats (requires database)

---

## 🚀 Quick Start (No Database)

### 1. Set Up Firebase Only

Add Firebase config to `.env`:

```env
# Firebase Client
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Note:** You don't need `DATABASE_URL`, `S3_*`, or `SESSION_SECRET` for basic testing!

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Test Authentication

1. Go to `http://localhost:3000/signup`
2. Sign up with email/password OR click "Continue with Google"
3. You'll be logged in and redirected to dashboard
4. Dashboard will show "No campaigns" (expected without database)

---

## 🔄 How Development Mode Works

### Mock Sessions
When database is not available:
- Creates mock session IDs: `firebase-dev-session-{uid}`
- Stores in httpOnly cookie
- User stays logged in across page refreshes
- Works with protected routes

### User Data
- User ID = Firebase UID
- Email from Firebase
- No database persistence
- Lost on server restart (but Firebase auth persists)

### API Responses
- `/api/auth/login` - Returns Firebase user
- `/api/auth/signup` - Returns Firebase user
- `/api/auth/me` - Returns Firebase user from session
- `/api/campaigns` - Returns empty array

---

## 🎯 Testing Scenarios

### Test Email/Password Auth
```
1. Go to /signup
2. Enter email: test@example.com
3. Enter password: password123
4. Click "Create account"
5. ✅ Should redirect to /dashboard
6. ✅ Should show user email in header
7. ✅ Should persist on page refresh
```

### Test Google Sign-In
```
1. Go to /login
2. Click "Continue with Google"
3. Select Google account
4. ✅ Should redirect to /dashboard
5. ✅ Should show user email in header
6. ✅ Should persist on page refresh
```

### Test Protected Routes
```
1. Without logging in, go to /dashboard
2. ✅ Should redirect to /login
3. Log in with any method
4. ✅ Should redirect back to /dashboard
```

### Test Logout
```
1. Log in
2. Click logout in header
3. ✅ Should redirect to home
4. Try to access /dashboard
5. ✅ Should redirect to /login
```

---

## 🗄️ Adding Database (Full Features)

When you're ready to test campaigns and full features:

### 1. Set Up PostgreSQL

**Option A: Local PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb phrames

# Add to .env
DATABASE_URL="postgresql://localhost:5432/phrames"
```

**Option B: Docker**
```bash
docker run --name phrames-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
# Add to .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
```

**Option C: Cloud Database**
- [Supabase](https://supabase.com) - Free tier
- [Railway](https://railway.app) - Free tier
- [Neon](https://neon.tech) - Serverless Postgres

### 2. Run Migrations

```bash
npx prisma migrate dev
```

### 3. Restart Server

```bash
npm run dev
```

Now all features work! 🎉

---

## 🐛 Troubleshooting

### "Firebase not initialized"
**Cause:** Missing Firebase config in `.env`

**Solution:**
1. Check `.env` has all `NUXT_PUBLIC_FIREBASE_*` variables
2. Restart dev server: `npm run dev`

### "Invalid authentication token"
**Cause:** Firebase Admin SDK not configured

**Solution:**
1. Check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
2. Ensure `FIREBASE_PRIVATE_KEY` has `\n` characters (don't replace with actual newlines)

### Google Sign-In popup blocked
**Cause:** Browser blocking popups

**Solution:**
1. Allow popups for `localhost:3000`
2. Try again

### "Service temporarily unavailable" in production
**Cause:** Database not configured in production

**Solution:**
- Development mode only works with `NODE_ENV=development`
- Production requires database
- Add `DATABASE_URL` to production environment

---

## 📊 Development vs Production

| Feature | Development (No DB) | Production (With DB) |
|---------|-------------------|---------------------|
| Firebase Auth | ✅ Works | ✅ Works |
| Google Sign-In | ✅ Works | ✅ Works |
| Mock Sessions | ✅ Enabled | ❌ Disabled |
| User Persistence | ❌ No | ✅ Yes |
| Campaigns | ❌ No | ✅ Yes |
| Analytics | ❌ No | ✅ Yes |
| S3 Upload | ❌ No | ✅ Yes |

---

## 🎓 Learning Path

### Phase 1: Test Auth (No Database)
1. Set up Firebase
2. Test email/password auth
3. Test Google Sign-In
4. Test protected routes
5. Test logout

### Phase 2: Add Database
1. Set up PostgreSQL
2. Run migrations
3. Test user persistence
4. Test campaign creation

### Phase 3: Add Storage
1. Set up S3/R2
2. Test frame upload
3. Test image composition

### Phase 4: Deploy
1. Set up production database
2. Configure all environment variables
3. Deploy to Vercel
4. Test in production

---

## 💡 Tips

- **Start Simple:** Test auth first without database
- **Use Firebase Console:** Monitor users in Firebase
- **Check Browser Console:** See auth state changes
- **Use DevTools:** Inspect cookies and network requests
- **Test Incognito:** Verify logout works properly

---

## ✅ Quick Checklist

**For Auth Testing (No Database):**
- [ ] Firebase project created
- [ ] Email/Password enabled in Firebase
- [ ] Google Sign-In enabled in Firebase
- [ ] Firebase config in `.env`
- [ ] Dev server running
- [ ] Can sign up with email/password
- [ ] Can sign in with Google
- [ ] Protected routes work
- [ ] Logout works

**For Full Features (With Database):**
- [ ] PostgreSQL installed/configured
- [ ] `DATABASE_URL` in `.env`
- [ ] Migrations run
- [ ] Can create campaigns
- [ ] Can upload frames
- [ ] Can view public pages

---

**Development mode makes it easy to test Firebase Authentication without any database setup!** 🚀

Start with auth testing, then add database when you're ready for full features.