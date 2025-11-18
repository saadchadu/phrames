#!/bin/bash

# ============================================
# Payment Logs Analysis Script
# Analyzes payment events and generates report
# ============================================

set -e

# Colors
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

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "Error: Vercel CLI is required but not installed"
    echo "Install with: npm i -g vercel"
    exit 1
fi

# Get time range from arguments or use default (last 24 hours)
TIME_RANGE="${1:-24h}"

print_header "PAYMENT LOGS ANALYSIS - Last $TIME_RANGE"

# Create temp directory for logs
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

print_info "Fetching logs from Vercel..."

# Fetch payment-related logs
vercel logs --filter="payment" --since="$TIME_RANGE" --limit=1000 > "$TEMP_DIR/payment_logs.txt" 2>/dev/null || true

# Count different event types
print_header "PAYMENT EVENTS SUMMARY"

initiated=$(grep -c "payment_initiated" "$TEMP_DIR/payment_logs.txt" 2>/dev/null || echo "0")
success=$(grep -c "payment_success" "$TEMP_DIR/payment_logs.txt" 2>/dev/null || echo "0")
failed=$(grep -c "payment_failed" "$TEMP_DIR/payment_logs.txt" 2>/dev/null || echo "0")
webhook_received=$(grep -c "webhook_received" "$TEMP_DIR/payment_logs.txt" 2>/dev/null || echo "0")
webhook_processed=$(grep -c "webhook_processed" "$TEMP_DIR/payment_logs.txt" 2>/dev/null || echo "0")

echo "Payment Initiated:    $initiated"
echo "Payment Success:      $success"
echo "Payment Failed:       $failed"
echo "Webhooks Received:    $webhook_received"
echo "Webhooks Processed:   $webhook_processed"
echo ""

# Calculate success rate
if [ "$initiated" -gt 0 ]; then
    success_rate=$(awk "BEGIN {printf \"%.2f\", ($success / $initiated) * 100}")
    echo "Success Rate:         ${success_rate}%"
    
    if (( $(echo "$success_rate < 90" | bc -l) )); then
        print_warning "Success rate is below 90%"
    else
        print_success "Success rate is healthy"
    fi
else
    echo "Success Rate:         N/A (no payments initiated)"
fi

# Check for errors
print_header "ERROR ANALYSIS"

errors=$(grep -c "ERROR" "$TEMP_DIR/payment_logs.txt" 2>/dev/null || echo "0")
echo "Total Errors:         $errors"

if [ "$errors" -gt 0 ]; then
    print_warning "Found $errors errors in logs"
    echo ""
    echo "Recent errors:"
    grep "ERROR" "$TEMP_DIR/payment_logs.txt" | tail -5
else
    print_success "No errors found"
fi

# Check webhook processing times
print_header "WEBHOOK PERFORMANCE"

webhook_times=$(grep "webhook_processed" "$TEMP_DIR/payment_logs.txt" | grep -o "duration\":[0-9]*" | cut -d':' -f2 2>/dev/null || echo "")

if [ -n "$webhook_times" ]; then
    avg_time=$(echo "$webhook_times" | awk '{sum+=$1; count++} END {if(count>0) print sum/count; else print 0}')
    max_time=$(echo "$webhook_times" | sort -n | tail -1)
    
    echo "Average Processing Time: ${avg_time}ms"
    echo "Max Processing Time:     ${max_time}ms"
    
    if (( $(echo "$avg_time > 3000" | bc -l) )); then
        print_warning "Average webhook processing time is high (>3s)"
    else
        print_success "Webhook processing time is healthy"
    fi
else
    echo "No webhook processing data available"
fi

# Check for plan distribution
print_header "PLAN DISTRIBUTION"

week=$(grep "planType.*week" "$TEMP_DIR/payment_logs.txt" | wc -l)
month=$(grep "planType.*month" "$TEMP_DIR/payment_logs.txt" | grep -v "3month\|6month" | wc -l)
three_month=$(grep "planType.*3month" "$TEMP_DIR/payment_logs.txt" | wc -l)
six_month=$(grep "planType.*6month" "$TEMP_DIR/payment_logs.txt" | wc -l)
year=$(grep "planType.*year" "$TEMP_DIR/payment_logs.txt" | wc -l)

echo "1 Week:      $week"
echo "1 Month:     $month"
echo "3 Months:    $three_month"
echo "6 Months:    $six_month"
echo "1 Year:      $year"

# Generate recommendations
print_header "RECOMMENDATIONS"

if [ "$errors" -gt 10 ]; then
    print_warning "High error count detected. Review error logs for patterns."
fi

if [ "$initiated" -gt 0 ] && [ "$success" -eq 0 ]; then
    print_warning "No successful payments despite initiations. Check webhook configuration."
fi

if [ "$webhook_received" -gt "$webhook_processed" ]; then
    print_warning "Some webhooks received but not processed. Check webhook handler."
fi

if [ "$initiated" -eq 0 ]; then
    print_info "No payment activity in the selected time range."
fi

print_header "ANALYSIS COMPLETE"

echo "For detailed logs, run:"
echo "  vercel logs --filter=payment --since=$TIME_RANGE"
echo ""
echo "For error details, run:"
echo "  vercel logs --filter=error --filter=payment --since=$TIME_RANGE"
