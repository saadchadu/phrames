# Upgrade Guide - February 2026

This guide covers the major dependency updates applied to the Phrames project.

## Summary of Changes

All dependencies have been updated to their latest stable versions as of February 2026.

## Major Updates

### Core Framework & Libraries
- **Next.js**: 16.0.10 → 16.1.6
- **React**: 19.2.1 → 19.2.4
- **React DOM**: 19.2.1 → 19.2.4

### UI Libraries
- **@headlessui/react**: 1.7.17 → 2.2.9 (Major version bump)
- **Framer Motion**: 10.16.5 → 12.34.3 (Major version bump)
- **Lucide React**: 0.294.0 → 0.575.0
- **Radix UI Components**: Multiple minor updates

### Firebase
- **firebase**: 12.5.0 → 12.9.0
- **firebase-admin**: 13.6.0 → 13.6.1

### Form & Validation
- **Zod**: 3.22.4 → 4.3.6 (Major version bump)
- **React Hook Form**: 7.48.2 → 7.71.2

### Utilities
- **UUID**: 9.0.1 → 13.0.0 (Major version bump)
- **Tailwind Merge**: 2.0.0 → 3.5.0 (Major version bump)
- **Recharts**: 3.4.1 → 3.7.0

### Dev Dependencies
- **TypeScript Types**: Updated to React 19 compatible versions
- **ESLint**: 9.39.1 → 9.39.3
- **Tailwind CSS**: 3.3.5 → 3.4.19
- **Autoprefixer**: 10.4.16 → 10.4.24

## Breaking Changes to Watch

### 1. Headless UI v2
The upgrade from v1 to v2 may have API changes. Test all components using Headless UI:
- Dropdowns
- Modals/Dialogs
- Transitions

### 2. Zod v4
Zod v4 has breaking changes. Review all schema definitions:
- Check form validation schemas
- API request/response validation
- Environment variable validation

### 3. UUID v13
The UUID library has been updated significantly. Verify:
- ID generation in campaigns
- User ID handling
- Any custom UUID usage

### 4. Tailwind Merge v3
May affect className merging logic. Test:
- Dynamic className generation
- Component variants
- Conditional styling

## Migration Steps

### 1. Install Updated Dependencies
```bash
npm install
```

### 2. Run Type Check
```bash
npm run type-check
```

### 3. Test Critical Paths
- [ ] User authentication (login/signup)
- [ ] Campaign creation
- [ ] Image upload and processing
- [ ] Payment flow
- [ ] Admin dashboard
- [ ] Form submissions

### 4. Check for Deprecation Warnings
```bash
npm run dev
```
Monitor console for any deprecation warnings.

### 5. Run Build
```bash
npm run build
```

## Potential Issues & Solutions

### Issue: Headless UI Components Not Working
**Solution**: Check the [Headless UI v2 migration guide](https://headlessui.com/react/migration-guide)

### Issue: Zod Validation Errors
**Solution**: Review Zod v4 breaking changes and update schemas accordingly

### Issue: Type Errors with React 19
**Solution**: Ensure all `@types/*` packages are updated to React 19 compatible versions

### Issue: UUID Import Errors
**Solution**: Update import statements if needed:
```typescript
// Old (if applicable)
import { v4 as uuidv4 } from 'uuid';

// New (verify in docs)
import { v4 as uuidv4 } from 'uuid';
```

## Testing Checklist

- [ ] Development server starts without errors
- [ ] Production build completes successfully
- [ ] All pages render correctly
- [ ] Authentication flows work
- [ ] Campaign CRUD operations function
- [ ] Payment integration works
- [ ] Admin dashboard accessible
- [ ] Image upload and processing works
- [ ] Forms validate correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness maintained

## Rollback Plan

If issues arise, you can rollback by:

1. Restore the previous `package.json`:
```bash
git checkout HEAD~1 package.json
```

2. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Additional Resources

- [Next.js 16 Release Notes](https://nextjs.org/blog)
- [React 19 Upgrade Guide](https://react.dev/blog)
- [Headless UI v2 Migration](https://headlessui.com/react/migration-guide)
- [Zod v4 Release Notes](https://github.com/colinhacks/zod/releases)

## Support

If you encounter issues during the upgrade, check:
1. GitHub Issues for each updated package
2. Official documentation
3. Community forums (Stack Overflow, Reddit)

---

**Last Updated**: February 22, 2026
