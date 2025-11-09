# Troubleshooting Guide

## Common Issues and Solutions

### 1. Phantom TypeScript Errors

**Problem**: VS Code shows errors for files that don't exist (e.g., `app/c/[slug]/page.tsx`)

**Solution**:
```bash
# Run the fix script
./fix-errors.sh

# Or manually:
rm -rf .next
rm -f tsconfig.tsbuildinfo

# Then restart TypeScript server in VS Code:
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### 2. CSS Warnings for Tailwind

**Problem**: VS Code shows "Unknown at rule @tailwind" warnings

**Solution**: These are harmless warnings. The `.vscode/settings.json` file has been configured to suppress them.

If warnings persist:
1. Install Tailwind CSS IntelliSense extension
2. Restart VS Code

### 3. Build Errors

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clear all caches
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# Reinstall
npm install

# Try build again
npm run build
```

### 4. Firebase Connection Issues

**Problem**: Can't connect to Firebase

**Solution**:
1. Check `.env.local` exists and has correct values
2. Verify Firebase project is active
3. Check Firebase console for service status
4. Ensure billing is enabled (if using paid features)

```bash
# Test Firebase connection
firebase projects:list
```

### 5. Authentication Not Working

**Problem**: Users can't sign in

**Solution**:
1. Enable Email/Password auth in Firebase Console
2. Enable Google auth in Firebase Console
3. Add authorized domains in Firebase Console
4. Check browser console for errors

### 6. Images Not Uploading

**Problem**: Campaign image upload fails

**Solution**:
1. Check file size (must be < 10MB)
2. Check file type (must be image)
3. Verify Storage rules are deployed
4. Check Firebase Storage bucket exists

```bash
# Deploy storage rules
firebase deploy --only storage
```

### 7. Permission Denied Errors

**Problem**: Firestore permission denied

**Solution**:
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Verify rules in Firebase Console
```

### 8. Favicon Not Showing

**Problem**: Favicon doesn't appear

**Solution**:
1. Hard refresh browser (Cmd+Shift+R)
2. Clear browser cache
3. Check `/public/icons/favicon.png` exists
4. Wait for deployment to propagate

### 9. Slow Build Times

**Problem**: Build takes too long

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Use turbo mode
npm run build -- --turbo
```

### 10. Environment Variables Not Working

**Problem**: Environment variables are undefined

**Solution**:
1. Ensure `.env.local` exists (not `.env`)
2. Restart dev server after changing env vars
3. Check variable names start with `NEXT_PUBLIC_` for client-side
4. Don't use quotes around values in `.env.local`

```bash
# Correct format:
NEXT_PUBLIC_FIREBASE_API_KEY=your-key-here

# Wrong format:
NEXT_PUBLIC_FIREBASE_API_KEY="your-key-here"
```

## Quick Fixes

### Clear All Caches
```bash
rm -rf .next
rm -rf node_modules/.cache
rm -f tsconfig.tsbuildinfo
```

### Restart Everything
```bash
# Kill all node processes
pkill -f node

# Restart dev server
npm run dev
```

### Reset Firebase
```bash
# Logout and login again
firebase logout
firebase login

# List projects to verify
firebase projects:list
```

## Error Messages

### "Module not found"
- Run `npm install`
- Check import paths use `@/` alias
- Verify file exists at the path

### "Cannot find module '@/lib/firestore'"
- This is a phantom error if the file exists
- Run `./fix-errors.sh`
- Restart TypeScript server

### "Firebase: Error (auth/invalid-api-key)"
- Check `.env.local` has correct API key
- Verify no extra quotes or spaces
- Restart dev server

### "Storage: Object does not exist"
- Check Firebase Storage rules are deployed
- Verify bucket name in `.env.local`
- Check file path is correct

## Getting Help

1. Check this troubleshooting guide
2. Review [SECURITY.md](./SECURITY.md) for security issues
3. Check Firebase Console for errors
4. Review browser console for client errors
5. Check terminal for server errors

## Useful Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start production server
npm start

# Deploy security rules
./deploy-security.sh

# Fix common errors
./fix-errors.sh
```

## Still Having Issues?

1. Check all files are saved
2. Restart your IDE
3. Clear all caches
4. Reinstall dependencies
5. Check Firebase Console for service status
6. Review error logs carefully

---

**Most issues are resolved by clearing caches and restarting!**
