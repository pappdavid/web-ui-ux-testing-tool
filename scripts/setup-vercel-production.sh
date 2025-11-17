#!/bin/bash

# Vercel Production Setup Script
# This script helps configure the app for Vercel deployment

set -e

echo "🚀 Vercel Production Setup"
echo "=========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "   Install with: npm install -g vercel"
    exit 1
fi

echo "Step 1: Environment Variables"
echo "-----------------------------"
echo ""

# Check if already linked
if [ ! -f ".vercel/project.json" ]; then
    echo "📦 Linking to Vercel project..."
    vercel link
fi

echo ""
echo "Required environment variables for production:"
echo "  - DATABASE_URL (PostgreSQL)"
echo "  - NEXTAUTH_SECRET (secure random string)"
echo "  - NEXTAUTH_URL (your Vercel domain)"
echo "  - STORAGE_PATH (optional, defaults to ./storage)"
echo "  - PLAYWRIGHT_BROWSERS_PATH (optional)"
echo ""

read -p "Do you want to set environment variables now? (y/n): " set_env

if [ "$set_env" = "y" ]; then
    echo ""
    echo "Setting DATABASE_URL..."
    vercel env add DATABASE_URL production
    
    echo ""
    echo "Setting NEXTAUTH_SECRET..."
    echo "Generate a secure secret with: openssl rand -base64 32"
    vercel env add NEXTAUTH_SECRET production
    
    echo ""
    echo "Setting NEXTAUTH_URL..."
    echo "This should be your Vercel production URL (e.g., https://your-app.vercel.app)"
    vercel env add NEXTAUTH_URL production
    
    echo ""
    echo "Setting STORAGE_PATH (optional)..."
    read -p "Set STORAGE_PATH? (y/n): " set_storage
    if [ "$set_storage" = "y" ]; then
        vercel env add STORAGE_PATH production
    fi
    
    echo ""
    echo "Setting PLAYWRIGHT_BROWSERS_PATH (optional)..."
    read -p "Set PLAYWRIGHT_BROWSERS_PATH? (y/n): " set_playwright
    if [ "$set_playwright" = "y" ]; then
        vercel env add PLAYWRIGHT_BROWSERS_PATH production
    fi
fi

echo ""
echo "Step 2: Pull Environment Variables"
echo "----------------------------------"
echo ""

echo "Pulling environment variables to .env.local..."
vercel env pull .env.local

echo ""
echo "Step 3: Database Setup"
echo "----------------------"
echo ""

echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Migration failed, trying db push..."
    npx prisma db push --accept-data-loss
fi

echo ""
echo "Step 4: Build Test"
echo "------------------"
echo ""

echo "Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - fix errors before deploying"
    exit 1
fi

echo ""
echo "✅ Vercel setup complete!"
echo ""
echo "Next steps:"
echo "1. Review environment variables: vercel env ls"
echo "2. Deploy to production: vercel --prod"
echo "3. Run database migrations after deployment if needed"
echo ""

