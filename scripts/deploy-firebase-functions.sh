#!/bin/bash

# ============================================
# Firebase Cloud Functions Deployment Script
# Phrames Campaign Expiry System
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

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed"
        print_info "Install with: npm i -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI is installed"
}

# Check if user is logged in to Firebase
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged in to Firebase"
        print_info "Login with: firebase login"
        exit 1
    fi
    print_success "Logged in to Firebase"
}

# Check if functions directory exists
check_functions_directory() {
    if [ ! -d "functions" ]; then
        print_warning "Functions directory not found"
        print_info "Initializing Firebase Functions..."
        
        # Initialize functions
        firebase init functions --project default
        
        if [ $? -eq 0 ]; then
            print_success "Firebase Functions initialized"
        else
            print_error "Failed to initialize Firebase Functions"
            exit 1
        fi
    else
        print_success "Functions directory exists"
    fi
}

# Copy function code
setup_function_code() {
    print_info "Setting up function code..."
    
    # Check if functions-setup directory exists
    if [ ! -d "functions-setup" ]; then
        print_error "functions-setup directory not found"
        exit 1
    fi
    
    # Copy index.ts
    if [ -f "functions-setup/index.ts" ]; then
        cp functions-setup/index.ts functions/src/index.ts
        print_success "Copied index.ts"
    else
        print_error "functions-setup/index.ts not found"
        exit 1
    fi
    
    # Copy package.json if it doesn't exist
    if [ ! -f "functions/package.json" ]; then
        if [ -f "functions-setup/package.json" ]; then
            cp functions-setup/package.json functions/package.json
            print_success "Copied package.json"
        fi
    fi
    
    # Copy tsconfig.json if it doesn't exist
    if [ ! -f "functions/tsconfig.json" ]; then
        if [ -f "functions-setup/tsconfig.json" ]; then
            cp functions-setup/tsconfig.json functions/tsconfig.json
            print_success "Copied tsconfig.json"
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing function dependencies..."
    
    cd functions
    
    if npm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Build functions
build_functions() {
    print_info "Building functions..."
    
    cd functions
    
    if npm run build; then
        print_success "Functions built successfully"
    else
        print_error "Build failed"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Deploy functions
deploy_functions() {
    print_info "Deploying functions to Firebase..."
    
    echo ""
    echo "This will deploy the following function:"
    echo "  - scheduledCampaignExpiryCheck (runs daily at 00:00 UTC)"
    echo ""
    
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    if firebase deploy --only functions:scheduledCampaignExpiryCheck; then
        print_success "Function deployed successfully!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    # List functions
    print_info "Deployed functions:"
    firebase functions:list
    
    echo ""
    print_info "Checking function logs..."
    firebase functions:log --only scheduledCampaignExpiryCheck --limit 5
}

# Test function
test_function() {
    echo ""
    read -p "Would you like to manually trigger the function for testing? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Triggering function manually..."
        print_warning "Note: This will process all expired campaigns immediately"
        
        # Use the test script
        if [ -f "tests/trigger-expiry-check.ts" ]; then
            npx ts-node tests/trigger-expiry-check.ts
        else
            print_warning "Test script not found. You can trigger the function from Firebase Console."
        fi
    fi
}

# Main deployment flow
main() {
    print_header "FIREBASE CLOUD FUNCTIONS DEPLOYMENT"
    
    # Pre-deployment checks
    print_info "Running pre-deployment checks..."
    check_firebase_cli
    check_firebase_login
    check_functions_directory
    
    # Setup
    print_header "SETTING UP FUNCTION CODE"
    setup_function_code
    install_dependencies
    build_functions
    
    # Deploy
    print_header "DEPLOYING TO FIREBASE"
    deploy_functions
    
    # Verify
    print_header "VERIFYING DEPLOYMENT"
    verify_deployment
    
    # Test
    test_function
    
    # Post-deployment instructions
    print_header "POST-DEPLOYMENT STEPS"
    
    echo "✓ Function deployed successfully!"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Verify function schedule:"
    echo "   - Go to Firebase Console → Functions"
    echo "   - Check scheduledCampaignExpiryCheck is listed"
    echo "   - Verify schedule: 0 0 * * * (daily at midnight UTC)"
    echo ""
    echo "2. Monitor function execution:"
    echo "   - View logs: firebase functions:log --only scheduledCampaignExpiryCheck"
    echo "   - Check Firestore expiryLogs collection for execution records"
    echo ""
    echo "3. Set up monitoring:"
    echo "   - Enable Cloud Functions monitoring in Firebase Console"
    echo "   - Set up alerts for function errors"
    echo "   - Monitor execution time and success rate"
    echo ""
    echo "4. Test the function:"
    echo "   - Wait for scheduled execution (midnight UTC)"
    echo "   - Or manually trigger using: npx ts-node tests/trigger-expiry-check.ts"
    echo "   - Verify expired campaigns are deactivated"
    echo ""
    
    print_success "Deployment complete!"
    print_info "See FIREBASE-FUNCTIONS-GUIDE.md for detailed documentation"
}

# Run main function
main
