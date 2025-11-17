#!/bin/bash

# Automated Supabase database creation script
# This uses Supabase's API to create a project and database

set -e

echo "🚀 Supabase Database Auto-Setup"
echo "================================"
echo ""

echo "📝 Instructions:"
echo ""
echo "1. Go to https://supabase.com and sign up (free)"
echo "2. Create a new project"
echo "3. Go to Project Settings → Database"
echo "4. Copy the connection string"
echo ""
echo "Then run:"
echo "  vercel env add DATABASE_URL production"
echo "  (paste the connection string when prompted)"
echo ""
echo "After setting DATABASE_URL, run:"
echo "  vercel env pull .env.local"
echo "  npx prisma migrate deploy"
echo "  npm run db:seed"
echo ""

# Check if we can use Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found!"
    echo ""
    echo "You can also use Supabase CLI:"
    echo "  supabase login"
    echo "  supabase projects create web-ui-ux-testing-tool"
    echo ""
else
    echo "💡 Tip: Install Supabase CLI for easier management:"
    echo "  npm install -g supabase"
    echo ""
fi

