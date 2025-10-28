#!/usr/bin/env node

/**
 * Deployment Verification Script for Phrames
 * Run this script to verify all environment variables and configurations are set correctly
 */

const requiredEnvVars = {
// Firebase Public Config
'NUXT_PUBLIC_FIREBASE_API_KEY': 'Firebase Web API key',
'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase Auth domain',
'NUXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase project ID',
'NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase storage bucket',
'NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase messaging sender ID',
'NUXT_PUBLIC_FIREBASE_APP_ID': 'Firebase app ID',
  
// Firebase Admin Config
'FIREBASE_PROJECT_ID': 'Firebase Admin project ID',
'FIREBASE_CLIENT_EMAIL': 'Firebase Admin service account email',
'FIREBASE_PRIVATE_KEY': 'Firebase Admin service account private key',
  
  // Storage
  'S3_ENDPOINT': 'S3-compatible storage endpoint',
  'S3_ACCESS_KEY_ID': 'Storage access key',
  'S3_SECRET_ACCESS_KEY': 'Storage secret key',
  'S3_BUCKET': 'Storage bucket name',
  'S3_PUBLIC_BASE_URL': 'Public CDN URL for assets',
  'S3_REGION': 'Storage region (e.g., us-east-1)',
  
  // Site Config
  'NUXT_PUBLIC_SITE_URL': 'Your domain URL'
}

console.log('🔍 Verifying Phrames Deployment Configuration...\n')

let allValid = true
const missing = []
const warnings = []

// Check environment variables
for (const [key, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[key]
  
  if (!value) {
    missing.push(`❌ ${key}: ${description}`)
    allValid = false
  } else {
    console.log(`✅ ${key}: Set`)
    
    // Additional validations
    if (key === 'NUXT_PUBLIC_SITE_URL' && !value.startsWith('https://')) {
      warnings.push(`⚠️  ${key}: Should use HTTPS in production`)
    }
    
    if (key === 'FIREBASE_PRIVATE_KEY' && !value.includes('BEGIN PRIVATE KEY')) {
      warnings.push(`⚠️  ${key}: Should be a valid private key`)
    }
  }
}

console.log('\n📋 Verification Results:')

if (missing.length > 0) {
  console.log('\n❌ Missing Environment Variables:')
  missing.forEach(item => console.log(`   ${item}`))
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:')
  warnings.forEach(item => console.log(`   ${item}`))
}

if (allValid) {
  console.log('\n🎉 All required environment variables are set!')
  console.log('\n📝 Next Steps:')
  console.log('   1. Verify Firestore security rules are deployed')
  console.log('   2. Deploy to Vercel: vercel --prod')
  console.log('   3. Configure custom domain: phrames.cleffon.com')
  console.log('   4. Test all functionality')
} else {
  console.log('\n❌ Please set all missing environment variables before deploying.')
  console.log('   Copy .env.example to .env and fill in all values.')
}

console.log('\n🔗 Useful Links:')
console.log('   • Firebase Console: https://console.firebase.google.com')
console.log('   • Vercel Dashboard: https://vercel.com/dashboard')
console.log('   • Deployment Guide: ./DEPLOYMENT.md')
console.log('   • Production Checklist: ./PRODUCTION_CHECKLIST.md')

process.exit(allValid ? 0 : 1)
