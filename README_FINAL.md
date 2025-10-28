# 🎉 Phrames - Your Complete Twibbonize Clone

> A free, open-source photo frame campaign platform built with Nuxt 3. No ads, no watermarks, no paywalls.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Nuxt](https://img.shields.io/badge/nuxt-3.x-00DC82)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 What is Phrames?

Phrames is a complete clone of Twibbonize that allows creators to:
- Create photo frame campaigns
- Share links with anyone
- Let visitors upload photos and compose them with frames
- Download beautiful framed photos instantly

**100% Free Forever** - No ads, no watermarks, no premium features.

---

## ✨ Features

### For Creators
- 🔐 **Secure Authentication** - Email/password with bcrypt
- 📸 **Campaign Management** - Create, edit, archive campaigns
- 🖼️ **Frame Upload** - PNG frames with transparency validation
- 🔗 **Shareable Links** - Unique URLs for each campaign
- 📊 **Analytics** - Track visits, renders, and downloads
- 🎨 **Dashboard** - Manage all your campaigns in one place

### For Visitors
- 📤 **Easy Upload** - Drag & drop or click to upload
- 🎯 **Perfect Positioning** - Zoom, pan, and drag to adjust
- 👁️ **Live Preview** - See your photo under the frame in real-time
- 💾 **Download Options** - PNG or JPEG, no watermarks
- 📱 **Mobile Friendly** - Works great on all devices
- 🔒 **Privacy First** - Your photos are never stored on our servers

---

## 🛠️ Tech Stack

- **Framework**: Nuxt 3 (Vue.js with SSR)
- **Language**: TypeScript
- **UI**: Nuxt UI + Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: S3-compatible (AWS S3, Cloudflare R2, etc.)
- **Auth**: Email/password with bcrypt + httpOnly cookies
- **Validation**: Zod
- **Deployment**: Vercel (or any Node.js host)

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- S3-compatible storage

### Installation

1. **Clone and install**
```bash
git clone <your-repo>
cd phrames
npm install
```

2. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Set up database**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Run development server**
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Framework: **Nuxt 3**
- Build Command: `npx nuxi build`
- Output Directory: **(leave blank)**

3. **Add Environment Variables**
```
DATABASE_URL=postgresql://...
SESSION_SECRET=<random-string>
S3_ENDPOINT=https://...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=phrames
S3_PUBLIC_BASE_URL=https://...
S3_REGION=us-east-1
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
```

4. **Deploy!**
```bash
vercel --prod
```

---

## 📖 Documentation

- **[NUXT_APP_COMPLETE.md](./NUXT_APP_COMPLETE.md)** - Complete feature list and guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **[TWIBBONIZE_CLONE_STATUS.md](./TWIBBONIZE_CLONE_STATUS.md)** - Implementation status
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment checklist

---

## 🎯 How It Works

### 1. Creator Flow
```
Sign Up → Create Campaign → Upload Frame → Get Share Link → View Stats
```

### 2. Visitor Flow
```
Open Link → Upload Photo → Adjust Position → Download → Done!
```

### 3. Technical Flow
```
Client Upload → Canvas Composition → Client Download
(No server-side photo storage)
```

---

## 🔒 Security

- ✅ Bcrypt password hashing (12 rounds)
- ✅ HttpOnly session cookies
- ✅ Secure cookies in production
- ✅ SameSite CSRF protection
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (Vue.js)

---

## 📊 Privacy

**We respect your privacy:**
- ✅ Visitor photos processed client-side only
- ✅ No photo storage on servers
- ✅ No tracking or analytics cookies
- ✅ Minimal data collection
- ✅ Anonymous usage metrics only

---

## 🎨 Customization

### Branding
- Update logo in `components/AppHeader.vue`
- Change colors in `tailwind.config.ts`
- Edit landing page in `pages/index.vue`
- Customize footer in `app.vue`

### Features
Add optional features:
- Email verification
- Password reset
- Social login
- Campaign templates
- Advanced analytics
- Admin panel

---

## 📁 Project Structure

```
phrames/
├── server/          # Backend API
│   ├── api/         # API endpoints
│   └── utils/       # Server utilities
├── pages/           # Frontend pages
├── components/      # Vue components
├── composables/     # Reusable logic
├── middleware/      # Route middleware
├── prisma/          # Database schema
└── public/          # Static assets
```

---

## 🧪 Testing

### Development Mode
The app works without a database in development:
```bash
npm run dev
# Uses mock authentication
```

### With Database
```bash
# Set DATABASE_URL in .env
npm run dev
# Uses real authentication
```

### Production
```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

### Database Issues
```bash
npx prisma studio  # View database
npx prisma migrate reset  # Reset database
```

### Build Issues
```bash
rm -rf .nuxt .output node_modules
npm install
npm run dev
```

### Session Issues
- Check `SESSION_SECRET` is set
- Clear browser cookies
- Verify database connection

---

## 📈 Roadmap

- [ ] Email verification
- [ ] Password reset
- [ ] Social login (Google, Facebook)
- [ ] Campaign templates
- [ ] Advanced analytics
- [ ] Admin panel
- [ ] Rate limiting
- [ ] Content moderation
- [ ] Multi-language support
- [ ] Dark mode

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for any purpose.

---

## 🙏 Acknowledgments

- Inspired by [Twibbonize](https://www.twibbonize.com/)
- Built with [Nuxt 3](https://nuxt.com/)
- UI components from [Nuxt UI](https://ui.nuxt.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 💬 Support

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/phrames/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/phrames/discussions)

---

## ⭐ Show Your Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with others

---

## 🎊 Status

**✅ Production Ready**

This project is complete and ready for production use. All core features are implemented, tested, and working.

- ✅ Authentication system
- ✅ Campaign management
- ✅ Image composition
- ✅ Analytics
- ✅ Responsive design
- ✅ Security best practices
- ✅ Privacy-first approach
- ✅ Free forever

**Start creating beautiful photo frame campaigns today!** 🚀📸

---

Made with ❤️ using Nuxt 3