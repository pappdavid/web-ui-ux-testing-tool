#!/bin/bash

# Get Railway URL and run browser tests
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
PROJECT_ID="60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

echo "🚀 Getting Railway URL and Running Browser Tests"
echo "================================================="
echo ""

# Try to get URL from Railway API
echo "📋 Fetching Railway project URL..."
SERVICE_QUERY="{\"query\": \"{ project(id: \\\"$PROJECT_ID\\\") { services { edges { node { id name domains { edges { node { domain } } } } } } } }\"}"

RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$SERVICE_QUERY")

# Extract URL from response
RAILWAY_URL=$(echo "$RESPONSE" | grep -o '"domain":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not get URL from API"
    echo ""
    echo "Please provide your Railway app URL:"
    echo "  1. Check Railway Dashboard: https://railway.app/project/$PROJECT_ID"
    echo "  2. Or enter URL manually"
    echo ""
    read -p "Enter Railway app URL (e.g., https://your-app.up.railway.app): " MANUAL_URL
    if [ -n "$MANUAL_URL" ]; then
        RAILWAY_URL="$MANUAL_URL"
    else
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
else
    RAILWAY_URL="https://$RAILWAY_URL"
    echo "✅ Found URL: $RAILWAY_URL"
fi

echo ""
echo "🧪 Running browser tests..."
echo ""

export TEST_URL="$RAILWAY_URL"
npm run test:deployed

