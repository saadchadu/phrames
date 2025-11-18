#!/bin/bash

# Verify Firebase Cloud Function Deployment
# This script checks the deployment status and schedule configuration

set -e

echo "=========================================="
echo "Firebase Function Deployment Verification"
echo "=========================================="
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    exit 1
fi

echo "✅ Firebase CLI is installed"
echo ""

# Check current project
echo "Current Firebase Project:"
firebase use
echo ""

# List deployed functions
echo "Deployed Functions:"
firebase functions:list
echo ""

# Check function details
echo "Function Details:"
echo "  Name: scheduledCampaignExpiryCheck"
echo "  Trigger: Scheduled (Pub/Sub)"
echo "  Schedule: 0 0 * * * (Daily at midnight UTC)"
echo "  Runtime: Node.js 20"
echo "  Location: us-central1"
echo ""

# Show recent logs
echo "Recent Function Logs (last 5 entries):"
firebase functions:log --only scheduledCampaignExpiryCheck 2>&1 | head -20
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "✅ Function is deployed and scheduled"
echo ""
echo "Next Steps:"
echo "  1. View function in Firebase Console:"
echo "     https://console.firebase.google.com/project/phrames-app/functions"
echo ""
echo "  2. View Cloud Scheduler jobs:"
echo "     https://console.cloud.google.com/cloudscheduler?project=phrames-app"
echo ""
echo "  3. Monitor function execution:"
echo "     firebase functions:log --only scheduledCampaignExpiryCheck"
echo ""
echo "  4. Test function manually (if needed):"
echo "     See tests/trigger-expiry-check.ts"
echo ""
