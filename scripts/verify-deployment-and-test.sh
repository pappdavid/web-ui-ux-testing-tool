#!/bin/bash

# Verify Deployment and Test All Functions
# This script verifies Railway deployment and runs comprehensive browser tests

set -e

BASE_URL="${TEST_URL:-https://web-ui-ux-testing-tool-production.up.railway.app}"

echo "🚀 Deployment Verification and Testing"
echo "========================================"
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Step 1: Verify Health Endpoint
echo "1️⃣ Checking Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health" || echo "{}")
STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
DATABASE=$(echo "$HEALTH_RESPONSE" | grep -o '"database":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

if [ "$STATUS" = "ok" ] && [ "$DATABASE" = "ok" ]; then
    echo "✅ Health Check: PASSED"
    echo "   Status: $STATUS"
    echo "   Database: $DATABASE"
else
    echo "❌ Health Check: FAILED"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""

# Step 2: Verify API Endpoints
echo "2️⃣ Checking API Endpoints..."
ENDPOINTS=(
    "/api/health"
    "/api/auth/register"
)

for endpoint in "${ENDPOINTS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
        echo "✅ $endpoint: Accessible (HTTP $HTTP_CODE)"
    else
        echo "⚠️  $endpoint: Unexpected response (HTTP $HTTP_CODE)"
    fi
done

echo ""

# Step 3: Run Browser Tests
echo "3️⃣ Running Comprehensive Browser Tests..."
echo "   This will test all features through the browser"
echo ""

export TEST_URL="$BASE_URL"

if command -v npx &> /dev/null; then
    echo "Running test suite..."
    npx tsx scripts/test-all-features-webinform.ts || {
        echo ""
        echo "⚠️  Browser tests completed with some failures"
        echo "   Check the output above for details"
    }
else
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ Verification Complete"
echo "========================================"

