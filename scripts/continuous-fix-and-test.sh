#!/bin/bash

# Continuous fix and test loop - keeps trying until tests pass
set -e

APP_URL="https://web-ui-ux-testing-tool-production.up.railway.app"
PROJECT_ID="60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
MAX_ATTEMPTS=10
ATTEMPT=1

echo "🔄 Continuous Fix and Test Loop"
echo "==============================="
echo "App URL: $APP_URL"
echo "Max attempts: $MAX_ATTEMPTS"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Attempt $ATTEMPT of $MAX_ATTEMPTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Step 1: Quick health check
    echo "📊 Step 1: Health Check..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")
    echo "   HTTP Status: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "000" ]; then
        echo "   ⚠️  App not responding - may be deploying"
        echo "   ⏳ Waiting 30 seconds..."
        sleep 30
        continue
    fi
    
    # Step 2: Run tests
    echo ""
    echo "🧪 Step 2: Running Browser Tests..."
    export TEST_URL="$APP_URL"
    
    npm run test:deployed 2>&1 | tee /tmp/test-output.log
    TEST_RESULT=${PIPESTATUS[0]}
    
    # Check if tests passed by looking at output
    if grep -q "All tests passed\|Total:.*Passed:.*Failed: 0" /tmp/test-output.log; then
        echo ""
        echo "✅ ALL TESTS PASSED!"
        echo ""
        echo "🎉 Deployment is working correctly!"
        exit 0
    else
        echo ""
        echo "❌ Tests failed (exit code: $TEST_RESULT)"
        
        # Analyze failures
        echo ""
        echo "📋 Analyzing failures..."
        
        if grep -q "Server configuration" /tmp/test-output.log; then
            echo "   ⚠️  Issue: NextAuth configuration error"
            echo "   🔧 Fix: Set NEXTAUTH_SECRET and NEXTAUTH_URL in Railway"
        fi
        
        if grep -q "Internal server error" /tmp/test-output.log; then
            echo "   ⚠️  Issue: Internal server error"
            echo "   🔧 Fix: Check DATABASE_URL and run migrations"
        fi
        
        if grep -q "500" /tmp/test-output.log; then
            echo "   ⚠️  Issue: Server errors (500)"
            echo "   🔧 Fix: Check environment variables and database"
        fi
        
        if grep -q "404" /tmp/test-output.log; then
            echo "   ⚠️  Issue: Not found (404)"
            echo "   🔧 Fix: App may still be deploying"
        fi
        
        # Try to get more info
        echo ""
        echo "🔍 Step 3: Detailed Diagnosis..."
        TEST_URL="$APP_URL" npx tsx scripts/diagnose-deployed-app.ts 2>&1 | tail -20
        
        echo ""
        echo "⏳ Waiting 60 seconds before next attempt..."
        echo "   (This gives Railway time to redeploy if variables were set)"
        sleep 60
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "⚠️  Reached maximum attempts ($MAX_ATTEMPTS)"
echo "   Tests are still failing"
echo ""
echo "📋 Manual steps required:"
echo "   1. Set environment variables in Railway Dashboard"
echo "   2. Run migrations: railway run npx prisma migrate deploy"
echo "   3. Seed database: railway run npm run db:seed"
echo ""
echo "Dashboard: https://railway.app/project/$PROJECT_ID"
exit 1

