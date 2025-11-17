#!/bin/bash

# Quick script to connect a database to Vercel
# Usage: ./scripts/quick-db-connect.sh "postgresql://user:pass@host:5432/db"

set -e

CONNECTION_STRING="$1"

if [ -z "$CONNECTION_STRING" ]; then
    echo "❌ Usage: $0 \"postgresql://user:pass@host:5432/db\""
    echo ""
    echo "Or run interactively:"
    echo "  vercel env add DATABASE_URL production"
    exit 1
fi

# Validate connection string format
if [[ ! "$CONNECTION_STRING" == postgresql://* ]] && [[ ! "$CONNECTION_STRING" == postgres://* ]]; then
    echo "❌ Invalid connection string format"
    echo "   Expected: postgresql://user:password@host:port/database"
    exit 1
fi

echo "🔗 Connecting database to Vercel..."
echo ""

# Remove old DATABASE_URL if exists
if vercel env ls 2>&1 | grep -q "DATABASE_URL"; then
    echo "Removing old DATABASE_URL..."
    vercel env rm DATABASE_URL production --yes 2>&1 || true
    echo ""
fi

# Add new DATABASE_URL
echo "$CONNECTION_STRING" | vercel env add DATABASE_URL production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database connected successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. vercel env pull .env.local"
    echo "  2. npx prisma migrate deploy"
    echo "  3. npm run db:seed (optional)"
    echo "  4. vercel --prod"
else
    echo ""
    echo "❌ Failed to add DATABASE_URL"
    exit 1
fi

