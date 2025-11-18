#!/bin/bash

# ============================================
# Vercel Deployment Script
# Phrames Paid Campaign System
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
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

print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ${1}${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed"
        print_info "Install with: npm i -g vercel"
        exit 1
    fi
    print_success "Vercel CLI is installed"
}

# Check if .env.local exists
check_env_file() {
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found"
        print_info "Make sure you have configured environment variables in Vercel dashboard"
    else
        print_success ".env.local file exists"
    fi
}

# Check if required files exist
check_required_files() {
    local files=("package.json" "next.config.js" "tsconfig.json")
    for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    print_success "All required files present"
}

# Run build locally to catch errors
run_local_build() {
    print_info "Running local build to check for errors..."
    if npm run build; then
        print_success "Local build successful"
    else
        print_error "Local build failed. Fix errors before deploying."
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_info "Deploying to Vercel..."
    
    if [ "$1" == "--prod" ]; then
        print_warning "Deploying to PRODUCTION"
        vercel --prod
    else
        print_info "Deploying to PREVIEW"
        vercel
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Deployment successful!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Check environment variables in Vercel
check_vercel_env() {
    print_info "Checking Vercel environment variables..."
    
    local required_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "CASHFREE_CLIENT_ID"
        "CASHFREE_CLIENT_SECRET"
        "CASHFREE_ENV"
        "NEXT_PUBLIC_APP_URL"
    )
    
    print_info "Required environment variables:"
    for var in "${required_vars[@]}"; do
        echo "  - $var"
    done
    
    echo ""
    read -p "Have you added all environment variables in Vercel dashboard? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please add environment variables before deploying"
        print_info "See VERCEL-ENV-CHECKLIST.md for details"
        exit 1
    fi
}

# Main deployment flow
main() {
    print_header "VERCEL DEPLOYMENT - PHRAMES PAID CAMPAIGN SYSTEM"
    
    # Pre-deployment checks
    print_info "Running pre-deployment checks..."
    check_vercel_cli
    check_required_files
    check_env_file
    
    # Ask for deployment type
    echo ""
    echo "Select deployment type:"
    echo "  1) Preview deployment (for testing)"
    echo "  2) Production deployment"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            print_info "Preview deployment selected"
            DEPLOY_TYPE=""
            ;;
        2)
            print_warning "Production deployment selected"
            DEPLOY_TYPE="--prod"
            
            # Additional checks for production
            check_vercel_env
            
            echo ""
            read -p "Run local build before deploying? (recommended) (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_local_build
            fi
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Deploy
    echo ""
    deploy_to_vercel $DEPLOY_TYPE
    
    # Post-deployment instructions
    print_header "POST-DEPLOYMENT STEPS"
    
    echo "1. Configure Cashfree Webhook:"
    echo "   - Go to https://merchant.cashfree.com/"
    echo "   - Navigate to Developers → Webhooks"
    echo "   - Add webhook URL: https://your-domain.com/api/payments/webhook"
    echo ""
    
    echo "2. Test the deployment:"
    echo "   - Visit your site and test authentication"
    echo "   - Create a test campaign"
    echo "   - Test payment flow with sandbox credentials"
    echo ""
    
    echo "3. Monitor logs:"
    echo "   - Run: vercel logs --follow"
    echo "   - Or check Vercel dashboard"
    echo ""
    
    echo "4. Verify deployment:"
    echo "   - Run: ./scripts/verify-deployment.sh https://your-domain.com"
    echo ""
    
    print_success "Deployment complete!"
    print_info "See VERCEL-DEPLOYMENT-GUIDE.md for detailed instructions"
}

# Run main function
main
