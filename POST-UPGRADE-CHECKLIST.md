# Post-Upgrade Checklist

After updating dependencies, follow these steps to ensure everything works correctly.

## 1. Install Dependencies

```bash
npm install
```

Expected: Clean installation without peer dependency warnings.

## 2. Type Check

```bash
npm run type-check
```

Expected: No TypeScript errors.

## 3. Lint Check

```bash
npm run lint
```

Expected: No linting errors (warnings are acceptable).

## 4. Development Build

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000 without errors.

## 5. Production Build

```bash
npm run build
```

Expected: Build completes successfully with no errors.

## 6. Manual Testing

### Authentication
- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Logout functionality
- [ ] Protected routes redirect correctly

### Campaign Management
- [ ] Create new campaign
- [ ] Upload frame image
- [ ] Edit campaign details
- [ ] Delete campaign
- [ ] View campaign list in dashboard

### Public Campaign
- [ ] Access campaign via public link
- [ ] Upload photo to campaign
- [ ] Apply frame to photo
- [ ] Download framed photo
- [ ] Share functionality

### Payment Flow
- [ ] Open payment modal
- [ ] Select pricing plan
- [ ] Initiate payment (test mode)
- [ ] Payment callback handling
- [ ] Campaign activation after payment

### Admin Dashboard
- [ ] Access admin dashboard
- [ ] View statistics
- [ ] Manage campaigns
- [ ] Manage users
- [ ] View payment analytics
- [ ] Check system logs
- [ ] Update settings

### UI Components
- [ ] Modals open/close correctly
- [ ] Dropdowns work
- [ ] Forms validate properly
- [ ] Toasts display correctly
- [ ] Loading states show
- [ ] Error states display

### Responsive Design
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)

## 7. Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

## 8. Console Check

Open browser DevTools and check for:
- [ ] No console errors
- [ ] No deprecation warnings
- [ ] No failed network requests

## 9. Performance Check

- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] No layout shifts (CLS)
- [ ] Smooth animations

## 10. Firebase Integration

- [ ] Authentication works
- [ ] Firestore reads/writes work
- [ ] Storage uploads work
- [ ] Security rules enforced

## Common Issues & Quick Fixes

### Issue: Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Type errors with React 19
Check that all `@types/*` packages are updated:
```bash
npm list @types/react @types/react-dom
```

### Issue: Build fails
Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

### Issue: Headless UI components broken
Check [Headless UI v2 migration guide](https://headlessui.com/react/migration-guide)

### Issue: Zod validation errors
Review Zod v4 breaking changes in schemas

## Rollback Instructions

If critical issues are found:

1. Restore previous package.json:
```bash
git checkout HEAD~1 package.json tsconfig.json next.config.js
```

2. Reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Report the issue with details

## Success Criteria

✅ All tests pass
✅ No console errors
✅ All features work as expected
✅ Performance is maintained
✅ No breaking changes in production

## Next Steps

Once all checks pass:
1. Commit the changes
2. Deploy to staging environment
3. Run smoke tests on staging
4. Deploy to production
5. Monitor for issues

---

**Completed**: ☐ Yes ☐ No
**Date**: _____________
**Tested By**: _____________
