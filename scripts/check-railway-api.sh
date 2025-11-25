#!/bin/bash

# Check Railway deployment status via API
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

echo "🚂 Railway Deployment Status (via API)"
echo "======================================="
echo ""
echo "Token: ${RAILWAY_TOKEN:0:20}..."
echo ""

# Query projects
echo "📋 Fetching projects..."
PROJECTS_QUERY='{"query": "{ projects { edges { node { id name createdAt } } } }"}'

RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$PROJECTS_QUERY")

echo "Response: $RESPONSE" | head -5
echo ""

# Try to get deployments
echo "📊 Checking deployments..."
DEPLOYMENTS_QUERY='{"query": "{ deployments { edges { node { id status createdAt } } } }"}'

DEPLOY_RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$DEPLOYMENTS_QUERY")

echo "Deployments: $DEPLOY_RESPONSE" | head -5
echo ""

echo "💡 Note: Railway CLI requires interactive login for full access"
echo "   Check deployment status at: https://railway.app"
echo ""
echo "   Or run: railway login (then railway status)"

