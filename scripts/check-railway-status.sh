#!/bin/bash

# Check Railway deployment status
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"

echo "🚂 Railway Deployment Status Check"
echo "==================================="
echo ""

export RAILWAY_TOKEN="$RAILWAY_TOKEN"

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "   Install with: npm install -g @railway/cli"
    echo ""
    echo "📋 Using Railway API instead..."
    
    # Try using Railway API
    RAILWAY_API="https://backboard.railway.app/graphql/v2"
    
    echo "Checking projects..."
    curl -s -X POST "$RAILWAY_API" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $RAILWAY_TOKEN" \
      -d '{"query": "{ projects { edges { node { id name } } } }"}' | head -20
    
    exit 0
fi

echo "✅ Railway CLI found"
echo ""

# Check authentication
if railway whoami &>/dev/null; then
    echo "✅ Authenticated"
    railway whoami
    echo ""
else
    echo "⚠️  Not authenticated. Token may need account-level access."
    echo "   Run: railway login"
    echo ""
fi

# Check project status
if [ -f ".railway/project.toml" ] || [ -f "railway.toml" ]; then
    echo "📊 Project Status:"
    echo "------------------"
    railway status
    echo ""
    
    echo "📋 Recent Deployments:"
    echo "---------------------"
    railway logs --deploy 2>&1 | tail -30
    echo ""
    
    echo "🌐 Service URL:"
    echo "--------------"
    railway domain 2>&1 || echo "No domain configured"
    echo ""
else
    echo "⚠️  No Railway project linked in this directory"
    echo ""
    echo "To link a project:"
    echo "  railway link <project-id>"
    echo ""
    echo "Or initialize new project:"
    echo "  railway init"
fi

echo ""
echo "💡 To view full logs:"
echo "   railway logs"
echo ""
echo "💡 To open dashboard:"
echo "   railway open"

