# Firebase Setup Guide

## 🔥 Firebase Authentication Integration

Your app now supports **Firebase Authentication** with:
- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Automatic user sync with PostgreSQL database

---

## 📋 Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "phrames")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

3. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email
   - Click "Save"

### 3. Get Firebase Config (Client)

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Register app with nickname (e.g., "Phrames Web")
5. Copy the `firebaseConfig` object

### 4. Get Firebase Admin SDK (Server)

1. Go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values:
   - `project_id`
   - `client_email`
   - `private_key`

### 5. Configure Environment Variables

Update your `.env` file:

```env
# Firebase Client (from firebaseConfig)
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important:** For `FIREBASE_PRIVATE_KEY`, keep the quotes and `\n` characters as shown.

### 6. Update Database Schema

Run the migration to add Firebase support:

```bash
npx prisma migrate dev --name add-firebase-support
```

Or if in production:

```bash
npx prisma migrate deploy
```

### 7. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Under "Authorized domains", add:
   - `localhost` (for development)
   - Your production domain (e.g., `phrames.com`)

---

## 🧪 Testing

### Test Email/Password Auth

1. Start your dev server: `npm run dev`
2. Go to `/signup`
3. Create account with email/password
4. Check Firebase Console → Authentication → Users

### Test Google Sign-In

1. Go to `/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Check Firebase Console → Authentication → Users

---

## 🔒 Security Rules

### Firebase Authentication Settings

1. **Email Enumeration Protection** (Recommended):
   - Go to Authentication → Settings
   - Enable "Email enumeration protection"

2. **Password Policy**:
   - Minimum 6 characters (default)
   - Consider enabling stronger requirements

3. **Authorized Domains**:
   - Only add domains you control
   - Remove unused domains

---

## 🚀 Deployment

### Vercel Environment Variables

Add these to your Vercel project:

```
NUXT_PUBLIC_FIREBASE_API_KEY=...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NUXT_PUBLIC_FIREBASE_PROJECT_ID=...
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NUXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

**Note:** For `FIREBASE_PRIVATE_KEY` in Vercel:
- Paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters (don't replace with actual newlines)
- Wrap in quotes

---

## 🔧 How It Works

### Authentication Flow

1. **User signs up/logs in** → Firebase handles authentication
2. **Firebase returns token** → Client receives ID token
3. **Token sent to backend** → Server verifies token with Firebase Admin
4. **User synced to database** → Creates/updates user in PostgreSQL
5. **Session created** → Server sets httpOnly cookie
6. **User authenticated** → Can access protected routes

### Database Sync

- Firebase UID is stored in `firebaseUid` field
- Email is synced from Firebase
- `emailVerified` status is synced
- Password field is `null` for OAuth users

---

## 🐛 Troubleshooting

### "Firebase not initialized" Error

**Cause:** Firebase config not set in environment variables

**Solution:**
1. Check `.env` file has all Firebase variables
2. Restart dev server: `npm run dev`
3. Clear browser cache

### "Invalid authentication token" Error

**Cause:** Firebase Admin SDK not configured properly

**Solution:**
1. Verify `FIREBASE_PRIVATE_KEY` format (keep `\n` characters)
2. Check `FIREBASE_CLIENT_EMAIL` matches service account
3. Ensure `FIREBASE_PROJECT_ID` is correct

### Google Sign-In Popup Blocked

**Cause:** Browser blocking popups

**Solution:**
1. Allow popups for your domain
2. Or use redirect method (modify `useAuth.ts`)

### "Email already in use" Error

**Cause:** User already exists in Firebase

**Solution:**
1. Use login instead of signup
2. Or reset password in Firebase Console

---

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Email/Password enabled
- [ ] Google Sign-In enabled
- [ ] Firebase config added to `.env`
- [ ] Firebase Admin SDK configured
- [ ] Database migrated
- [ ] Authorized domains configured
- [ ] Tested email/password signup
- [ ] Tested Google sign-in
- [ ] Environment variables added to Vercel

---

**Your Firebase Authentication is ready!** 🎉

Users can now sign up with email/password or Google, and all authentication is handled securely by Firebase.