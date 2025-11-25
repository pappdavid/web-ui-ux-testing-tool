#!/bin/bash

# Test deployed Railway application
set -e

RAILWAY_URL="${RAILWAY_URL:-}"
TEST_URL="${TEST_URL:-}"

echo "🧪 Testing Deployed Railway Application"
echo "======================================="
echo ""

# Try to get URL from Railway CLI
if [ -z "$RAILWAY_URL" ] && [ -z "$TEST_URL" ]; then
    if command -v railway &> /dev/null; then
        if railway whoami &>/dev/null 2>&1; then
            echo "📋 Getting URL from Railway..."
            RAILWAY_URL=$(railway domain 2>/dev/null || echo "")
            if [ -n "$RAILWAY_URL" ]; then
                echo "✅ Found URL: https://$RAILWAY_URL"
                export TEST_URL="https://$RAILWAY_URL"
            fi
        fi
    fi
fi

# Prompt for URL if not set
if [ -z "$TEST_URL" ] && [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  No URL found. Please provide your Railway app URL:"
    read -p "Enter Railway app URL (e.g., https://your-app.up.railway.app): " MANUAL_URL
    if [ -n "$MANUAL_URL" ]; then
        export TEST_URL="$MANUAL_URL"
    else
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
fi

if [ -z "$TEST_URL" ]; then
    export TEST_URL="https://$RAILWAY_URL"
fi

echo ""
echo "🌐 Testing: $TEST_URL"
echo ""

# Check if Playwright browsers are installed
if ! npx playwright --version &>/dev/null; then
    echo "📦 Installing Playwright browsers..."
    npm run test:install
fi

# Run tests
echo "🚀 Running tests..."
npm run test:deployed

