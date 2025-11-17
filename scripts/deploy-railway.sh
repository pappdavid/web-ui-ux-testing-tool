#!/bin/bash

# Railway Deployment Script
# This script helps deploy the UI/UX Testing Tool to Railway

set -e

echo "🚂 Railway Deployment Script"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "   Install with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Not logged in to Railway"
    echo "   Logging in..."
    railway login
else
    echo "✅ Already logged in to Railway"
    USER=$(railway whoami 2>/dev/null | head -1 || echo "unknown")
    echo "   User: $USER"
fi

echo ""
echo "Step 1: Initialize Railway Project"
echo "-----------------------------------"
echo ""

# Check if already linked
if [ -f ".railway/project.json" ]; then
    echo "✅ Project already linked to Railway"
    read -p "Do you want to create a new project? (y/n): " new_project
    if [ "$new_project" = "y" ]; then
        railway init
    fi
else
    echo "📦 Initializing Railway project..."
    railway init
fi

echo ""
echo "Step 2: Add PostgreSQL Database"
echo "-------------------------------"
echo ""

read -p "Do you want to add a PostgreSQL database? (y/n): " add_db
if [ "$add_db" = "y" ]; then
    echo "Adding PostgreSQL database..."
    railway add postgresql
    echo "✅ PostgreSQL database added"
    echo ""
    echo "📋 Database connection string will be automatically set as DATABASE_URL"
fi

echo ""
echo "Step 3: Set Environment Variables"
echo "----------------------------------"
echo ""

# Generate NEXTAUTH_SECRET if not set
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "Generating NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated secret: $NEXTAUTH_SECRET"
else
    echo "Using existing NEXTAUTH_SECRET"
fi

# Get Railway URL
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")
if [ -z "$RAILWAY_URL" ]; then
    echo "Enter your Railway app URL (e.g., https://your-app.railway.app):"
    read RAILWAY_URL
else
    echo "Detected Railway URL: $RAILWAY_URL"
fi

echo ""
echo "Setting environment variables..."

railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXTAUTH_URL="$RAILWAY_URL"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

echo "✅ Environment variables set"
echo ""

echo "Step 4: Deploy to Railway"
echo "-------------------------"
echo ""

read -p "Ready to deploy? (y/n): " deploy_now
if [ "$deploy_now" = "y" ]; then
    echo "🚀 Deploying to Railway..."
    railway up
    echo ""
    echo "✅ Deployment started!"
    echo ""
    echo "Step 5: Run Database Migrations"
    echo "---------------------------------"
    echo ""
    read -p "Run database migrations now? (y/n): " run_migrations
    if [ "$run_migrations" = "y" ]; then
        echo "Running migrations..."
        railway run npx prisma migrate deploy
        echo "✅ Migrations completed"
        echo ""
        read -p "Seed the database? (y/n): " seed_db
        if [ "$seed_db" = "y" ]; then
            railway run npm run db:seed
            echo "✅ Database seeded"
        fi
    fi
else
    echo "⏸️  Skipping deployment"
    echo ""
    echo "To deploy later, run:"
    echo "  railway up"
fi

echo ""
echo "Step 6: Get Your App URL"
echo "------------------------"
echo ""

RAILWAY_URL=$(railway domain 2>/dev/null || railway status 2>/dev/null | grep -i "url" | head -1 || echo "")
if [ -n "$RAILWAY_URL" ]; then
    echo "🌐 Your app is available at: $RAILWAY_URL"
else
    echo "Run 'railway domain' to get your app URL"
fi

echo ""
echo "✅ Railway deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Visit your Railway dashboard: https://railway.app"
echo "2. Check deployment logs: railway logs"
echo "3. View your app: railway open"
echo "4. Monitor usage: railway dashboard"
echo ""

