#!/bin/bash

# Script to set up Vercel Postgres database and connect it
# This is the easiest option since it's integrated with Vercel

set -e

echo "🚀 Setting up Vercel Postgres Database"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "   Install it: npm install -g vercel"
    exit 1
fi

echo "📋 Option 1: Create Vercel Postgres via Dashboard (Recommended)"
echo "---------------------------------------------------------------"
echo ""
echo "1. Go to: https://vercel.com/davids-projects-3d9eb396/web-ui-ux-testing-tool/stores"
echo "2. Click 'Create Database' → 'Postgres'"
echo "3. Choose a region (e.g., US East)"
echo "4. Name it: web-ui-ux-testing-tool-db"
echo "5. Click 'Create'"
echo "6. DATABASE_URL will be automatically added to your project"
echo ""
echo "📋 Option 2: Use Neon (Free, Fast Setup)"
echo "----------------------------------------"
echo ""
echo "1. Go to: https://console.neon.tech/signup"
echo "2. Sign up (free, no credit card)"
echo "3. Create a new project"
echo "4. Copy the connection string"
echo "5. Run: vercel env rm DATABASE_URL production"
echo "6. Run: vercel env add DATABASE_URL production"
echo "7. Paste the connection string"
echo ""
echo "📋 Option 3: Use Supabase (Free)"
echo "---------------------------------"
echo ""
echo "1. Go to: https://supabase.com/dashboard/projects"
echo "2. Sign up and create a project"
echo "3. Go to Settings → Database"
echo "4. Copy the connection string (URI format)"
echo "5. Run: vercel env rm DATABASE_URL production"
echo "6. Run: vercel env add DATABASE_URL production"
echo "7. Paste the connection string"
echo ""

read -p "Have you created a database? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Great! Now let's connect it..."
    echo ""
    
    # Check if DATABASE_URL is already set
    if vercel env ls 2>&1 | grep -q "DATABASE_URL"; then
        echo "⚠️  DATABASE_URL already exists. Do you want to update it?"
        read -p "Update DATABASE_URL? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Removing old DATABASE_URL..."
            vercel env rm DATABASE_URL production --yes 2>&1 || true
        fi
    fi
    
    echo ""
    echo "📝 Adding DATABASE_URL to Vercel..."
    echo "   (You'll be prompted to paste your connection string)"
    echo ""
    vercel env add DATABASE_URL production
    
    echo ""
    echo "✅ DATABASE_URL added!"
    echo ""
    echo "Next steps:"
    echo "1. Pull environment variables: vercel env pull .env.local"
    echo "2. Run migrations: npx prisma migrate deploy"
    echo "3. Seed database (optional): npm run db:seed"
    echo "4. Redeploy: vercel --prod"
    echo ""
else
    echo ""
    echo "Please create a database first using one of the options above."
    echo "Then run this script again."
    exit 1
fi

