# Phrames - Quick Reference Card

## 🚀 Quick Start (3 Steps)

1. **Install & Configure**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Start Server**
   ```bash
   npm run dev
   ```

3. **Create Campaign**
   - Visit http://localhost:3000
   - Sign up → Dashboard → Create Campaign
   - Upload PNG frame → Get shareable link!

## 📋 Campaign Creation Checklist

- [ ] Campaign name (e.g., "Summer Festival 2024")
- [ ] URL slug (e.g., "summer-festival-2024")
- [ ] Description (optional)
- [ ] Visibility (Public or Unlisted)
- [ ] PNG frame with transparency (≥1080x1080px)

## 🔗 Key URLs

| Page | URL | Access |
|------|-----|--------|
| Home | `/` | Public |
| Sign Up | `/signup` | Public |
| Login | `/login` | Public |
| Dashboard | `/dashboard` | Protected |
| Create Campaign | `/dashboard/campaigns/new` | Protected |
| Manage Campaign | `/dashboard/campaigns/[id]` | Protected |
| **Public Campaign** | **`/c/[slug]`** | **Public** ← Share this! |

## 🎨 Frame Requirements

✅ **Must Have:**
- PNG format
- Transparency (alpha channel)
- Minimum 1080x1080 pixels

❌ **Won't Work:**
- JPEG files
- PNG without transparency
- Images smaller than 1080px

## 🔧 Environment Variables (Minimum)

```env
# Generate with: openssl rand -base64 32
SESSION_SECRET=your-secret-here

# Firebase (get from Firebase Console)
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# S3 Storage
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
S3_PUBLIC_BASE_URL=
```

## 📊 Features at a Glance

### Campaign Creator Features:
- ✅ Create unlimited campaigns
- ✅ Upload PNG frames
- ✅ Get instant shareable links
- ✅ View analytics (visits, renders, downloads)
- ✅ Edit campaigns anytime
- ✅ Archive/unarchive

### End User Features:
- ✅ No login required
- ✅ Upload any photo
- ✅ Drag & zoom to adjust
- ✅ Download PNG or JPEG
- ✅ Privacy-first (client-side only)

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Unauthorized" errors | ✅ Fixed - Auth headers added |
| Images not loading | Check S3 configuration |
| "Slug exists" | Try different slug or use suggested one |
| "PNG must have transparency" | Re-export PNG with alpha channel |
| Campaign not creating | Check Firebase & S3 credentials |

## 📱 User Flow

### As Creator:
1. Sign up/Login
2. Create Campaign
3. Upload PNG frame
4. **Copy shareable link**
5. Share with users
6. Monitor analytics

### As End User:
1. Click shareable link
2. Upload photo
3. Adjust position/zoom
4. Download result
5. Share on social media

## 🎯 Campaign Workflow

```
Create Campaign
    ↓
Upload PNG Frame (with transparency)
    ↓
Get Shareable Link: /c/your-slug
    ↓
Share Link (social media, email, QR code)
    ↓
Users Create Images
    ↓
Monitor Analytics (visits, renders, downloads)
```

## 💡 Pro Tips

1. **Frame Design**: Keep center area clear for user photos
2. **Slug Names**: Use memorable, descriptive slugs
3. **Aspect Ratio**: Square (1:1) works best for social media
4. **Testing**: Always test in incognito before sharing
5. **Analytics**: Check stats to see engagement
6. **Updates**: You can update frame anytime without changing link

## 🔐 Security Notes

- Never commit `.env` file
- Keep Firebase private key secure
- Use strong session secrets
- Monitor S3 usage and costs

## 📦 Tech Stack

- **Frontend**: Nuxt 3, Vue 3, Tailwind CSS, Nuxt UI
- **Auth**: Firebase Authentication
- **Database**: Firestore
- **Storage**: S3-compatible (AWS S3, DigitalOcean Spaces, etc.)
- **Image Processing**: Sharp (server), Canvas API (client)

## 🚢 Deploy to Production

```bash
# 1. Update environment variables
# 2. Build
npm run build

# 3. Start
npm run start
```

Or deploy to: Vercel, Netlify, DigitalOcean, AWS

## 📚 Full Documentation

- `READY_TO_USE.md` - Complete overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `CAMPAIGN_CREATION_GUIDE.md` - Campaign creation guide
- `.env.example` - Environment variable template

## ✅ What's Fixed

- ✅ Authentication flow (Firebase tokens)
- ✅ Campaign creation (full workflow)
- ✅ Shareable links (copy button)
- ✅ Image composition (canvas)
- ✅ Missing API endpoints
- ✅ UI components configuration

## 🎉 Ready to Go!

Your Phrames app is fully configured and ready to use. Just:
1. Add your credentials to `.env`
2. Run `npm run dev`
3. Create your first campaign!

---

**Need Help?** Check the full guides:
- Setup issues → `SETUP_GUIDE.md`
- Campaign creation → `CAMPAIGN_CREATION_GUIDE.md`
- Complete overview → `READY_TO_USE.md`
