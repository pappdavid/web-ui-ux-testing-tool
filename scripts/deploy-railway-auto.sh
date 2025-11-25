#!/bin/bash

# Automated Railway Deployment Script
# Run this AFTER: railway login

set -e

echo "🚂 Automated Railway Deployment"
echo "==============================="
echo ""

# Check if logged in
if ! railway whoami &>/dev/null; then
    echo "❌ Not logged in to Railway"
    echo ""
    echo "Please run first:"
    echo "  railway login"
    echo ""
    echo "This will open your browser to authenticate."
    exit 1
fi

echo "✅ Logged in to Railway"
railway whoami
echo ""

# Check if project is already initialized
if [ -f ".railway/project.toml" ] || [ -f "railway.toml" ]; then
    echo "✅ Project already linked"
    railway status
    echo ""
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "📋 Initializing Railway project..."
    echo ""
    echo "Choose an option:"
    echo "1. Create new project"
    echo "2. Link to existing project"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        railway init
    elif [ "$choice" = "2" ]; then
        echo "Enter project ID to link:"
        read project_id
        railway link "$project_id"
    else
        echo "Invalid choice. Exiting."
        exit 1
    fi
fi

echo ""
echo "📦 Adding PostgreSQL database..."
railway add postgresql

echo ""
echo "🔐 Setting environment variables..."

# Generate NEXTAUTH_SECRET if not provided
NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=}"

railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

echo ""
echo "🌐 Getting your app URL..."
APP_URL=$(railway domain 2>/dev/null || echo "")
if [ -z "$APP_URL" ]; then
    echo "⚠️  Could not get URL automatically"
    echo "   Please check Railway dashboard for your URL"
    echo "   Then run: railway variables set NEXTAUTH_URL=\"https://your-url.railway.app\""
else
    FULL_URL="https://$APP_URL"
    echo "✅ Your app URL: $FULL_URL"
    echo ""
    echo "🔧 Setting NEXTAUTH_URL..."
    railway variables set NEXTAUTH_URL="$FULL_URL"
fi

echo ""
echo "📊 Running database migrations..."
railway run npx prisma migrate deploy

echo ""
echo "🌱 Seeding database..."
railway run npm run db:seed

echo ""
echo "✅ Deployment complete!"
echo ""
if [ -n "$FULL_URL" ]; then
    echo "🌐 Your app is live at: $FULL_URL"
else
    echo "🌐 Check Railway dashboard for your app URL"
fi
echo ""
echo "📋 Next steps:"
echo "  - Visit your app URL"
echo "  - Register a new user or login with: test@example.com / password123"
echo "  - Create and run tests!"
echo ""
echo "View logs: railway logs"
echo "Open dashboard: railway open"

