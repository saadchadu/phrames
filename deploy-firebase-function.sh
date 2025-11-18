#!/bin/bash

# Deploy Firebase Cloud Function for Campaign Expiry
# This script initializes Firebase Functions (if needed) and deploys the scheduled expiry check function

set -e

echo "=========================================="
echo "Firebase Cloud Function Deployment"
echo "=========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is installed"
echo ""

# Check if already logged in
echo "Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1 || {
    echo "❌ Not logged in to Firebase"
    echo "Please run: firebase login"
    exit 1
}

echo "✅ Authenticated with Firebase"
echo ""

# Set the Firebase project
echo "Setting Firebase project to phrames-app..."
firebase use phrames-app || {
    echo "❌ Failed to set Firebase project"
    exit 1
}

echo "✅ Using Firebase project: phrames-app"
echo ""

# Check if functions directory exists
if [ ! -d "functions" ]; then
    echo "📦 Initializing Firebase Functions..."
    echo ""
    echo "Please select the following options:"
    echo "  - Language: TypeScript"
    echo "  - ESLint: Yes (recommended)"
    echo "  - Install dependencies: Yes"
    echo ""
    
    firebase init functions
    
    if [ ! -d "functions" ]; then
        echo "❌ Functions directory was not created"
        exit 1
    fi
    
    echo "✅ Firebase Functions initialized"
    echo ""
else
    echo "✅ Functions directory already exists"
    echo ""
fi

# Copy function files
echo "📋 Copying function files..."

# Create src directory if it doesn't exist
mkdir -p functions/src

# Copy the index.ts file
cp functions-setup/index.ts functions/src/index.ts
echo "  ✓ Copied index.ts"

# Update package.json if needed
if [ -f "functions-setup/package.json" ]; then
    # Merge dependencies from functions-setup/package.json
    echo "  ✓ Function files ready"
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd functions
npm install
cd ..
echo "✅ Dependencies installed"
echo ""

# Build the functions
echo "🔨 Building functions..."
cd functions
npm run build
cd ..
echo "✅ Functions built successfully"
echo ""

# Deploy the function
echo "🚀 Deploying scheduledCampaignExpiryCheck function..."
firebase deploy --only functions:scheduledCampaignExpiryCheck

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "The scheduledCampaignExpiryCheck function is now deployed and will run daily at midnight UTC."
echo ""
echo "To view logs:"
echo "  firebase functions:log --only scheduledCampaignExpiryCheck"
echo ""
echo "To check function status:"
echo "  firebase functions:list"
echo ""
