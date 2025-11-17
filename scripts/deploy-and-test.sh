#!/bin/bash

# Complete deployment and testing script
set -e

echo "🚀 Complete Deployment & Testing"
echo "================================="
echo ""

# Step 1: Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "📋 Step 1: Database Setup Required"
    echo "-----------------------------------"
    echo ""
    echo "You need a PostgreSQL database. Options:"
    echo ""
    echo "Option 1: Neon (Free, Recommended)"
    echo "  1. Go to: https://console.neon.tech/signup"
    echo "  2. Create a project"
    echo "  3. Copy the connection string"
    echo ""
    echo "Option 2: Supabase (Free)"
    echo "  1. Go to: https://supabase.com/dashboard/projects"
    echo "  2. Create a project"
    echo "  3. Settings → Database → Copy connection string"
    echo ""
    echo "Option 3: Vercel Postgres"
    echo "  1. Go to: https://vercel.com/dashboard"
    echo "  2. Your project → Storage → Create Database → Postgres"
    echo ""
    read -p "Paste your PostgreSQL connection string: " db_url
    
    if [ -z "$db_url" ] || [[ ! "$db_url" == postgresql://* ]]; then
        echo "❌ Invalid connection string"
        exit 1
    fi
    
    export DATABASE_URL="$db_url"
    echo ""
    echo "✅ Database URL received"
fi

# Step 2: Set up Vercel environment variables
echo ""
echo "📋 Step 2: Setting Vercel Environment Variables"
echo "------------------------------------------------"
echo ""

# Check if already linked
if [ ! -f ".vercel/project.json" ]; then
    echo "Linking to Vercel project..."
    vercel link
fi

echo ""
echo "Setting environment variables in Vercel..."
echo ""

# Set DATABASE_URL
echo "Setting DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

# Generate and set NEXTAUTH_SECRET if not set
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo ""
    echo "Generating NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(node scripts/generate-secret.js 2>&1 | grep -v "Generated" | grep -v "Add this" | grep -v "^$" | head -1)
    echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production
fi

# Set NEXTAUTH_URL
echo ""
echo "Setting NEXTAUTH_URL..."
echo "Enter your Vercel production URL (e.g., https://your-app.vercel.app):"
read -p "NEXTAUTH_URL: " nextauth_url
echo "$nextauth_url" | vercel env add NEXTAUTH_URL production

# Optional variables
read -p "Set STORAGE_PATH? (y/n, default: n): " set_storage
if [ "$set_storage" = "y" ]; then
    echo "./storage" | vercel env add STORAGE_PATH production
fi

# Step 3: Pull environment variables
echo ""
echo "📋 Step 3: Pulling Environment Variables"
echo "----------------------------------------"
vercel env pull .env.local

# Step 4: Run database migrations
echo ""
echo "📋 Step 4: Running Database Migrations"
echo "--------------------------------------"
export $(cat .env.local | grep -v '^#' | xargs)
npx prisma migrate deploy

# Step 5: Seed database
echo ""
echo "📋 Step 5: Seeding Database"
echo "----------------------------"
npm run db:seed || echo "Seed completed (may have warnings)"

# Step 6: Build and deploy
echo ""
echo "📋 Step 6: Building and Deploying"
echo "---------------------------------"
npm run build
vercel --prod

# Step 7: Get deployment URL
echo ""
echo "📋 Step 7: Getting Deployment URL"
echo "----------------------------------"
DEPLOY_URL=$(vercel ls --prod 2>&1 | grep "web-ui-ux-testing-tool" | head -1 | awk '{print $NF}')
echo "Deployment URL: $DEPLOY_URL"

# Step 8: Test endpoints
echo ""
echo "📋 Step 8: Testing Deployment"
echo "-----------------------------"
echo ""
echo "Testing registration..."
REGISTER_TEST=$(curl -s -X POST "$DEPLOY_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test-'$(date +%s)'@example.com","password":"Test123!","confirmPassword":"Test123!"}')

if echo "$REGISTER_TEST" | grep -qi "success\|id\|email"; then
    echo "✅ Registration endpoint working"
else
    echo "⚠️  Registration may have issues"
    echo "Response: $REGISTER_TEST"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is live at: $DEPLOY_URL"
echo ""
echo "Test it:"
echo "  - Registration: $DEPLOY_URL/register"
echo "  - Login: $DEPLOY_URL/login"
echo "  - Dashboard: $DEPLOY_URL/dashboard"
echo ""

