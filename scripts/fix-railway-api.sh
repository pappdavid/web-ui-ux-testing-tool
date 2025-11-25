#!/bin/bash

# Fix Railway environment variables via API
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
PROJECT_ID="60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
SERVICE_ID="d1581db2-d7f8-45d8-9c3a-3fc08caafac1"
APP_URL="https://web-ui-ux-testing-tool-production.up.railway.app"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

echo "🔧 Fixing Railway Environment Variables via API"
echo "================================================"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Service ID: $SERVICE_ID"
echo "App URL: $APP_URL"
echo ""

# Set variables via API
echo "📋 Setting environment variables..."

# NEXTAUTH_SECRET
echo "Setting NEXTAUTH_SECRET..."
MUTATION='{"query": "mutation { variableUpsert(input: { projectId: \"'$PROJECT_ID'\", serviceId: \"'$SERVICE_ID'\", name: \"NEXTAUTH_SECRET\", value: \"T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=\" }) { id } }"}'
curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$MUTATION" | python3 -m json.tool 2>/dev/null || echo "Response received"

# NEXTAUTH_URL
echo "Setting NEXTAUTH_URL..."
MUTATION='{"query": "mutation { variableUpsert(input: { projectId: \"'$PROJECT_ID'\", serviceId: \"'$SERVICE_ID'\", name: \"NEXTAUTH_URL\", value: \"'$APP_URL'\" }) { id } }"}'
curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$MUTATION" | python3 -m json.tool 2>/dev/null || echo "Response received"

# STORAGE_PATH
echo "Setting STORAGE_PATH..."
MUTATION='{"query": "mutation { variableUpsert(input: { projectId: \"'$PROJECT_ID'\", serviceId: \"'$SERVICE_ID'\", name: \"STORAGE_PATH\", value: \"/app/storage\" }) { id } }"}'
curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$MUTATION" | python3 -m json.tool 2>/dev/null || echo "Response received"

# NODE_ENV
echo "Setting NODE_ENV..."
MUTATION='{"query": "mutation { variableUpsert(input: { projectId: \"'$PROJECT_ID'\", serviceId: \"'$SERVICE_ID'\", name: \"NODE_ENV\", value: \"production\" }) { id } }"}'
curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$MUTATION" | python3 -m json.tool 2>/dev/null || echo "Response received"

echo ""
echo "✅ Environment variables set via API"
echo ""
echo "⚠️  Note: Railway CLI is required for migrations and seeding"
echo "   Run these commands after 'railway login':"
echo ""
echo "   railway link $PROJECT_ID"
echo "   railway run npx prisma migrate deploy"
echo "   railway run npm run db:seed"
echo ""
echo "   Or set variables manually in Railway Dashboard:"
echo "   https://railway.app/project/$PROJECT_ID"
echo ""
echo "🔄 Railway will auto-redeploy after variables are set"
echo "   Wait a few minutes, then test again"

