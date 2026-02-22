# Quick Start - Dependency Update

## TL;DR

All dependencies updated to latest versions (Feb 2026). Follow these steps:

```bash
# 1. Configure Firebase (if not already done)
# Edit .env.local with your Firebase credentials
# See SETUP-REQUIRED.md for details

# 2. Install updated dependencies
npm install

# 3. Type check
npm run type-check

# 4. Build
npm run build

# 5. Test locally
npm run dev
```

## ⚠️ First Time Setup?

If you see "Missing Firebase configuration" error:
1. Check [SETUP-REQUIRED.md](SETUP-REQUIRED.md)
2. Edit `.env.local` with your Firebase credentials
3. Restart the dev server

## What Changed?

- ✅ Next.js 16.0.10 → 16.1.6
- ✅ React 19.2.1 → 19.2.4
- ✅ All UI libraries updated
- ✅ Firebase updated
- ✅ Dev tools updated

## Watch Out For

⚠️ **Headless UI v2** - Test all modals and dialogs
⚠️ **Zod v4** - Check form validations
⚠️ **UUID v13** - Verify ID generation

## Quick Test

```bash
# Start dev server
npm run dev

# In browser, test:
# 1. Login/Signup
# 2. Create campaign
# 3. Upload image
# 4. Payment modal
# 5. Admin dashboard
```

## If Something Breaks

```bash
# Rollback
git checkout HEAD~1 package.json tsconfig.json next.config.js
rm -rf node_modules package-lock.json
npm install
```

## Full Documentation

- [UPGRADE-GUIDE.md](UPGRADE-GUIDE.md) - Detailed migration guide
- [POST-UPGRADE-CHECKLIST.md](POST-UPGRADE-CHECKLIST.md) - Complete testing checklist
- [CHANGES.md](CHANGES.md) - Full list of changes

## Need Help?

Check the troubleshooting section in UPGRADE-GUIDE.md

---

**Ready to update?** Run `npm install` to get started!
