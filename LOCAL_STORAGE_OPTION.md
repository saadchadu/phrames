# Local File Storage (100% Free, No External Services)

## Overview

Store images directly on your server instead of Firebase Storage or S3.

**Pros:**
- ✅ 100% free
- ✅ No external dependencies
- ✅ No API keys needed
- ✅ Unlimited storage (your disk space)
- ✅ Fast local access

**Cons:**
- ⚠️ Not suitable for production with multiple servers
- ⚠️ Need to backup manually
- ⚠️ Lost if server crashes

**Best for:** Development, testing, small personal projects

---

## How It Works

1. Images stored in `public/uploads/` folder
2. Served directly by Nuxt as static files
3. Accessible via `/uploads/frames/...` URLs
4. No external API calls needed

---

## Implementation

I can implement this in 10 minutes. Here's what changes:

### 1. Create Local Storage Utility

```typescript
// server/utils/localStorage.ts
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function uploadToLocal(
  path: string,
  buffer: Buffer
): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filePath = join(uploadDir, path)
  const fileDir = join(uploadDir, path.split('/').slice(0, -1).join('/'))
  
  // Create directory if it doesn't exist
  if (!existsSync(fileDir)) {
    await mkdir(fileDir, { recursive: true })
  }
  
  // Write file
  await writeFile(filePath, buffer)
  
  // Return public URL
  return `/uploads/${path}`
}
```

### 2. Update Campaign Creation

```typescript
// server/api/campaigns/index.post.ts
import { uploadToLocal } from '~/server/utils/localStorage'

// Instead of:
// await uploadToFirebaseStorage(frameKey, buffer, 'image/png')

// Use:
const frameUrl = await uploadToLocal(frameKey, buffer)
```

### 3. Update Asset Serving

```typescript
// server/api/assets/[...path].get.ts
// Simply redirect to /uploads/ path
return sendRedirect(event, `/uploads/${path}`, 302)
```

---

## Folder Structure

```
phrames/
├── public/
│   └── uploads/
│       ├── frames/
│       │   └── user123/
│       │       └── 1234567890-abc123.png
│       └── thumbs/
│           └── user123/
│               └── 1234567890-abc123.png
```

---

## Setup Steps

1. **I'll modify the code** (takes 10 minutes)
2. **Create uploads folder:**
   ```bash
   mkdir -p public/uploads/frames
   mkdir -p public/uploads/thumbs
   ```
3. **Restart server:**
   ```bash
   npm run dev
   ```
4. **Done!** No Firebase Storage needed

---

## Storage Limits

**Your disk space!** Typically:
- Development: 100+ GB available
- Production VPS: 25-100 GB
- Cloud hosting: Varies by plan

---

## Backup Strategy

Since files are local, you need to backup:

```bash
# Backup uploads folder
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/

# Restore from backup
tar -xzf uploads-backup-20240128.tar.gz
```

Or use git (not recommended for large files):
```bash
git add public/uploads/
git commit -m "Backup uploads"
```

---

## Production Considerations

### ✅ Good for:
- Single server deployments
- Small projects (< 1000 campaigns)
- Personal use
- Development/testing

### ❌ Not good for:
- Multiple servers (load balancing)
- High traffic sites
- Need for CDN
- Automatic backups

---

## Migration Path

If you outgrow local storage, easy to migrate:

1. **To Firebase Storage:**
   - Upload existing files to Firebase
   - Update URLs in database
   - Switch back to Firebase Storage code

2. **To Cloudflare R2:**
   - Upload files to R2 bucket
   - Update URLs
   - Use S3-compatible code

3. **To CDN:**
   - Keep local storage
   - Add CDN in front (Cloudflare, etc.)
   - Serve via CDN URLs

---

## Should You Use This?

### Use Local Storage If:
- ✅ You're just testing/developing
- ✅ You have a single server
- ✅ You want zero external dependencies
- ✅ You're okay with manual backups
- ✅ You have < 100 campaigns

### Use Firebase Storage If:
- ✅ You want automatic backups
- ✅ You need CDN delivery
- ✅ You might scale to multiple servers
- ✅ You want zero maintenance
- ✅ You want it "just to work"

---

## Want Me to Implement This?

Just say "yes" and I'll:
1. Create `server/utils/localStorage.ts`
2. Update campaign creation endpoint
3. Update frame update endpoint
4. Update asset serving endpoint
5. Create uploads folders
6. Test it works

**Takes 10 minutes!**

---

## Or Stick with Firebase?

Remember: **Firebase is already free!**
- 5 GB storage
- 1 GB/day downloads
- No credit card needed
- Already configured
- Zero maintenance

**Your choice!** Both are 100% free. 😊
