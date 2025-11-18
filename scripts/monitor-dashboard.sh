#!/bin/bash

# ============================================
# Real-time Monitoring Dashboard
# Phrames Paid Campaign System
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo -e "${CYAN}ℹ ${1}${NC}"
}

# Clear screen and show header
clear
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           PHRAMES MONITORING DASHBOARD                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Generated: $(date)"
echo ""

# Check if required commands are available
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not installed. Some checks will be skipped."
    VERCEL_AVAILABLE=false
else
    VERCEL_AVAILABLE=true
fi

if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI not installed. Function checks will be skipped."
    FIREBASE_AVAILABLE=false
else
    FIREBASE_AVAILABLE=true
fi

# 1. System Status
print_header "📊 SYSTEM STATUS"

if [ "$VERCEL_AVAILABLE" = true ]; then
    print_info "Recent deployments:"
    vercel ls --limit=3 2>/dev/null || print_warning "Could not fetch deployments"
else
    print_warning "Vercel CLI not available"
fi

echo ""

# 2. Payment Events (Last Hour)
print_header "💳 PAYMENT EVENTS (Last Hour)"

if [ "$VERCEL_AVAILABLE" = true ]; then
    TEMP_FILE=$(mktemp)
    vercel logs --filter="payment" --since=1h --limit=500 > "$TEMP_FILE" 2>/dev/null || true
    
    initiated=$(grep -c "payment_initiated" "$TEMP_FILE" 2>/dev/null || echo "0")
    success=$(grep -c "payment_success" "$TEMP_FILE" 2>/dev/null || echo "0")
    failed=$(grep -c "payment_failed" "$TEMP_FILE" 2>/dev/null || echo "0")
    
    echo "Payments Initiated:  $initiated"
    echo "Payments Successful: $success"
    echo "Payments Failed:     $failed"
    
    if [ "$initiated" -gt 0 ]; then
        success_rate=$(awk "BEGIN {printf \"%.1f\", ($success / $initiated) * 100}")
        echo "Success Rate:        ${success_rate}%"
        
        if (( $(echo "$success_rate < 90" | bc -l 2>/dev/null || echo "0") )); then
            print_warning "Success rate below 90%"
        fi
    fi
    
    rm -f "$TEMP_FILE"
else
    print_warning "Vercel CLI not available"
fi

echo ""

# 3. Recent Errors
print_header "🚨 RECENT ERRORS (Last 10)"

if [ "$VERCEL_AVAILABLE" = true ]; then
    ERROR_COUNT=$(vercel logs --filter=error --since=1h --limit=100 2>/dev/null | wc -l || echo "0")
    
    if [ "$ERROR_COUNT" -gt 0 ]; then
        print_warning "Found $ERROR_COUNT errors in the last hour"
        echo ""
        vercel logs --filter=error --limit=5 2>/dev/null || true
    else
        print_success "No errors in the last hour"
    fi
else
    print_warning "Vercel CLI not available"
fi

echo ""

# 4. Webhook Status
print_header "🔔 WEBHOOK STATUS (Last Hour)"

if [ "$VERCEL_AVAILABLE" = true ]; then
    TEMP_FILE=$(mktemp)
    vercel logs --filter="webhook" --since=1h --limit=500 > "$TEMP_FILE" 2>/dev/null || true
    
    received=$(grep -c "webhook_received" "$TEMP_FILE" 2>/dev/null || echo "0")
    processed=$(grep -c "webhook_processed" "$TEMP_FILE" 2>/dev/null || echo "0")
    
    echo "Webhooks Received:   $received"
    echo "Webhooks Processed:  $processed"
    
    if [ "$received" -gt 0 ] && [ "$processed" -lt "$received" ]; then
        print_warning "Some webhooks not processed"
    elif [ "$received" -gt 0 ]; then
        print_success "All webhooks processed"
    fi
    
    rm -f "$TEMP_FILE"
else
    print_warning "Vercel CLI not available"
fi

echo ""

# 5. API Health Check
print_header "🏥 API HEALTH CHECK"

# Get app URL from env
if [ -f .env.local ]; then
    APP_URL=$(grep "^NEXT_PUBLIC_APP_URL=" .env.local | cut -d '=' -f2)
    
    if [ -n "$APP_URL" ]; then
        print_info "Checking endpoints at: $APP_URL"
        
        # Check payment initiate (should return 401)
        status=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/payments/initiate" -X POST 2>/dev/null || echo "000")
        if [ "$status" = "401" ]; then
            print_success "Payment initiate endpoint: $status (OK)"
        else
            print_warning "Payment initiate endpoint: $status"
        fi
        
        # Check webhook (should return 400 or 200)
        status=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/payments/webhook" -X POST 2>/dev/null || echo "000")
        if [ "$status" = "400" ] || [ "$status" = "200" ]; then
            print_success "Webhook endpoint: $status (OK)"
        else
            print_warning "Webhook endpoint: $status"
        fi
    else
        print_warning "NEXT_PUBLIC_APP_URL not set in .env.local"
    fi
else
    print_warning ".env.local file not found"
fi

echo ""

# 6. Firebase Function Status
print_header "⚡ FIREBASE FUNCTION STATUS"

if [ "$FIREBASE_AVAILABLE" = true ]; then
    print_info "Checking expiry function..."
    
    # Check recent function logs
    FUNC_LOGS=$(firebase functions:log --only scheduledCampaignExpiryCheck --limit 5 2>/dev/null || echo "")
    
    if [ -n "$FUNC_LOGS" ]; then
        # Check if function ran in last 25 hours
        LAST_RUN=$(echo "$FUNC_LOGS" | grep "expiry_check" | head -1 || echo "")
        
        if [ -n "$LAST_RUN" ]; then
            print_success "Expiry function is running"
        else
            print_warning "No recent expiry function execution found"
        fi
    else
        print_warning "Could not fetch function logs"
    fi
else
    print_warning "Firebase CLI not available"
fi

echo ""

# 7. Quick Actions
print_header "🔧 QUICK ACTIONS"

echo "View real-time logs:"
echo "  $ vercel logs --follow"
echo ""
echo "View payment logs:"
echo "  $ vercel logs --filter=payment --limit=50"
echo ""
echo "View error logs:"
echo "  $ vercel logs --filter=error --limit=50"
echo ""
echo "Analyze payment logs:"
echo "  $ ./scripts/analyze-payment-logs.sh"
echo ""
echo "Check system health:"
echo "  $ ./scripts/check-system-health.sh"
echo ""
echo "View Firebase function logs:"
echo "  $ firebase functions:log --only scheduledCampaignExpiryCheck"
echo ""

# 8. Summary
print_header "📋 SUMMARY"

echo "Dashboard generated at: $(date)"
echo ""
print_info "For detailed monitoring guide, see: MONITORING-GUIDE.md"
print_info "For alert configuration, see: monitoring-alerts.json"
echo ""

# Refresh option
if [ "$1" != "--once" ]; then
    echo ""
    print_info "Run with --once flag to disable auto-refresh"
    echo ""
    read -t 30 -p "Press Enter to refresh (or wait 30s)..." || true
    exec "$0" "$@"
fi
