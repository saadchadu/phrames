#!/bin/bash

# ============================================
# System Health Check Script
# Phrames Paid Campaign System
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ${1}${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

# Check if required commands are available
check_dependencies() {
    local missing=0
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not installed (optional for deployment checks)"
        missing=1
    fi
    
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI not installed (optional for function checks)"
        missing=1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    return $missing
}

# Check environment variables
check_env_vars() {
    print_header "ENVIRONMENT VARIABLES CHECK"
    
    local missing=0
    
    # Check .env.local file
    if [ ! -f .env.local ]; then
        print_error ".env.local file not found"
        return 1
    fi
    
    # Required variables
    local required_vars=(
        "CASHFREE_CLIENT_ID"
        "CASHFREE_CLIENT_SECRET"
        "CASHFREE_ENV"
        "NEXT_PUBLIC_APP_URL"
        "FIREBASE_PROJECT_ID"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.local; then
            print_success "$var is set"
        else
            print_error "$var is missing"
            missing=1
        fi
    done
    
    if [ $missing -eq 0 ]; then
        print_success "All required environment variables are set"
    else
        print_error "Some environment variables are missing"
    fi
    
    return $missing
}

# Check API endpoints
check_api_endpoints() {
    print_header "API ENDPOINTS CHECK"
    
    # Get app URL from env
    local APP_URL=$(grep "^NEXT_PUBLIC_APP_URL=" .env.local | cut -d '=' -f2)
    
    if [ -z "$APP_URL" ]; then
        print_warning "Cannot check endpoints: NEXT_PUBLIC_APP_URL not set"
        return 1
    fi
    
    print_info "Checking endpoints at: $APP_URL"
    
    # Check payment initiate endpoint (should return 401 without auth)
    local status=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/payments/initiate" -X POST)
    if [ "$status" = "401" ]; then
        print_success "Payment initiate endpoint is accessible (401 as expected)"
    else
        print_warning "Payment initiate endpoint returned: $status"
    fi
    
    # Check webhook endpoint (should return 400 without signature)
    status=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/payments/webhook" -X POST)
    if [ "$status" = "400" ] || [ "$status" = "200" ]; then
        print_success "Webhook endpoint is accessible ($status)"
    else
        print_warning "Webhook endpoint returned: $status"
    fi
}

# Check recent errors
check_recent_errors() {
    print_header "RECENT ERRORS CHECK"
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not available, skipping error check"
        return 0
    fi
    
    print_info "Checking for recent errors..."
    
    # Get recent error logs
    local errors=$(vercel logs --filter=error --limit=10 2>/dev/null || echo "")
    
    if [ -z "$errors" ]; then
        print_success "No recent errors found"
    else
        print_warning "Recent errors detected:"
        echo "$errors" | head -5
        echo ""
        print_info "Run 'vercel logs --filter=error --limit=50' for more details"
    fi
}

# Check Firebase function status
check_firebase_function() {
    print_header "FIREBASE FUNCTION CHECK"
    
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI not available, skipping function check"
        return 0
    fi
    
    print_info "Checking Firebase function deployment..."
    
    # List functions
    local functions=$(firebase functions:list 2>/dev/null || echo "")
    
    if echo "$functions" | grep -q "scheduledCampaignExpiryCheck"; then
        print_success "Expiry check function is deployed"
    else
        print_warning "Expiry check function not found or not deployed"
    fi
}

# Check payment system configuration
check_payment_config() {
    print_header "PAYMENT SYSTEM CONFIGURATION"
    
    # Check Cashfree environment
    local cashfree_env=$(grep "^CASHFREE_ENV=" .env.local | cut -d '=' -f2)
    
    if [ "$cashfree_env" = "PRODUCTION" ]; then
        print_warning "Cashfree is in PRODUCTION mode"
    elif [ "$cashfree_env" = "SANDBOX" ]; then
        print_info "Cashfree is in SANDBOX mode"
    else
        print_error "Cashfree environment not properly configured"
    fi
}

# Generate summary report
generate_summary() {
    print_header "HEALTH CHECK SUMMARY"
    
    echo "Timestamp: $(date)"
    echo ""
    echo "System Status:"
    echo "  - Environment: $(grep "^CASHFREE_ENV=" .env.local | cut -d '=' -f2 || echo 'Unknown')"
    echo "  - App URL: $(grep "^NEXT_PUBLIC_APP_URL=" .env.local | cut -d '=' -f2 || echo 'Not set')"
    echo ""
    
    print_info "For detailed monitoring, see MONITORING-GUIDE.md"
    print_info "To view real-time logs: vercel logs --follow"
    print_info "To check Firebase logs: firebase functions:log"
}

# Main execution
main() {
    print_header "PHRAMES SYSTEM HEALTH CHECK"
    
    echo "Starting health check at $(date)"
    echo ""
    
    # Run checks
    check_dependencies
    check_env_vars
    check_payment_config
    check_api_endpoints
    check_recent_errors
    check_firebase_function
    generate_summary
    
    echo ""
    print_success "Health check complete!"
}

main
