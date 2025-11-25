#!/bin/bash

# Setup steps after Railway deployment
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
PROJECT_ID="${1:-60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3}"

export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "🚀 Post-Deployment Setup"
echo "======================="
echo ""

if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "   Install: npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "⚠️  Not logged in. Run: railway login"
    exit 1
fi

echo "✅ Railway CLI authenticated"
echo ""

# Link to project
echo "📋 Linking to project..."
railway link "$PROJECT_ID" 2>/dev/null || echo "Already linked or project not found"
echo ""

# Get URL
echo "🌐 Getting app URL..."
APP_URL=$(railway domain 2>/dev/null || echo "")
if [ -z "$APP_URL" ]; then
    echo "⚠️  Could not get URL automatically"
    echo "   Check Railway dashboard for your URL"
    echo "   Then set NEXTAUTH_URL manually:"
    echo "   railway variables set NEXTAUTH_URL=\"https://your-url.railway.app\""
    echo ""
    read -p "Enter your Railway app URL (or press Enter to skip): " MANUAL_URL
    if [ -n "$MANUAL_URL" ]; then
        APP_URL="$MANUAL_URL"
        railway variables set NEXTAUTH_URL="https://$APP_URL" 2>/dev/null || true
    fi
else
    echo "✅ App URL: https://$APP_URL"
    # Set NEXTAUTH_URL if not set
    railway variables set NEXTAUTH_URL="https://$APP_URL" 2>/dev/null || echo "NEXTAUTH_URL already set"
fi

echo ""
echo "📊 Running database migrations..."
railway run npx prisma migrate deploy

echo ""
echo "🌱 Seeding database..."
railway run npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
if [ -n "$APP_URL" ]; then
    echo "🌐 Your app is live at: https://$APP_URL"
    echo ""
    echo "📋 Test your deployment:"
    echo "   1. Visit: https://$APP_URL"
    echo "   2. Register a new user"
    echo "   3. Or login with: test@example.com / password123"
    echo "   4. Create and run a test!"
fi

echo ""
echo "💡 Useful commands:"
echo "   railway logs              # View logs"
echo "   railway status            # Check status"
echo "   railway open              # Open dashboard"

