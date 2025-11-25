#!/bin/bash

# Check specific Railway project status
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
RAILWAY_API="https://backboard.railway.app/graphql/v2"

PROJECT_ID="${1:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"  # abundant-laughter project

echo "🚂 Railway Project Status"
echo "=========================="
echo ""
echo "Project ID: $PROJECT_ID"
echo ""

# Get project details
PROJECT_QUERY="{\"query\": \"{ project(id: \\\"$PROJECT_ID\\\") { id name createdAt services { edges { node { id name createdAt } } } } }\"}"

echo "📋 Fetching project details..."
RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$PROJECT_QUERY")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Get deployments for the project
echo "📊 Checking deployments..."
DEPLOY_QUERY="{\"query\": \"{ deployments(projectId: \\\"$PROJECT_ID\\\") { edges { node { id status createdAt } } } }\"}"

DEPLOY_RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "$DEPLOY_QUERY")

echo "$DEPLOY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DEPLOY_RESPONSE"
echo ""

echo "💡 For detailed logs, check Railway Dashboard:"
echo "   https://railway.app/project/$PROJECT_ID"

