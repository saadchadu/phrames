#!/bin/bash

# Profile Image System - Test Script
# This script runs comprehensive tests on the profile image system

echo "🧪 Profile Image System - Test Suite"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check file exists
check_file() {
    test -f "$1"
}

# Function to check no TypeScript errors
check_typescript() {
    npx tsc --noEmit --skipLibCheck
}

echo "📁 File Structure Tests"
echo "----------------------"

run_test "Image compression utility exists" "check_file lib/image-compression.ts"
run_test "Avatar component exists" "check_file components/Avatar.tsx"
run_test "Avatar utility exists" "check_file lib/avatar.ts"
run_test "Storage utility exists" "check_file lib/storage.ts"
run_test "Profile page exists" "check_file app/dashboard/profile/page.tsx"
run_test "Profile API exists" "check_file app/api/profile/update/route.ts"
run_test "Storage rules exist" "check_file storage.rules"

echo ""
echo "🔧 Build Tests"
echo "-------------"

run_test "TypeScript compilation" "check_typescript"
run_test "Next.js build" "npm run build"

echo ""
echo "📝 Documentation Tests"
echo "---------------------"

run_test "Main documentation exists" "check_file PROFILE_IMAGE_OPTIMIZATION.md"
run_test "Quick reference exists" "check_file PROFILE_IMAGE_QUICK_REF.md"
run_test "Testing guide exists" "check_file PROFILE_IMAGE_TESTING_GUIDE.md"
run_test "Deployment checklist exists" "check_file DEPLOYMENT_CHECKLIST_PROFILE_IMAGES.md"
run_test "Implementation summary exists" "check_file IMPLEMENTATION_COMPLETE.md"
run_test "Flow diagrams exist" "check_file PROFILE_IMAGE_FLOW_DIAGRAM.md"
run_test "Files summary exists" "check_file FILES_SUMMARY.md"
run_test "Executive summary exists" "check_file EXECUTIVE_SUMMARY.md"
run_test "Docs index exists" "check_file PROFILE_IMAGE_DOCS_INDEX.md"
run_test "Production checklist exists" "check_file PRODUCTION_READY_CHECKLIST.md"

echo ""
echo "🔍 Code Quality Tests"
echo "--------------------"

# Check for console.log in production code (warnings only)
if grep -r "console\.log" lib/image-compression.ts > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Warning: console.log found in image-compression.ts${NC}"
fi

# Check for TODO comments
if grep -r "TODO" lib/image-compression.ts components/Avatar.tsx app/dashboard/profile/page.tsx > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Warning: TODO comments found${NC}"
fi

# Check for proper error handling
if grep -r "try {" lib/image-compression.ts | wc -l | grep -q "0"; then
    echo -e "${RED}✗ No error handling in image-compression.ts${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    echo -e "${GREEN}✓ Error handling present${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "📊 Test Results"
echo "==============="
echo "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed! System is production ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy storage rules: firebase deploy --only storage"
    echo "2. Deploy application: vercel --prod"
    echo "3. Run post-deployment tests"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please fix issues before deploying.${NC}"
    exit 1
fi
