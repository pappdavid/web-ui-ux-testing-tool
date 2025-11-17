#!/bin/bash

# Railway Deployment Script Using API Token
# This script helps deploy using Railway API token

set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-609b0c57-a91e-47bd-9a13-1fdfd84797b7}"

echo "🚂 Railway Deployment with API Token"
echo "======================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "   Install with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""
echo "⚠️  Note: Railway CLI requires interactive login"
echo "   However, you can use the Railway dashboard for deployment"
echo ""
echo "Option 1: Use Railway Dashboard (Recommended)"
echo "---------------------------------------------"
echo "1. Go to https://railway.app"
echo "2. Login with your account"
echo "3. Click 'New Project'"
echo "4. Select 'Deploy from GitHub repo' (or 'Empty Project')"
echo "5. Railway will detect your Dockerfile automatically"
echo "6. Add PostgreSQL service"
echo "7. Set environment variables"
echo ""
echo "Option 2: Use Railway CLI (After Login)"
echo "----------------------------------------"
echo "Run these commands after 'railway login':"
echo ""
echo "# Initialize project"
echo "railway init"
echo ""
echo "# Add PostgreSQL"
echo "railway add postgresql"
echo ""
echo "# Set environment variables"
echo "SECRET=\$(openssl rand -base64 32)"
echo "railway variables set NEXTAUTH_SECRET=\"\$SECRET\""
echo "railway variables set STORAGE_PATH=\"/app/storage\""
echo "railway variables set NODE_ENV=\"production\""
echo ""
echo "# Deploy"
echo "railway up"
echo ""
echo "# Get URL and update NEXTAUTH_URL"
echo "URL=\$(railway domain)"
echo "railway variables set NEXTAUTH_URL=\"\$URL\""
echo ""
echo "# Run migrations"
echo "railway run npx prisma migrate deploy"
echo ""

# Try to use Railway API directly
echo "Option 3: Using Railway API (Advanced)"
echo "--------------------------------------"
echo "API Token: $RAILWAY_TOKEN"
echo ""
echo "You can use Railway's GraphQL API with this token"
echo "See: https://docs.railway.app/develop/api"
echo ""

echo "📋 Quick Start Commands (after railway login):"
echo "================================================"
echo ""
cat << 'EOF'
# 1. Initialize
railway init

# 2. Add PostgreSQL  
railway add postgresql

# 3. Set environment variables
SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_SECRET="$SECRET"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

# 4. Deploy
railway up

# 5. Get URL and update NEXTAUTH_URL
URL=$(railway domain)
railway variables set NEXTAUTH_URL="$URL"

# 6. Run migrations
railway run npx prisma migrate deploy

# 7. Optional: Seed database
railway run npm run db:seed
EOF

echo ""
echo "✅ Setup complete! Run 'railway login' to authenticate, then use the commands above."

