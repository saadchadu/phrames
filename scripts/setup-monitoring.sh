#!/bin/bash

# ============================================
# Monitoring and Alerting Setup Script
# Phrames Paid Campaign System
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ${1}${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

main() {
    print_header "MONITORING & ALERTING SETUP"
    
    print_info "This script will guide you through setting up monitoring for:"
    echo "  - Payment events logging"
    echo "  - Payment failure alerts"
    echo "  - Webhook processing monitoring"
    echo "  - Expiry function tracking"
    echo "  - API error rate monitoring"
    echo ""
    
    # Vercel Monitoring
    print_header "1. VERCEL MONITORING SETUP"
    
    print_info "Setting up Vercel monitoring..."
    echo ""
    echo "To enable monitoring in Vercel:"
    echo "  1. Go to https://vercel.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Navigate to Settings → Notifications"
    echo "  4. Enable the following alerts:"
    echo "     ✓ Deployment Failed"
    echo "     ✓ Function Errors"
    echo "     ✓ High Error Rate"
    echo "  5. Add your email for notifications"
    echo ""
    
    read -p "Press Enter when you've configured Vercel notifications..."
    print_success "Vercel monitoring configured"
    
    # Firebase Monitoring
    print_header "2. FIREBASE MONITORING SETUP"
    
    print_info "Setting up Firebase monitoring..."
    echo ""
    echo "To enable Firebase monitoring:"
    echo "  1. Go to https://console.firebase.google.com/"
    echo "  2. Select your project"
    echo "  3. Navigate to Functions → Logs"
    echo "  4. Set up log-based alerts:"
    echo "     - Go to Logs Explorer"
    echo "     - Create alert for function errors"
    echo "     - Set notification channel (email/SMS)"
    echo ""
    
    read -p "Press Enter when you've configured Firebase monitoring..."
    print_success "Firebase monitoring configured"
    
    # Cashfree Monitoring
    print_header "3. CASHFREE MONITORING SETUP"
    
    print_info "Setting up Cashfree monitoring..."
    echo ""
    echo "To monitor payments in Cashfree:"
    echo "  1. Go to https://merchant.cashfree.com/"
    echo "  2. Navigate to Dashboard"
    echo "  3. Enable email notifications for:"
    echo "     ✓ Payment failures"
    echo "     ✓ Webhook failures"
    echo "     ✓ Daily transaction summary"
    echo "  4. Set up webhook monitoring:"
    echo "     - Go to Developers → Webhooks"
    echo "     - Check webhook delivery status"
    echo "     - Enable retry notifications"
    echo ""
    
    read -p "Press Enter when you've configured Cashfree monitoring..."
    print_success "Cashfree monitoring configured"
    
    # Log Monitoring Commands
    print_header "4. LOG MONITORING COMMANDS"
    
    print_info "Useful commands for monitoring:"
    echo ""
    echo "View Vercel logs in real-time:"
    echo "  $ vercel logs --follow"
    echo ""
    echo "View logs for specific function:"
    echo "  $ vercel logs --follow --filter=api/payments"
    echo ""
    echo "View Firebase function logs:"
    echo "  $ firebase functions:log --only scheduledCampaignExpiryCheck"
    echo ""
    echo "Check recent errors:"
    echo "  $ vercel logs --filter=error --limit=50"
    echo ""
    
    # Create monitoring dashboard
    print_header "5. MONITORING DASHBOARD"
    
    print_info "Creating monitoring dashboard script..."
    
    cat > scripts/monitor-dashboard.sh << 'EOF'
#!/bin/bash

# Monitoring Dashboard for Phrames

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           PHRAMES MONITORING DASHBOARD                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check Vercel deployment status
echo "📊 VERCEL STATUS:"
vercel ls --limit=5
echo ""

# Check recent errors
echo "🚨 RECENT ERRORS (Last 10):"
vercel logs --filter=error --limit=10
echo ""

# Payment API health
echo "💳 PAYMENT API HEALTH:"
echo "Checking payment endpoints..."
curl -s -o /dev/null -w "Initiate endpoint: %{http_code}\n" https://your-domain.com/api/payments/initiate
curl -s -o /dev/null -w "Webhook endpoint: %{http_code}\n" https://your-domain.com/api/payments/webhook
echo ""

echo "✓ Dashboard check complete"
echo "For real-time monitoring, run: vercel logs --follow"
EOF
    
    chmod +x scripts/monitor-dashboard.sh
    print_success "Monitoring dashboard created: scripts/monitor-dashboard.sh"
    
    # Summary
    print_header "SETUP COMPLETE"
    
    print_success "Monitoring and alerting configured!"
    echo ""
    echo "Next steps:"
    echo "  1. Test alerts by triggering a test error"
    echo "  2. Monitor first few payments closely"
    echo "  3. Run monitoring dashboard: ./scripts/monitor-dashboard.sh"
    echo "  4. Set up daily monitoring routine"
    echo ""
    
    print_info "See MONITORING-GUIDE.md for detailed monitoring procedures"
}

main
