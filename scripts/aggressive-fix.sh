#!/bin/bash

# Aggressive fix attempt - tries multiple methods
set -e

PROJECT_ID="60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3"
APP_URL="https://web-ui-ux-testing-tool-production.up.railway.app"

echo "🔧 Aggressive Fix Attempt"
echo "========================"
echo ""

# Method 1: Try Railway CLI if available
if command -v railway &> /dev/null; then
    echo "📋 Method 1: Trying Railway CLI..."
    if railway whoami &>/dev/null; then
        echo "✅ Railway CLI authenticated"
        railway link "$PROJECT_ID" 2>/dev/null || true
        
        echo "Setting variables via CLI..."
        railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=" 2>/dev/null || echo "Failed to set NEXTAUTH_SECRET"
        railway variables set NEXTAUTH_URL="$APP_URL" 2>/dev/null || echo "Failed to set NEXTAUTH_URL"
        railway variables set STORAGE_PATH="/app/storage" 2>/dev/null || echo "Failed to set STORAGE_PATH"
        railway variables set NODE_ENV="production" 2>/dev/null || echo "Failed to set NODE_ENV"
        
        echo "Running migrations..."
        railway run npx prisma migrate deploy 2>/dev/null || echo "Migrations failed"
        
        echo "Seeding database..."
        railway run npm run db:seed 2>/dev/null || echo "Seeding failed"
        
        echo "✅ CLI method attempted"
    else
        echo "⚠️  Railway CLI not authenticated - run: railway login"
    fi
else
    echo "⚠️  Railway CLI not installed"
fi

echo ""
echo "📋 Method 2: Instructions for Manual Fix"
echo "========================================"
echo ""
echo "Since automated methods aren't available, please:"
echo ""
echo "1. Go to Railway Dashboard:"
echo "   https://railway.app/project/$PROJECT_ID"
echo ""
echo "2. Click your service → Variables tab"
echo ""
echo "3. Add these variables:"
echo "   NEXTAUTH_SECRET = T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
echo "   NEXTAUTH_URL = $APP_URL"
echo "   STORAGE_PATH = /app/storage"
echo "   NODE_ENV = production"
echo ""
echo "4. Wait 2-3 minutes for redeploy"
echo ""
echo "5. Run migrations: Deployments → Run Command → npx prisma migrate deploy"
echo ""
echo "6. Seed database: Run Command → npm run db:seed"
echo ""

