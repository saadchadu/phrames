#!/bin/bash

# Vercel Deployment Verification Script
# This script helps verify that your Vercel deployment is configured correctly

set -e

echo "🚀 Phrames Deployment Verification Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide your deployment URL${NC}"
    echo "Usage: ./scripts/verify-deployment.sh https://your-domain.com"
    exit 1
fi

DEPLOYMENT_URL=$1
echo "Testing deployment at: $DEPLOYMENT_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL$endpoint" || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ Pass${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}✗ Fail${NC} (Expected: $expected_status, Got: $status_code)"
        return 1
    fi
}

# Function to check if page loads
check_page_loads() {
    local endpoint=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$DEPLOYMENT_URL$endpoint" || echo "")
    
    if [ -n "$response" ] && [ ${#response} -gt 100 ]; then
        echo -e "${GREEN}✓ Pass${NC} (Page loads)"
        return 0
    else
        echo -e "${RED}✗ Fail${NC} (Page doesn't load properly)"
        return 1
    fi
}

# Test counters
total_tests=0
passed_tests=0

echo "📋 Running Deployment Tests"
echo "----------------------------"
echo ""

# Test 1: Homepage
total_tests=$((total_tests + 1))
if check_page_loads "/" "Homepage"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 2: Login page
total_tests=$((total_tests + 1))
if check_page_loads "/login" "Login page"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 3: Signup page
total_tests=$((total_tests + 1))
if check_page_loads "/signup" "Signup page"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 4: Create page (should redirect or load)
total_tests=$((total_tests + 1))
if check_endpoint "/create" "200" "Create page"; then
    passed_tests=$((passed_tests + 1))
fi

# Test 5: Dashboard (should redirect to login if not authenticated)
total_tests=$((total_tests + 1))
echo -n "Testing Dashboard access... "
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/dashboard" || echo "000")
if [ "$status_code" = "200" ] || [ "$status_code" = "307" ] || [ "$status_code" = "302" ]; then
    echo -e "${GREEN}✓ Pass${NC} (Status: $status_code)"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}✗ Fail${NC} (Status: $status_code)"
fi

# Test 6: Payment initiate endpoint (should require auth)
total_tests=$((total_tests + 1))
echo -n "Testing Payment initiate endpoint... "
status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$DEPLOYMENT_URL/api/payments/initiate" || echo "000")
if [ "$status_code" = "401" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ Pass${NC} (Properly requires authentication)"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${YELLOW}⚠ Warning${NC} (Status: $status_code - Expected 401 or 400)"
fi

# Test 7: Webhook endpoint (should reject GET requests)
total_tests=$((total_tests + 1))
echo -n "Testing Webhook endpoint... "
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/payments/webhook" || echo "000")
if [ "$status_code" = "405" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ Pass${NC} (Properly rejects GET requests)"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${YELLOW}⚠ Warning${NC} (Status: $status_code - Expected 405 or 400)"
fi

# Test 8: Check if static assets load
total_tests=$((total_tests + 1))
echo -n "Testing Static assets... "
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/manifest.json" || echo "000")
if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✓ Pass${NC} (Static files accessible)"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${YELLOW}⚠ Warning${NC} (Status: $status_code)"
fi

# Test 9: Check robots.txt
total_tests=$((total_tests + 1))
if check_endpoint "/robots.txt" "200" "Robots.txt"; then
    passed_tests=$((passed_tests + 1))
fi

echo ""
echo "=========================================="
echo "📊 Test Results"
echo "=========================================="
echo "Total Tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $((total_tests - passed_tests))"
echo ""

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}✅ All tests passed! Deployment looks good.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test user authentication (login/signup)"
    echo "2. Create a test campaign"
    echo "3. Test payment flow with Cashfree sandbox"
    echo "4. Verify campaign activation after payment"
    echo "5. Check webhook processing in Vercel logs"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the results above.${NC}"
    echo ""
    echo "Common issues:"
    echo "- Environment variables not set in Vercel"
    echo "- Build errors during deployment"
    echo "- API routes not properly configured"
    echo ""
    echo "Check Vercel deployment logs for more details:"
    echo "vercel logs --follow"
    exit 1
fi
