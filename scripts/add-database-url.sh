#!/bin/bash

# Script to add DATABASE_URL to Vercel
# This script helps you add a PostgreSQL connection string to Vercel

set -e

echo "🔗 Adding DATABASE_URL to Vercel"
echo "=================================="
echo ""

# Check if DATABASE_URL is provided as argument
if [ -n "$1" ]; then
    DATABASE_URL="$1"
    echo "Using provided DATABASE_URL"
else
    # Check if DATABASE_URL exists in local env files
    if [ -f .env.local ] && grep -q "DATABASE_URL" .env.local; then
        DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        echo "Found DATABASE_URL in .env.local"
    elif [ -f .env ] && grep -q "DATABASE_URL" .env; then
        DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        echo "Found DATABASE_URL in .env"
    else
        echo "No DATABASE_URL found locally."
        echo ""
        echo "You need a PostgreSQL connection string."
        echo ""
        echo "Quick setup options:"
        echo ""
        echo "Option 1: Neon (Free, Recommended)"
        echo "  1. Go to: https://console.neon.tech/signup"
        echo "  2. Sign up (free, no credit card)"
        echo "  3. Create a new project"
        echo "  4. Copy the connection string"
        echo ""
        echo "Option 2: Supabase (Free)"
        echo "  1. Go to: https://supabase.com/dashboard/projects"
        echo "  2. Sign up and create a project"
        echo "  3. Go to Settings → Database"
        echo "  4. Copy the connection string (URI format)"
        echo ""
        echo "Option 3: Vercel Postgres"
        echo "  1. Go to: https://vercel.com/dashboard"
        echo "  2. Your project → Storage → Create Database → Postgres"
        echo "  3. DATABASE_URL will be auto-added"
        echo ""
        read -p "Paste your PostgreSQL connection string here: " DATABASE_URL
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required"
    exit 1
fi

# Validate format
if [[ ! "$DATABASE_URL" == postgresql://* ]] && [[ ! "$DATABASE_URL" == postgres://* ]]; then
    echo "❌ Invalid connection string format"
    echo "   Expected format: postgresql://user:password@host:port/database"
    exit 1
fi

echo ""
echo "Adding DATABASE_URL to Vercel production environment..."
echo ""

# Add to Vercel
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DATABASE_URL added successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Pull environment variables: vercel env pull .env.local"
    echo "  2. Run migrations: npx prisma migrate deploy"
    echo "  3. Seed database (optional): npm run db:seed"
    echo "  4. Redeploy: vercel --prod"
    echo ""
else
    echo ""
    echo "❌ Failed to add DATABASE_URL"
    echo "   Try manually: vercel env add DATABASE_URL production"
    exit 1
fi

