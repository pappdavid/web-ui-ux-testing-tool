#!/bin/bash

# Persistent test loop - keeps testing until all tests pass
set -e

APP_URL="https://web-ui-ux-testing-tool-production.up.railway.app"
ATTEMPT=1
MAX_ATTEMPTS=100  # Test for up to 100 minutes

echo "🔄 Persistent Test Loop - Testing Until Success"
echo "================================================"
echo "App URL: $APP_URL"
echo "Will test every 60 seconds until all tests pass"
echo "Press Ctrl+C to stop"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test Attempt #$ATTEMPT - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Quick health check
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")
    echo "📊 HTTP Status: $HTTP_CODE"
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo "   ⚠️  App not responding correctly - may be deploying"
        echo "   ⏳ Waiting 60 seconds..."
        sleep 60
        ATTEMPT=$((ATTEMPT + 1))
        continue
    fi
    
    # Run tests
    echo "🧪 Running browser tests..."
    export TEST_URL="$APP_URL"
    
    if npm run test:deployed 2>&1 | tee /tmp/test-output-$ATTEMPT.log | grep -q "All tests passed\|Total:.*Passed:.*Failed: 0"; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 SUCCESS! ALL TESTS PASSED!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "✅ Deployment is fully working!"
        echo "✅ All functionality tested and verified!"
        echo ""
        exit 0
    else
        echo ""
        echo "❌ Tests still failing"
        
        # Show summary
        if [ -f /tmp/test-output-$ATTEMPT.log ]; then
            echo ""
            echo "📋 Test Summary:"
            grep -A 5 "Test Summary" /tmp/test-output-$ATTEMPT.log | tail -10 || echo "   (Check full log)"
        fi
        
        echo ""
        echo "⏳ Waiting 60 seconds before next test..."
        echo "   (Set NEXTAUTH_SECRET in Railway Dashboard if not done yet)"
        echo "   Dashboard: https://railway.app/project/60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    sleep 60
done

echo ""
echo "⚠️  Reached maximum attempts ($MAX_ATTEMPTS)"
echo "   Tests are still failing"
echo ""
echo "📋 Required actions:"
echo "   1. Set NEXTAUTH_SECRET in Railway Dashboard"
echo "   2. Set NEXTAUTH_URL in Railway Dashboard"
echo "   3. Set STORAGE_PATH and NODE_ENV"
echo "   4. Run migrations: railway run npx prisma migrate deploy"
echo ""
exit 1

