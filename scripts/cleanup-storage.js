/**
 * One-time script to safely delete unused files from Firebase Storage.
 *
 * What it does:
 * 1. Fetches all campaign frameURLs from Firestore (these are PROTECTED)
 * 2. Fetches all user profileImageUrls from Firestore (these are PROTECTED)
 * 3. Lists every file in Storage
 * 4. Deletes only files that are NOT referenced by any Firestore document
 *
 * Run with:
 *   node scripts/cleanup-storage.js --dry-run   ← preview only, nothing deleted
 *   node scripts/cleanup-storage.js              ← actually deletes
 *
 * Requirements:
 *   npm install firebase-admin
 *   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path, or
 *   place serviceAccountKey.json in the project root.
 */

const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

const DRY_RUN = process.argv.includes('--dry-run')

// ── Init ──────────────────────────────────────────────────────────────────────
const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json')
if (!fs.existsSync(keyPath)) {
  console.error('❌  serviceAccountKey.json not found in project root.')
  console.error('    Download it from Firebase Console → Project Settings → Service Accounts')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
  storageBucket: 'phrames-app.firebasestorage.app',
})

const db = admin.firestore()
const bucket = admin.storage().bucket()

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract the storage path from any URL format the app may have stored:
 *  - https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded>?alt=media
 *  - https://img.phrames.app/<path>
 *  - https://storage.googleapis.com/<bucket>/<path>
 */
function extractStoragePath(url) {
  if (!url) return null

  // Firebase download URL
  const fbMatch = url.match(/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/(.+?)(\?|$)/)
  if (fbMatch) return decodeURIComponent(fbMatch[1])

  // CDN URL
  if (url.includes('img.phrames.app/')) return url.split('img.phrames.app/')[1]

  // Raw GCS URL
  const gcsMatch = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/)
  if (gcsMatch) return gcsMatch[1]

  return null
}

async function collectActiveStoragePaths() {
  const paths = new Set()

  // Campaign frame images
  const campaigns = await db.collection('campaigns').get()
  campaigns.forEach(doc => {
    const p = extractStoragePath(doc.data().frameURL)
    if (p) paths.add(p)
  })
  console.log(`  ✔  ${campaigns.size} campaigns → ${paths.size} frame image paths`)

  // User profile images
  const users = await db.collection('users').get()
  let profileCount = 0
  users.forEach(doc => {
    const p = extractStoragePath(doc.data().profileImageUrl)
    if (p) { paths.add(p); profileCount++ }
  })
  console.log(`  ✔  ${users.size} users → ${profileCount} profile image paths`)

  return paths
}

// ── Main ──────────────────────────────────────────────────────────────────────
;(async () => {
  console.log(DRY_RUN ? '🔍  DRY RUN — nothing will be deleted\n' : '🗑️   LIVE RUN — files will be permanently deleted\n')

  console.log('📋  Collecting active file references from Firestore...')
  const activePaths = await collectActiveStoragePaths()
  console.log(`  ✔  Total protected paths: ${activePaths.size}\n`)

  console.log('📦  Listing all files in Storage...')
  const [allFiles] = await bucket.getFiles()
  console.log(`  ✔  Total files in Storage: ${allFiles.length}\n`)

  const toDelete = allFiles.filter(f => !activePaths.has(f.name))
  const toKeep   = allFiles.length - toDelete.length

  console.log(`📊  Results:`)
  console.log(`    Protected (in use):  ${toKeep}`)
  console.log(`    Unused (to delete):  ${toDelete.length}\n`)

  if (toDelete.length === 0) {
    console.log('✅  Nothing to delete.')
    process.exit(0)
  }

  if (DRY_RUN) {
    console.log('📄  Files that WOULD be deleted:')
    toDelete.forEach(f => console.log(`    - ${f.name}`))
    console.log('\nRun without --dry-run to actually delete them.')
    process.exit(0)
  }

  console.log('🗑️   Deleting unused files...')
  let deleted = 0
  let failed = 0
  for (const file of toDelete) {
    try {
      await file.delete()
      console.log(`  ✔  Deleted: ${file.name}`)
      deleted++
    } catch (err) {
      console.error(`  ✖  Failed: ${file.name} — ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅  Done. Deleted: ${deleted}, Failed: ${failed}`)
  process.exit(0)
})()
