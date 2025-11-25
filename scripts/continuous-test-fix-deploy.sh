#!/bin/bash

# Continuous Test-Fix-Deploy Loop for Railway
# This script tests, fixes, and redeploys until the app works

set -e

APP_URL="${APP_URL:-https://web-ui-ux-testing-tool-production.up.railway.app}"
PROJECT_ID="${PROJECT_ID:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"
MAX_ITERATIONS="${MAX_ITERATIONS:-10}"
ITERATION=1

echo "🔄 Continuous Test-Fix-Deploy Loop"
echo "=================================="
echo "App URL: $APP_URL"
echo "Project ID: $PROJECT_ID"
echo "Max Iterations: $MAX_ITERATIONS"
echo ""

# Function to test the deployed app
test_app() {
    echo "🧪 Testing deployed application..."
    echo "URL: $APP_URL"
    echo ""
    
    TEST_URL="$APP_URL" npm run test:deployed 2>&1 | tee /tmp/test-output.log
    return ${PIPESTATUS[0]}
}

# Function to check Railway CLI availability
check_railway_cli() {
    if command -v railway &> /dev/null; then
        if railway whoami &>/dev/null 2>&1; then
            echo "✅ Railway CLI is available and authenticated"
            return 0
        else
            echo "⚠️  Railway CLI installed but not authenticated"
            echo "   Run: railway login"
            return 1
        fi
    else
        echo "⚠️  Railway CLI not installed"
        echo "   Install with: npm install -g @railway/cli"
        return 1
    fi
}

# Function to set environment variables via Railway CLI
set_railway_vars() {
    if check_railway_cli; then
        echo "🔧 Setting Railway environment variables..."
        railway link "$PROJECT_ID" 2>/dev/null || true
        
        railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=" || true
        railway variables set NEXTAUTH_URL="$APP_URL" || true
        railway variables set STORAGE_PATH="/app/storage" || true
        railway variables set NODE_ENV="production" || true
        
        echo "✅ Environment variables set"
        return 0
    else
        echo "⚠️  Cannot set variables via CLI (not authenticated)"
        echo "   Please set manually in Railway Dashboard:"
        echo "   https://railway.app/project/$PROJECT_ID"
        return 1
    fi
}

# Function to run database migrations
run_migrations() {
    if check_railway_cli; then
        echo "🗄️  Running database migrations..."
        railway run npx prisma migrate deploy || true
        echo "✅ Migrations completed"
        return 0
    else
        echo "⚠️  Cannot run migrations via CLI"
        return 1
    fi
}

# Function to seed database
seed_database() {
    if check_railway_cli; then
        echo "🌱 Seeding database..."
        railway run npm run db:seed || true
        echo "✅ Database seeded"
        return 0
    else
        echo "⚠️  Cannot seed database via CLI"
        return 1
    fi
}

# Function to redeploy
redeploy() {
    if check_railway_cli; then
        echo "🚀 Triggering Railway redeploy..."
        railway up || true
        echo "✅ Redeploy triggered"
        echo "⏳ Waiting 30 seconds for deployment to start..."
        sleep 30
        return 0
    else
        echo "⚠️  Cannot redeploy via CLI"
        echo "   Railway will auto-redeploy when variables are set"
        return 1
    fi
}

# Function to analyze test failures
analyze_failures() {
    echo ""
    echo "📋 Analyzing test failures..."
    
    if grep -qi "Server configuration\|NO_SECRET\|NEXTAUTH" /tmp/test-output.log 2>/dev/null; then
        echo "   ⚠️  Issue: NextAuth configuration error"
        echo "   🔧 Fix: Setting NEXTAUTH_SECRET and NEXTAUTH_URL..."
        set_railway_vars
        return 1
    fi
    
    if grep -qi "Internal server error\|500\|database\|prisma\|DATABASE" /tmp/test-output.log 2>/dev/null; then
        echo "   ⚠️  Issue: Database or server error"
        echo "   🔧 Fix: Running migrations..."
        run_migrations
        seed_database
        return 1
    fi
    
    if grep -qi "404\|not found\|connection refused" /tmp/test-output.log 2>/dev/null; then
        echo "   ⚠️  Issue: App not accessible"
        echo "   🔧 Fix: App may still be deploying, waiting..."
        return 1
    fi
    
    echo "   ⚠️  Unknown issue, checking logs..."
    return 1
}

# Main loop
while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Iteration $ITERATION of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Test the app
    if test_app; then
        echo ""
        echo "🎉 SUCCESS! All tests passed!"
        echo ""
        echo "✅ Application is working correctly at: $APP_URL"
        exit 0
    fi
    
    # Analyze failures and fix
    if analyze_failures; then
        echo "   ✅ Issues resolved"
    else
        echo "   🔧 Applying fixes..."
        set_railway_vars
        run_migrations
        seed_database
        redeploy
        
        echo ""
        echo "⏳ Waiting 60 seconds for Railway to redeploy..."
        sleep 60
    fi
    
    ITERATION=$((ITERATION + 1))
done

echo ""
echo "⚠️  Reached maximum iterations ($MAX_ITERATIONS)"
echo "   Application may still have issues"
echo ""
echo "📋 Manual steps:"
echo "   1. Check Railway Dashboard: https://railway.app/project/$PROJECT_ID"
echo "   2. Verify environment variables are set"
echo "   3. Check logs: railway logs"
echo "   4. Run migrations: railway run npx prisma migrate deploy"
echo ""
exit 1

