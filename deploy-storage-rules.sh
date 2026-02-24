#!/bin/bash

# Deploy Firebase Storage Rules
# This script deploys the updated storage.rules to Firebase

echo "🚀 Deploying Firebase Storage Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Install it with: npm install -g firebase-tools"
    echo "🔑 Then login with: firebase login"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null
then
    echo "❌ Not logged in to Firebase."
    echo "🔑 Please run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"
echo ""

# Deploy only storage rules
echo "📤 Deploying storage rules..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Storage rules deployed successfully!"
    echo ""
    echo "🧪 Test the changes:"
    echo "   1. Go to your profile page"
    echo "   2. Try uploading a profile image"
    echo "   3. It should work now!"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "📝 Check the error message above"
    echo "🔍 Verify your Firebase project is selected"
    echo ""
fi
