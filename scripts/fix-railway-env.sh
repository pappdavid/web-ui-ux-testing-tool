#!/bin/bash

# Fix Railway environment variables
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
PROJECT_ID="60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
APP_URL="https://web-ui-ux-testing-tool-production.up.railway.app"

export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "🔧 Fixing Railway Environment Variables"
echo "======================================="
echo ""
echo "Project ID: $PROJECT_ID"
echo "App URL: $APP_URL"
echo ""

if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "   Install: npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "⚠️  Not logged in. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI authenticated"
echo ""

# Link to project
echo "📋 Linking to project..."
railway link "$PROJECT_ID" 2>/dev/null || echo "Already linked"
echo ""

# Set environment variables
echo "🔐 Setting environment variables..."
echo ""

railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
echo "✅ NEXTAUTH_SECRET set"

railway variables set NEXTAUTH_URL="$APP_URL"
echo "✅ NEXTAUTH_URL set to $APP_URL"

railway variables set STORAGE_PATH="/app/storage"
echo "✅ STORAGE_PATH set"

railway variables set NODE_ENV="production"
echo "✅ NODE_ENV set"
echo ""

# Check DATABASE_URL
echo "📊 Checking DATABASE_URL..."
DB_URL=$(railway variables | grep DATABASE_URL || echo "")
if [ -z "$DB_URL" ]; then
    echo "⚠️  DATABASE_URL not found!"
    echo "   Adding PostgreSQL service..."
    railway add postgresql
    echo "   ✅ PostgreSQL added"
else
    echo "✅ DATABASE_URL is set"
fi
echo ""

# Run migrations
echo "📊 Running database migrations..."
railway run npx prisma migrate deploy
echo "✅ Migrations complete"
echo ""

# Seed database
echo "🌱 Seeding database..."
railway run npm run db:seed
echo "✅ Database seeded"
echo ""

echo "✅ All environment variables set!"
echo ""
echo "🔄 Railway will auto-redeploy with new variables"
echo "   Check status: railway status"
echo "   View logs: railway logs"
echo ""
echo "🧪 Test after deployment:"
echo "   TEST_URL=$APP_URL npm run test:deployed"

