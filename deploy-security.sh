#!/bin/bash

# Phrames Security Rules Deployment Script
# This script deploys Firestore and Storage security rules to Firebase

echo "🔒 Phrames Security Rules Deployment"
echo "===================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase"
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Firebase authentication verified"
echo ""

# Check if firestore.rules exists
if [ ! -f "firestore.rules" ]; then
    echo "❌ firestore.rules file not found"
    exit 1
fi

echo "✅ firestore.rules found"

# Check if storage.rules exists
if [ ! -f "storage.rules" ]; then
    echo "❌ storage.rules file not found"
    exit 1
fi

echo "✅ storage.rules found"
echo ""

# Ask for confirmation
read -p "Deploy security rules to Firebase? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Firestore rules deployment failed"
    exit 1
fi

echo "✅ Firestore rules deployed successfully"
echo ""

echo "🚀 Deploying Storage security rules..."
firebase deploy --only storage

if [ $? -ne 0 ]; then
    echo "❌ Storage rules deployment failed"
    exit 1
fi

echo "✅ Storage rules deployed successfully"
echo ""

echo "🎉 All security rules deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Test your security rules in Firebase Console"
echo "2. Monitor Firebase usage for any issues"
echo "3. Review SECURITY.md for best practices"
echo ""
