#!/bin/bash

# Phrames Production Deployment Script
# This script automates the deployment process with optimizations

echo "🚀 Phrames Production Deployment"
echo "================================"
echo ""

# Step 1: Clean up temporary files
echo "🧹 Step 1: Cleaning up temporary files..."
rm -f pglite-debug.log
rm -rf .next/cache
echo "✅ Cleanup complete"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Run type check
echo "🔍 Step 3: Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed"
    exit 1
fi
echo "✅ Type check passed"
echo ""

# Step 4: Build locally to verify
echo "🏗️  Step 4: Building locally..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 5: Deploy Firestore indexes
echo "🔥 Step 5: Deploying Firestore indexes..."
echo "This will take 5-10 minutes to build..."
firebase deploy --only firestore:indexes
if [ $? -ne 0 ]; then
    echo "⚠️  Firestore index deployment failed or skipped"
    echo "You can deploy manually: firebase deploy --only firestore:indexes"
else
    echo "✅ Firestore indexes deployed"
fi
echo ""

# Step 6: Git commit and push
echo "📤 Step 6: Pushing to GitHub..."
git add .
git commit -m "Production deployment: Modal design improvements and performance optimizations"
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Git push failed"
    exit 1
fi
echo "✅ Pushed to GitHub"
echo ""

echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Monitor Vercel deployment: https://vercel.com/dashboard"
echo "2. Wait for Firestore indexes: https://console.firebase.google.com/project/phrames-app/firestore/indexes"
echo "3. Test the app: https://phrames.cleffon.com"
echo "4. Test modal dialogs and smooth transitions"
echo ""
echo "Expected completion: 10-15 minutes"
echo ""
echo "✨ Improvements in this deployment:"
echo "  - Enhanced modal dialog design system"
echo "  - Replaced browser prompts with custom modals"
echo "  - Improved transition smoothness"
echo "  - Cleaned up temporary files"
echo ""
