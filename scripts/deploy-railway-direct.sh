#!/bin/bash

# Direct Railway deployment script
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-609b0c57-a91e-47bd-9a13-1fdfd84797b7}"

echo "🚂 Railway Deployment"
echo "====================="
echo ""

# Try to use Railway CLI with token
export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "Attempting to authenticate with Railway..."
echo ""

# Check if we're already linked to a project
if [ -f ".railway/project.toml" ] || [ -f "railway.toml" ]; then
    echo "✅ Project already linked"
    railway status
else
    echo "📋 Linking project..."
    echo ""
    echo "The token provided appears to be a project token."
    echo "You need to either:"
    echo ""
    echo "1. Use Railway Dashboard (Easiest):"
    echo "   - Go to https://railway.app"
    echo "   - Login with GitHub"
    echo "   - New Project → Deploy from GitHub repo"
    echo "   - Select: pappdavid/web-ui-ux-testing-tool"
    echo ""
    echo "2. Or use Railway CLI with interactive login:"
    echo "   railway login"
    echo "   railway init"
    echo "   railway link <project-id>  # if you have a project ID"
    echo ""
fi

echo ""
echo "🔧 Manual Deployment Steps:"
echo "==========================="
echo ""
echo "# 1. Login to Railway (opens browser)"
echo "railway login"
echo ""
echo "# 2. Initialize project"
echo "railway init"
echo ""
echo "# 3. Add PostgreSQL database"
echo "railway add postgresql"
echo ""
echo "# 4. Set environment variables"
echo "railway variables set NEXTAUTH_SECRET=\"T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=\""
echo "railway variables set STORAGE_PATH=\"/app/storage\""
echo "railway variables set NODE_ENV=\"production\""
echo ""
echo "# 5. Deploy"
echo "railway up"
echo ""
echo "# 6. Get URL and update NEXTAUTH_URL"
echo "URL=\$(railway domain)"
echo "railway variables set NEXTAUTH_URL=\"https://\$URL\""
echo ""
echo "# 7. Run migrations"
echo "railway run npx prisma migrate deploy"
echo ""
echo "# 8. Seed database"
echo "railway run npm run db:seed"
echo ""

# Try to check Railway status if linked
if railway whoami &>/dev/null; then
    echo "✅ Railway CLI is authenticated"
    railway list
else
    echo "⚠️  Railway CLI requires interactive login"
    echo "   Run: railway login"
fi

