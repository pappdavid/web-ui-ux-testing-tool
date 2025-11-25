#!/bin/bash

# Complete fix and test script
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
APP_URL="https://web-ui-ux-testing-tool-production.up.railway.app"

echo "🔧 Complete Fix and Test"
echo "======================="
echo ""

# Step 1: Set environment variables
echo "Step 1: Setting environment variables..."
export RAILWAY_TOKEN="$RAILWAY_TOKEN"
bash scripts/fix-railway-api.sh

echo ""
echo "⏳ Waiting 30 seconds for Railway to redeploy..."
sleep 30

# Step 2: Check if Railway CLI is available for migrations
if command -v railway &> /dev/null; then
    if railway whoami &>/dev/null; then
        echo ""
        echo "Step 2: Running migrations..."
        railway link 60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3 2>/dev/null || true
        railway run npx prisma migrate deploy || echo "⚠️  Migrations failed - may need manual run"
        
        echo ""
        echo "Step 3: Seeding database..."
        railway run npm run db:seed || echo "⚠️  Seeding failed - may need manual run"
    else
        echo ""
        echo "⚠️  Railway CLI not authenticated"
        echo "   Run migrations manually:"
        echo "   railway login"
        echo "   railway link 60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
        echo "   railway run npx prisma migrate deploy"
        echo "   railway run npm run db:seed"
    fi
else
    echo ""
    echo "⚠️  Railway CLI not installed"
    echo "   Install: npm install -g @railway/cli"
    echo "   Then run migrations manually"
fi

echo ""
echo "⏳ Waiting 60 seconds for full deployment..."
sleep 60

# Step 3: Test
echo ""
echo "Step 4: Testing deployed application..."
echo ""

export TEST_URL="$APP_URL"
npm run test:deployed

echo ""
echo "✅ Fix and test complete!"

