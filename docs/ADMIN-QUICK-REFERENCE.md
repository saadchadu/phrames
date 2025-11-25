# Admin Dashboard Quick Reference

## Quick Setup

```bash
# 1. Set environment variable
echo "ADMIN_UID=your-firebase-auth-uid" >> .env.local

# 2. Initialize settings
npx tsx scripts/initialize-admin-settings.ts

# 3. Deploy
vercel --prod
```

## Common Tasks

### Grant Admin Access
```bash
# Via script
npx tsx scripts/grant-admin-by-email.ts user@example.com

# Via dashboard
Admin → Users → Find User → Toggle "Set Admin"
```

### Extend Campaign
```
Admin → Campaigns → Find Campaign → Extend Expiry → Select Duration
```

### Block User
```
Admin → Users → Find User → Toggle "Block User"
```

### Export Data
```
Admin → Settings → Export Payments/Campaigns → Download CSV
```

### Trigger Expiry Check
```
Admin → Settings → Trigger Expiry Cron
```

## Admin Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Overview dashboard |
| `/admin/campaigns` | Campaign management |
| `/admin/users` | User management |
| `/admin/payments` | Payment analytics |
| `/admin/logs` | System logs |
| `/admin/settings` | Platform settings |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/campaigns` | GET, PATCH, DELETE | Campaign operations |
| `/api/admin/users` | GET, PATCH, DELETE | User operations |
| `/api/admin/payments` | GET | Payment data |
| `/api/admin/logs` | GET | System logs |
| `/api/admin/settings` | GET, PATCH | Settings management |
| `/api/admin/actions` | POST | Manual actions |

## Environment Variables

```bash
# Required
ADMIN_UID=your-firebase-auth-uid

# Firebase (already configured)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on `/admin` | Check `ADMIN_UID` matches your Firebase Auth UID |
| Actions fail | Verify custom claims are set, check logs |
| Stats not updating | Refresh page, check Firestore indexes |
| CSV export fails | Use date filters to reduce dataset size |

## Security Checklist

- [ ] `ADMIN_UID` set in production environment
- [ ] Firestore security rules deployed
- [ ] Admin users have strong passwords
- [ ] 2FA enabled on admin accounts
- [ ] Regular log reviews scheduled
- [ ] Backup strategy in place

## Log Event Types

- `admin_action` - Manual admin operations
- `cron_execution` - Automated cron runs
- `webhook_failure` - Failed payment webhooks
- `campaign_expiry` - Campaign expirations
- `user_blocked` - User blocking actions
- `settings_changed` - Settings modifications

## Feature Toggles

| Setting | Effect |
|---------|--------|
| Free Campaign Enabled | Allow users to create one free campaign |
| New Campaigns Enabled | Allow creation of new campaigns |
| New Signups Enabled | Allow new user registrations |
| Enabled Plans | Control which subscription plans are available |

## Scripts

```bash
# Initialize admin settings
npx tsx scripts/initialize-admin-settings.ts

# Grant admin by email
npx tsx scripts/grant-admin-by-email.ts user@example.com

# Setup admin claims
npx tsx scripts/setup-admin-claims.ts

# Verify Firestore rules
npx tsx scripts/verify-firestore-rules.ts
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Close modal |
| `Ctrl/Cmd + K` | Quick search |

## Support

- Check system logs: `/admin/logs`
- Review Firebase Console
- Check browser console for errors
- Contact development team

---

**Quick Links**:
- [Full Documentation](./ADMIN-DASHBOARD-GUIDE.md)
- [Firebase Console](https://console.firebase.google.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
