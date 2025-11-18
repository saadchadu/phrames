#!/bin/bash

echo "🔍 Verifying Cashfree Configuration..."
echo ""

# Load .env.local
if [ -f .env.local ]; then
  source .env.local
  
  echo "✅ .env.local file found"
  echo ""
  
  # Check Cashfree credentials
  if [ -z "$CASHFREE_CLIENT_ID" ]; then
    echo "❌ CASHFREE_CLIENT_ID is not set"
  else
    echo "✅ CASHFREE_CLIENT_ID: ${CASHFREE_CLIENT_ID:0:20}..."
  fi
  
  if [ -z "$CASHFREE_CLIENT_SECRET" ]; then
    echo "❌ CASHFREE_CLIENT_SECRET is not set"
  else
    echo "✅ CASHFREE_CLIENT_SECRET: ${CASHFREE_CLIENT_SECRET:0:20}..."
  fi
  
  if [ -z "$CASHFREE_ENV" ]; then
    echo "❌ CASHFREE_ENV is not set"
  else
    echo "✅ CASHFREE_ENV: $CASHFREE_ENV"
  fi
  
  if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo "❌ NEXT_PUBLIC_APP_URL is not set"
  else
    echo "✅ NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
  fi
  
  echo ""
  echo "📝 Note: Restart your development server to apply these changes"
  
else
  echo "❌ .env.local file not found"
  exit 1
fi
