#!/bin/bash

# Comprehensive Test-Fix-Deploy Loop
# Uses browser automation and Railway CLI/API

set -e

APP_URL="${APP_URL:-https://web-ui-ux-testing-tool-production.up.railway.app}"
PROJECT_ID="${PROJECT_ID:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"
MAX_ITERATIONS="${MAX_ITERATIONS:-15}"
ITERATION=1

echo "🔄 Test-Fix-Deploy Loop"
echo "======================"
echo "App URL: $APP_URL"
echo "Project ID: $PROJECT_ID"
echo "Max Iterations: $MAX_ITERATIONS"
echo ""

# Function to test using browser automation
test_with_browser() {
    echo "🧪 Testing with browser automation..."
    echo ""
    
    TEST_URL="$APP_URL" npx tsx scripts/test-webapp-browser.ts 2>&1 | tee /tmp/browser-test.log
    return ${PIPESTATUS[0]}
}

# Function to test using API tests
test_with_api() {
    echo "🧪 Testing with API tests..."
    echo ""
    
    TEST_URL="$APP_URL" npm run test:deployed 2>&1 | tee /tmp/api-test.log
    return ${PIPESTATUS[0]}
}

# Function to check Railway CLI
check_railway_cli() {
    if command -v railway &> /dev/null; then
        if railway whoami &>/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Function to set variables via CLI
set_vars_cli() {
    if check_railway_cli; then
        echo "🔧 Setting variables via Railway CLI..."
        railway link "$PROJECT_ID" 2>/dev/null || true
        
        railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=" 2>&1 | grep -v "already exists" || true
        railway variables set NEXTAUTH_URL="$APP_URL" 2>&1 | grep -v "already exists" || true
        railway variables set STORAGE_PATH="/app/storage" 2>&1 | grep -v "already exists" || true
        railway variables set NODE_ENV="production" 2>&1 | grep -v "already exists" || true
        
        echo "✅ Variables set via CLI"
        return 0
    fi
    return 1
}

# Function to set variables via API
set_vars_api() {
    echo "🔧 Attempting to set variables via API..."
    bash scripts/set-railway-vars-api.sh 2>&1 | tee /tmp/set-vars.log
    return ${PIPESTATUS[0]}
}

# Function to run migrations
run_migrations() {
    if check_railway_cli; then
        echo "🗄️  Running migrations..."
        railway run npx prisma migrate deploy 2>&1 | tail -20 || true
        return 0
    else
        echo "⚠️  Cannot run migrations (CLI not authenticated)"
        return 1
    fi
}

# Function to seed database
seed_db() {
    if check_railway_cli; then
        echo "🌱 Seeding database..."
        railway run npm run db:seed 2>&1 | tail -20 || true
        return 0
    else
        echo "⚠️  Cannot seed database (CLI not authenticated)"
        return 1
    fi
}

# Function to trigger redeploy
trigger_redeploy() {
    if check_railway_cli; then
        echo "🚀 Triggering redeploy..."
        railway up 2>&1 | tail -10 || true
        return 0
    else
        echo "⚠️  Cannot trigger redeploy (CLI not authenticated)"
        echo "   Railway will auto-redeploy when variables are set"
        return 1
    fi
}

# Function to analyze failures
analyze_and_fix() {
    local test_log=$1
    
    echo ""
    echo "📋 Analyzing failures..."
    
    # Check for NextAuth errors
    if grep -qi "Server configuration\|NO_SECRET\|NEXTAUTH" "$test_log" 2>/dev/null; then
        echo "   ⚠️  Issue: NextAuth configuration error"
        echo "   🔧 Fixing: Setting NEXTAUTH_SECRET and NEXTAUTH_URL..."
        
        if ! set_vars_cli; then
            set_vars_api || true
        fi
        
        echo "   ⏳ Waiting 60 seconds for Railway to redeploy..."
        sleep 60
        return 1
    fi
    
    # Check for database errors
    if grep -qi "Internal server error\|500\|database\|prisma\|DATABASE\|migration" "$test_log" 2>/dev/null; then
        echo "   ⚠️  Issue: Database or server error"
        echo "   🔧 Fixing: Running migrations..."
        
        run_migrations
        seed_db
        
        echo "   ⏳ Waiting 30 seconds..."
        sleep 30
        return 1
    fi
    
    # Check for 404 or connection errors
    if grep -qi "404\|not found\|connection refused\|ECONNREFUSED" "$test_log" 2>/dev/null; then
        echo "   ⚠️  Issue: App not accessible or still deploying"
        echo "   ⏳ Waiting 90 seconds for deployment..."
        sleep 90
        return 1
    fi
    
    # Check for timeout errors
    if grep -qi "timeout\|Timeout" "$test_log" 2>/dev/null; then
        echo "   ⚠️  Issue: Timeout - app may be slow or not responding"
        echo "   ⏳ Waiting 60 seconds and retrying..."
        sleep 60
        return 1
    fi
    
    echo "   ⚠️  Unknown issue - applying all fixes..."
    set_vars_cli || set_vars_api || true
    run_migrations || true
    seed_db || true
    trigger_redeploy || true
    
    echo "   ⏳ Waiting 90 seconds..."
    sleep 90
    return 1
}

# Main loop
while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Iteration $ITERATION of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Test with browser automation
    if test_with_browser; then
        echo ""
        echo "✅ Browser tests passed! Testing API endpoints..."
        
        # Also test API endpoints
        if test_with_api; then
            echo ""
            echo "🎉 SUCCESS! All tests passed!"
            echo ""
            echo "✅ Application is working correctly at: $APP_URL"
            exit 0
        else
            echo ""
            echo "⚠️  Browser tests passed but API tests failed"
            analyze_and_fix /tmp/api-test.log
        fi
    else
        echo ""
        echo "❌ Browser tests failed"
        analyze_and_fix /tmp/browser-test.log
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
echo "💡 Manual steps if needed:"
echo "   1. Login: railway login"
echo "   2. Link: railway link $PROJECT_ID"
echo "   3. Set vars: railway variables set NEXTAUTH_SECRET=\"T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=\""
echo "   4. Set vars: railway variables set NEXTAUTH_URL=\"$APP_URL\""
echo "   5. Migrate: railway run npx prisma migrate deploy"
echo "   6. Seed: railway run npm run db:seed"
echo ""
exit 1

