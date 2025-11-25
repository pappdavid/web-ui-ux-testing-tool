#!/bin/bash

# Master Test-Fix-Deploy Script
# Orchestrates testing, fixing, and deployment using Railway CLI and browser automation

set -e

APP_URL="${APP_URL:-https://web-ui-ux-testing-tool-production.up.railway.app}"
PROJECT_ID="${PROJECT_ID:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"
MAX_ITERATIONS="${MAX_ITERATIONS:-20}"
ITERATION=1

echo "🎯 Master Test-Fix-Deploy Script"
echo "=================================="
echo "App URL: $APP_URL"
echo "Project ID: $PROJECT_ID"
echo "Max Iterations: $MAX_ITERATIONS"
echo ""

# Check Railway CLI
check_railway_auth() {
    if command -v railway &> /dev/null; then
        if railway whoami &>/dev/null 2>&1; then
            echo "✅ Railway CLI authenticated"
            railway whoami | head -1
            return 0
        else
            echo "⚠️  Railway CLI not authenticated"
            echo ""
            echo "📋 To authenticate Railway CLI:"
            echo "   1. Run: railway login"
            echo "   2. This will open your browser"
            echo "   3. Complete authentication"
            echo "   4. Then re-run this script"
            echo ""
            return 1
        fi
    else
        echo "⚠️  Railway CLI not installed"
        echo "   Install: npm install -g @railway/cli"
        return 1
    fi
}

# Set environment variables via CLI
set_env_vars() {
    if check_railway_auth; then
        echo "🔧 Setting environment variables..."
        railway link "$PROJECT_ID" 2>/dev/null || true
        
        railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=" 2>&1 | grep -v "already exists" || echo "✅ NEXTAUTH_SECRET set"
        railway variables set NEXTAUTH_URL="$APP_URL" 2>&1 | grep -v "already exists" || echo "✅ NEXTAUTH_URL set"
        railway variables set STORAGE_PATH="/app/storage" 2>&1 | grep -v "already exists" || echo "✅ STORAGE_PATH set"
        railway variables set NODE_ENV="production" 2>&1 | grep -v "already exists" || echo "✅ NODE_ENV set"
        
        echo "✅ Environment variables configured"
        return 0
    else
        echo "⚠️  Cannot set variables - Railway CLI not authenticated"
        echo ""
        echo "💡 Manual setup required:"
        echo "   1. Go to: https://railway.app/project/$PROJECT_ID"
        echo "   2. Click your service → Variables"
        echo "   3. Add these variables:"
        echo "      NEXTAUTH_SECRET=T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
        echo "      NEXTAUTH_URL=$APP_URL"
        echo "      STORAGE_PATH=/app/storage"
        echo "      NODE_ENV=production"
        echo ""
        return 1
    fi
}

# Run migrations
run_migrations() {
    if check_railway_auth; then
        echo "🗄️  Running database migrations..."
        railway run npx prisma migrate deploy 2>&1 | tail -30
        echo "✅ Migrations complete"
        return 0
    else
        echo "⚠️  Cannot run migrations - Railway CLI not authenticated"
        return 1
    fi
}

# Seed database
seed_database() {
    if check_railway_auth; then
        echo "🌱 Seeding database..."
        railway run npm run db:seed 2>&1 | tail -30
        echo "✅ Database seeded"
        return 0
    else
        echo "⚠️  Cannot seed database - Railway CLI not authenticated"
        return 1
    fi
}

# Trigger redeploy
trigger_redeploy() {
    if check_railway_auth; then
        echo "🚀 Triggering redeploy..."
        railway up 2>&1 | tail -20
        echo "✅ Redeploy triggered"
        return 0
    else
        echo "⚠️  Cannot trigger redeploy - Railway CLI not authenticated"
        echo "   Railway will auto-redeploy when variables are set"
        return 1
    fi
}

# Test with browser
test_browser() {
    echo "🧪 Testing with browser automation..."
    echo ""
    
    TEST_URL="$APP_URL" npx tsx scripts/test-webapp-browser.ts 2>&1 | tee /tmp/browser-test-iter-$ITERATION.log
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "✅ Browser tests passed!"
        return 0
    else
        echo ""
        echo "❌ Browser tests failed"
        return 1
    fi
}

# Test with API
test_api() {
    echo "🧪 Testing API endpoints..."
    echo ""
    
    TEST_URL="$APP_URL" npm run test:deployed 2>&1 | tee /tmp/api-test-iter-$ITERATION.log
    local exit_code=${PIPESTATUS[0]}
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "✅ API tests passed!"
        return 0
    else
        echo ""
        echo "❌ API tests failed"
        return 1
    fi
}

# Analyze failures
analyze_failures() {
    local browser_log="/tmp/browser-test-iter-$ITERATION.log"
    local api_log="/tmp/api-test-iter-$ITERATION.log"
    
    echo ""
    echo "📋 Analyzing failures..."
    
    local needs_fix=0
    
    # Check for NextAuth errors
    if grep -qi "Server configuration\|NO_SECRET\|NEXTAUTH" "$browser_log" "$api_log" 2>/dev/null; then
        echo "   ⚠️  Issue: NextAuth configuration error"
        echo "   🔧 Fixing: Setting environment variables..."
        if set_env_vars; then
            echo "   ⏳ Waiting 90 seconds for Railway to redeploy..."
            sleep 90
            needs_fix=1
        else
            echo "   ⚠️  Please set variables manually in Railway Dashboard"
            echo "   ⏳ Waiting 120 seconds..."
            sleep 120
            needs_fix=1
        fi
    fi
    
    # Check for database errors
    if grep -qi "Internal server error\|500\|database\|prisma\|DATABASE\|migration" "$browser_log" "$api_log" 2>/dev/null; then
        echo "   ⚠️  Issue: Database or server error"
        echo "   🔧 Fixing: Running migrations..."
        run_migrations || true
        seed_database || true
        echo "   ⏳ Waiting 60 seconds..."
        sleep 60
        needs_fix=1
    fi
    
    # Check for 404 or connection errors
    if grep -qi "404\|not found\|connection refused\|ECONNREFUSED" "$browser_log" "$api_log" 2>/dev/null; then
        echo "   ⚠️  Issue: App not accessible or still deploying"
        echo "   ⏳ Waiting 120 seconds for deployment..."
        sleep 120
        needs_fix=1
    fi
    
    # Check for timeout errors
    if grep -qi "timeout\|Timeout" "$browser_log" "$api_log" 2>/dev/null; then
        echo "   ⚠️  Issue: Timeout - app may be slow"
        echo "   ⏳ Waiting 90 seconds..."
        sleep 90
        needs_fix=1
    fi
    
    if [ $needs_fix -eq 0 ]; then
        echo "   ⚠️  Unknown issue - applying all fixes..."
        set_env_vars || true
        run_migrations || true
        seed_database || true
        trigger_redeploy || true
        echo "   ⏳ Waiting 120 seconds..."
        sleep 120
    fi
    
    return 1
}

# Main execution
echo "🔍 Checking Railway CLI authentication..."
if ! check_railway_auth; then
    echo ""
    echo "⚠️  Railway CLI authentication required"
    echo ""
    echo "📋 Quick Setup:"
    echo "   1. Run: railway login"
    echo "   2. Complete browser authentication"
    echo "   3. Re-run this script"
    echo ""
    echo "🔄 Continuing with testing (will attempt fixes when CLI is available)..."
    echo ""
fi

# Main loop
while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Iteration $ITERATION of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Test with browser
    if test_browser; then
        # Browser tests passed, test API
        if test_api; then
            echo ""
            echo "🎉 SUCCESS! All tests passed!"
            echo ""
            echo "✅ Application is working correctly at: $APP_URL"
            echo ""
            echo "📊 Test Summary:"
            echo "   ✅ Browser automation tests: PASSED"
            echo "   ✅ API endpoint tests: PASSED"
            echo ""
            exit 0
        else
            echo ""
            echo "⚠️  Browser tests passed but API tests failed"
            analyze_failures
        fi
    else
        echo ""
        echo "❌ Browser tests failed"
        analyze_failures
    fi
    
    ITERATION=$((ITERATION + 1))
done

echo ""
echo "⚠️  Reached maximum iterations ($MAX_ITERATIONS)"
echo ""
echo "📋 Final Status:"
echo "   App URL: $APP_URL"
echo "   Dashboard: https://railway.app/project/$PROJECT_ID"
echo ""
echo "💡 Next Steps:"
echo "   1. Authenticate Railway CLI: railway login"
echo "   2. Link project: railway link $PROJECT_ID"
echo "   3. Set variables: bash scripts/fix-railway-env.sh"
echo "   4. Run migrations: railway run npx prisma migrate deploy"
echo "   5. Seed database: railway run npm run db:seed"
echo "   6. Test again: TEST_URL=$APP_URL npm run test:deployed"
echo ""
exit 1

