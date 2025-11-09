#!/bin/bash

echo "🔧 Fixing TypeScript and Build Errors"
echo "====================================="
echo ""

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

# Clear TypeScript build info
echo "🗑️  Clearing TypeScript build info..."
rm -f tsconfig.tsbuildinfo
echo "✅ TypeScript cache cleared"
echo ""

# Reinstall dependencies (optional, uncomment if needed)
# echo "📦 Reinstalling dependencies..."
# npm install
# echo "✅ Dependencies reinstalled"
# echo ""

# Run type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ No type errors found!"
else
    echo "⚠️  Type errors found. Review above."
fi

echo ""
echo "🎉 Done! Restart your IDE/editor to clear phantom errors."
echo ""
echo "VS Code users: Press Cmd+Shift+P and run 'TypeScript: Restart TS Server'"
echo ""
