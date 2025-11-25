#!/bin/bash

# Railway Deployment via API
# Uses Railway GraphQL API to deploy from GitHub

set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-609b0c57-a91e-47bd-9a13-1fdfd84797b7}"
GITHUB_REPO="pappdavid/web-ui-ux-testing-tool"

echo "🚂 Railway Deployment via API"
echo "=============================="
echo ""

# Check if we can use Railway API
echo "📋 Deployment Options:"
echo ""
echo "Option 1: Railway Dashboard (Recommended - Easiest)"
echo "---------------------------------------------------"
echo "1. Go to https://railway.app"
echo "2. Click 'Login' or 'Start a New Project'"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select: $GITHUB_REPO"
echo "5. Railway will auto-detect Dockerfile"
echo "6. Add PostgreSQL service (click '+ New' → 'Database' → 'PostgreSQL')"
echo "7. Set environment variables:"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - STORAGE_PATH=/app/storage"
echo "   - NODE_ENV=production"
echo "8. After first deploy, get URL and set:"
echo "   - NEXTAUTH_URL=https://your-app.railway.app"
echo "9. Run migrations: Railway → Service → Deployments → Run Command"
echo "   Command: npx prisma migrate deploy"
echo ""
echo "Option 2: Railway CLI (After Interactive Login)"
echo "------------------------------------------------"
echo "Run these commands after 'railway login':"
echo ""
cat << 'EOF'
# Initialize project from GitHub
railway init --github pappdavid/web-ui-ux-testing-tool

# Or create empty project and connect GitHub later
railway init

# Add PostgreSQL
railway add postgresql

# Generate secret
SECRET=$(openssl rand -base64 32)
echo "Generated NEXTAUTH_SECRET: $SECRET"

# Set environment variables
railway variables set NEXTAUTH_SECRET="$SECRET"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

# Deploy
railway up

# Get URL
URL=$(railway domain)
echo "Your app URL: $URL"

# Update NEXTAUTH_URL
railway variables set NEXTAUTH_URL="https://$URL"

# Run migrations
railway run npx prisma migrate deploy

# Optional: Seed database
railway run npm run db:seed
EOF

echo ""
echo "Option 3: Manual Railway API (Advanced)"
echo "---------------------------------------"
echo "API Token: $RAILWAY_TOKEN"
echo ""
echo "You can use Railway's GraphQL API:"
echo "https://docs.railway.app/develop/api"
echo ""

# Generate secrets for user
echo "🔐 Generated Secrets (save these):"
echo "=================================="
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""

echo "📝 Quick Copy-Paste Commands:"
echo "=============================="
echo ""
echo "# After Railway login, run:"
echo "railway init"
echo "railway add postgresql"
echo "railway variables set NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo "railway variables set STORAGE_PATH=\"/app/storage\""
echo "railway variables set NODE_ENV=\"production\""
echo "railway up"
echo "# Then get URL and set NEXTAUTH_URL"
echo "railway domain"
echo "# Update NEXTAUTH_URL with the URL above"
echo "railway variables set NEXTAUTH_URL=\"https://YOUR_URL_HERE\""
echo "railway run npx prisma migrate deploy"
echo "railway run npm run db:seed"
echo ""

echo "✅ Ready to deploy!"
echo ""
echo "🌐 GitHub Repo: https://github.com/$GITHUB_REPO"
echo "🚂 Railway Dashboard: https://railway.app"

