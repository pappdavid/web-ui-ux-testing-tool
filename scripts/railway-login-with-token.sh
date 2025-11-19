#!/bin/bash

# Railway Login with Token Script
# Usage: bash scripts/railway-login-with-token.sh YOUR_TOKEN

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Token required"
    echo ""
    echo "Usage: bash scripts/railway-login-with-token.sh YOUR_TOKEN"
    echo ""
    echo "To get a token:"
    echo "  1. Go to: https://railway.app/account/tokens"
    echo "  2. Click 'Create Token'"
    echo "  3. Copy the token"
    echo ""
    exit 1
fi

TOKEN="$1"

echo "🚂 Logging into Railway..."
echo ""

# Set token as environment variable
export RAILWAY_TOKEN="$TOKEN"

# Verify login
if railway whoami &> /dev/null; then
    echo "✅ Successfully logged in!"
    echo ""
    railway whoami
    echo ""
    echo "📋 Next steps:"
    echo "  1. Link project: railway link"
    echo "  2. Add database: railway add postgresql"
    echo "  3. Set variables: railway variables set KEY=value"
    echo "  4. Deploy: railway up"
else
    echo "❌ Login failed. Please check your token."
    echo ""
    echo "Get a new token from: https://railway.app/account/tokens"
    exit 1
fi
