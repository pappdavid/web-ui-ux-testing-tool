#!/bin/bash

# Set Railway environment variables using API
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
PROJECT_ID="${PROJECT_ID:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"
APP_URL="${APP_URL:-https://web-ui-ux-testing-tool-production.up.railway.app}"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "🔧 Setting Railway Environment Variables via API"
echo "================================================="
echo "Project ID: $PROJECT_ID"
echo "App URL: $APP_URL"
echo ""

# First, get the service ID
echo "📋 Getting service ID..."
SERVICE_QUERY="{\"query\": \"{ project(id: \\\"$PROJECT_ID\\\") { services { edges { node { id name } } } } }\"}"

SERVICE_RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$SERVICE_QUERY")

SERVICE_ID=$(echo "$SERVICE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SERVICE_ID" ]; then
    echo "⚠️  Could not get service ID from API"
    echo "   Response: $SERVICE_RESPONSE"
    echo ""
    echo "💡 Try using Railway CLI instead:"
    echo "   railway login"
    echo "   railway link $PROJECT_ID"
    echo "   railway variables set NEXTAUTH_SECRET=\"T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=\""
    echo "   railway variables set NEXTAUTH_URL=\"$APP_URL\""
    echo "   railway variables set STORAGE_PATH=\"/app/storage\""
    echo "   railway variables set NODE_ENV=\"production\""
    exit 1
fi

echo "✅ Service ID: $SERVICE_ID"
echo ""

# Set variables using Railway API
set_variable() {
    local name=$1
    local value=$2
    
    echo "Setting $name..."
    
    # Railway API mutation to set variable
    MUTATION="{\"query\": \"mutation { variableUpsert(input: { projectId: \\\"$PROJECT_ID\\\", serviceId: \\\"$SERVICE_ID\\\", name: \\\"$name\\\", value: \\\"$value\\\" }) { id name value } }\"}"
    
    RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RAILWAY_TOKEN" \
      -d "$MUTATION")
    
    if echo "$RESPONSE" | grep -q "errors"; then
        echo "   ⚠️  Error: $RESPONSE"
        return 1
    else
        echo "   ✅ $name set"
        return 0
    fi
}

# Set all required variables
set_variable "NEXTAUTH_SECRET" "T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
set_variable "NEXTAUTH_URL" "$APP_URL"
set_variable "STORAGE_PATH" "/app/storage"
set_variable "NODE_ENV" "production"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "🔄 Railway will auto-redeploy with new variables"
echo "   Wait 2-3 minutes for deployment to complete"
echo ""

