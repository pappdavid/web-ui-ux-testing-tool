#!/bin/bash

# Get Railway app URL
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
PROJECT_ID="${1:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "🌐 Getting Railway App URL"
echo "=========================="
echo ""

# Try Railway CLI first
if command -v railway &> /dev/null; then
    if railway whoami &>/dev/null; then
        echo "✅ Using Railway CLI"
        railway link "$PROJECT_ID" 2>/dev/null || true
        URL=$(railway domain 2>/dev/null || echo "")
        if [ -n "$URL" ]; then
            echo "✅ App URL: https://$URL"
            exit 0
        fi
    fi
fi

# Fallback to API
echo "📋 Querying Railway API..."
SERVICE_QUERY="{\"query\": \"{ project(id: \\\"$PROJECT_ID\\\") { services { edges { node { id name domains { edges { node { domain } } } } } } } }\"}"

RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$SERVICE_QUERY")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "💡 Check Railway Dashboard for URL:"
echo "   https://railway.app/project/$PROJECT_ID"

