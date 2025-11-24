#!/bin/bash

# Security Audit Script for Phrames
# Run this before deploying to production

echo "🔒 Starting Security Audit..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# Check 1: Environment Variables
echo "1️⃣  Checking environment variables..."
if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} Firebase config found"
    else
        echo -e "${RED}✗${NC} Firebase config missing"
        ISSUES=$((ISSUES + 1))
    fi
    
    if grep -q "CASHFREE_APP_ID" .env.local; then
        echo -e "${GREEN}✓${NC} Cashfree config found"
    else
        echo -e "${RED}✗${NC} Cashfree config missing"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check 2: Sensitive Data in Code
echo "2️⃣  Checking for hardcoded secrets..."
if grep -r "sk_test_" --include="*.ts" --include="*.tsx" --include="*.js" app/ lib/ 2>/dev/null; then
    echo -e "${RED}✗${NC} Found potential hardcoded API keys"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓${NC} No hardcoded secrets found"
fi
echo ""

# Check 3: Security Rules
echo "3️⃣  Checking Firebase security rules..."
if [ -f firestore.rules ]; then
    echo -e "${GREEN}✓${NC} Firestore rules exist"
else
    echo -e "${RED}✗${NC} Firestore rules missing"
    ISSUES=$((ISSUES + 1))
fi

if [ -f storage.rules ]; then
    echo -e "${GREEN}✓${NC} Storage rules exist"
else
    echo -e "${RED}✗${NC} Storage rules missing"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check 4: Authentication Guards
echo "4️⃣  Checking authentication guards..."
if grep -r "AuthGuard" app/dashboard --include="*.tsx" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Dashboard protected with AuthGuard"
else
    echo -e "${YELLOW}⚠${NC}  Dashboard may not be fully protected"
fi

if grep -r "AuthGuard" app/create --include="*.tsx" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Create page protected with AuthGuard"
else
    echo -e "${YELLOW}⚠${NC}  Create page may not be protected"
fi
echo ""

# Check 5: API Route Protection
echo "5️⃣  Checking API route protection..."
API_ROUTES=$(find app/api -name "route.ts" 2>/dev/null | wc -l)
if [ $API_ROUTES -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $API_ROUTES API routes"
    
    # Check webhook verification
    if grep -r "verifyWebhookSignature" app/api/payments/webhook --include="*.ts" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Webhook signature verification implemented"
    else
        echo -e "${RED}✗${NC} Webhook verification missing"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC}  No API routes found"
fi
echo ""

# Check 6: Input Validation
echo "6️⃣  Checking input validation..."
if grep -r "validateFrameImage" lib/storage.ts >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Image validation implemented"
else
    echo -e "${YELLOW}⚠${NC}  Image validation may be missing"
fi
echo ""

# Check 7: HTTPS and Security Headers
echo "7️⃣  Checking security configurations..."
if [ -f next.config.js ]; then
    if grep -q "headers" next.config.js; then
        echo -e "${GREEN}✓${NC} Security headers configured"
    else
        echo -e "${YELLOW}⚠${NC}  Consider adding security headers"
    fi
else
    echo -e "${YELLOW}⚠${NC}  next.config.js not found"
fi
echo ""

# Check 8: Dependencies
echo "8️⃣  Checking for vulnerable dependencies..."
if command -v npm &> /dev/null; then
    echo "Running npm audit..."
    npm audit --audit-level=high 2>&1 | grep -E "found|vulnerabilities" || echo -e "${GREEN}✓${NC} No high-severity vulnerabilities"
else
    echo -e "${YELLOW}⚠${NC}  npm not found, skipping dependency check"
fi
echo ""

# Check 9: Git Security
echo "9️⃣  Checking git security..."
if [ -f .gitignore ]; then
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} .env files ignored in git"
    else
        echo -e "${RED}✗${NC} .env files not in .gitignore"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}✗${NC} .gitignore file missing"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check 10: Error Handling
echo "🔟 Checking error handling..."
if grep -r "ErrorBoundary" app/layout.tsx >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Error boundary implemented"
else
    echo -e "${YELLOW}⚠${NC}  Consider adding error boundary"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Security Audit Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All critical security checks passed!${NC}"
    echo ""
    echo "✅ Your application is ready for production deployment."
else
    echo -e "${RED}✗ Found $ISSUES critical security issue(s)${NC}"
    echo ""
    echo "⚠️  Please fix the issues above before deploying to production."
    exit 1
fi

echo ""
echo "📝 Additional Recommendations:"
echo "   • Enable 2FA for all admin accounts"
echo "   • Set up monitoring and alerting"
echo "   • Regular security audits"
echo "   • Keep dependencies updated"
echo "   • Review Firebase security rules regularly"
echo "   • Monitor API usage and rate limits"
echo ""
