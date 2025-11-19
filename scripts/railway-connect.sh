#!/bin/bash

# Railway Connection Script
# This script helps connect to Railway and set up the project

set -e

echo "🚂 Railway Connection Setup"
echo "============================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI is installed"
echo ""

# Check login status
if railway whoami &> /dev/null; then
    echo "✅ Already logged in to Railway"
    railway whoami
else
    echo "🔐 Please login to Railway..."
    echo "   This will open your browser for authentication"
    echo ""
    echo "   Run: railway login"
    echo ""
    echo "   Or if you have a token, run:"
    echo "   railway login --browserless"
    echo ""
    read -p "Press Enter to continue with login, or Ctrl+C to cancel..."
    railway login
fi

echo ""
echo "📋 Checking project status..."
if railway status &> /dev/null; then
    echo "✅ Project is linked"
    railway status
else
    echo "⚠️  No project linked yet"
    echo ""
    echo "To link an existing project:"
    echo "  railway link"
    echo ""
    echo "To create a new project:"
    echo "  railway init"
    echo ""
fi

echo ""
echo "🔍 Checking for PostgreSQL database..."
if railway variables get DATABASE_URL &> /dev/null; then
    echo "✅ DATABASE_URL is set"
    echo "   Database connection is configured"
else
    echo "⚠️  DATABASE_URL not found"
    echo ""
    echo "To add PostgreSQL database:"
    echo "  railway add postgresql"
    echo ""
fi

echo ""
echo "📝 Current environment variables:"
railway variables 2>/dev/null || echo "  (No variables set yet)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Ensure DATABASE_URL is set (railway add postgresql)"
echo "  2. Set NEXTAUTH_SECRET: railway variables set NEXTAUTH_SECRET=\"\$(openssl rand -base64 32)\""
echo "  3. Set NEXTAUTH_URL: railway variables set NEXTAUTH_URL=\"https://your-app.railway.app\""
echo "  4. Deploy: railway up"
echo ""
