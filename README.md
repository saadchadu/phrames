# Phrames - Photo Frame Campaign Platform

A complete, production-ready web application for creating and sharing custom photo frame campaigns. Built with Next.js 16, React 19, Firebase, and TailwindCSS.

> **Latest Update (Feb 2026)**: All dependencies updated to latest stable versions. See [UPGRADE-GUIDE.md](UPGRADE-GUIDE.md) for details.

## 🚀 Features

- **Authentication**: Firebase Auth with email/password and Google sign-in
- **Campaign Management**: Create, edit, delete, and share frame campaigns
- **Payment Integration**: Cashfree payment gateway for paid campaigns
- **Admin Dashboard**: Comprehensive admin interface for platform management
- **Image Processing**: Client-side image composition with HTML5 Canvas
- **Real-time Database**: Firestore for campaign data and user management
- **File Storage**: Firebase Storage for frame images
- **Responsive Design**: Mobile-first design with TailwindCSS
- **SEO Optimized**: Next.js App Router with proper metadata
- **Production Ready**: Optimized build with proper error handling

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Styling**: TailwindCSS 3.4
- **UI Components**: Radix UI, Headless UI 2.0
- **Icons**: Heroicons, Lucide React
- **Language**: TypeScript 5.2
- **Deployment**: Vercel/Firebase Hosting compatible

## 📁 Project Structure

```
phrames/
├── app/
│   ├── admin/             # Admin dashboard pages
│   ├── api/admin/         # Admin API routes
│   ├── campaign/[slug]/   # Public campaign pages
│   ├── create/            # Campaign creation
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── admin/             # Admin UI components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── AuthGuard.tsx      # Route protection
│   ├── CampaignCard.tsx   # Campaign display component
│   ├── Navbar.tsx         # Navigation component
│   └── ui/                # UI components
├── lib/
│   ├── admin-auth.ts      # Admin authentication
│   ├── admin-logging.ts   # Admin logging service
│   ├── admin-settings.ts  # Settings management
│   ├── auth.ts            # Authentication utilities
│   ├── firebase.ts        # Firebase configuration
│   ├── firestore.ts       # Database operations
│   └── storage.ts         # File upload utilities
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🔧 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Firebase Storage
5. Get your Firebase configuration

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Vercel and Firebase Hosting.

## 👨‍💼 Admin Dashboard

The platform includes a comprehensive admin dashboard for platform management.

### Admin Features

- **Overview Dashboard**: Real-time statistics, revenue metrics, and growth charts
- **Campaign Management**: Search, filter, extend, activate/deactivate campaigns
- **User Management**: Manage users, grant admin access, block/unblock users
- **Payment Analytics**: Track revenue, view transactions, analyze payment trends
- **System Logs**: Audit trail of all admin actions and system events
- **Settings Control**: Configure feature toggles, plan pricing, and platform settings

### Admin Setup

1. **Set Admin UID**: Add your Firebase Auth UID to environment variables
   ```bash
   ADMIN_UID=your-firebase-auth-uid
   ```

2. **Grant Admin Access**: Run the setup script
   ```bash
   npx tsx scripts/grant-admin-by-email.ts your@email.com
   ```

3. **Initialize Settings**: Create default system settings
   ```bash
   npx tsx scripts/initialize-admin-settings.ts
   ```

4. **Deploy Security Rules**: Deploy Firestore rules
   ```bash
   firebase deploy --only firestore:rules
   ```

### Admin Documentation

- **[Admin Dashboard Guide](./docs/ADMIN-DASHBOARD-GUIDE.md)** - Complete admin documentation
- **[Quick Reference](./docs/ADMIN-QUICK-REFERENCE.md)** - Common tasks and shortcuts
- **[Troubleshooting](./docs/ADMIN-TROUBLESHOOTING.md)** - Solutions to common issues

### Admin Routes

- `/admin` - Overview dashboard
- `/admin/campaigns` - Campaign management
- `/admin/users` - User management
- `/admin/payments` - Payment analytics
- `/admin/logs` - System logs
- `/admin/settings` - Platform settings

## 📱 How It Works

### For Campaign Creators

1. **Sign Up/Login**: Create account or sign in with Google
2. **Create Campaign**: Upload PNG frame, set name and visibility
3. **Share**: Get shareable link for your campaign
4. **Manage**: View, edit, or delete campaigns from dashboard

### For Visitors

1. **Visit Campaign**: Use shared link to access campaign
2. **Upload Photo**: Choose any image to add the frame
3. **Download/Share**: Save or share the framed photo

## 🔒 Security

- ✅ Firebase Authentication for secure user management
- ✅ Firestore security rules for data protection
- ✅ Storage security rules with file validation
- ✅ HTTP security headers (HSTS, XSS, CSP, etc.)
- ✅ Input validation and sanitization
- ✅ Protected routes with authentication guards
- ✅ Client-side rate limiting
- ✅ XSS and injection prevention
- ✅ Secure file upload (10MB limit, image validation)

**📖 See [SECURITY-SETUP.md](./SECURITY-SETUP.md) for quick setup**
**📚 See [SECURITY.md](./SECURITY.md) for full documentation**

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update colors in component files
- Add custom CSS in `app/globals.css`

### Features
- Add new campaign fields in `lib/firestore.ts`
- Extend authentication in `lib/auth.ts`
- Add new pages in `app/` directory

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Config**: Ensure all environment variables are set correctly
2. **Build Errors**: Run `npm run build` to check for issues
3. **Auth Issues**: Verify Firebase Auth is enabled in console
4. **Storage Issues**: Check Firebase Storage rules and bucket configuration

### Debug Mode

Enable debug logging:

```env
NEXT_PUBLIC_DEBUG=true
```

## 📊 Performance

- Static generation for landing page
- Dynamic rendering for user-specific content
- Client-side image processing for fast frame application
- Firebase CDN for global asset delivery
- Optimized build with Next.js

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js and Firebase