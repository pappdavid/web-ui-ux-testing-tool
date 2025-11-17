#!/bin/bash

# Script to set up Vercel Postgres database
set -e

echo "🚀 Vercel Postgres Setup"
echo "========================"
echo ""
echo "Vercel Postgres can be created via the dashboard:"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project: web-ui-ux-testing-tool"
echo "3. Go to Storage tab"
echo "4. Click 'Create Database' → 'Postgres'"
echo "5. Choose a name and region"
echo "6. The DATABASE_URL will be automatically added to your environment variables"
echo ""
echo "After creating, run:"
echo "  vercel env pull .env.local"
echo "  npx prisma migrate deploy"
echo "  npm run db:seed"
echo ""
echo "Or, if you prefer to use a different PostgreSQL provider:"
echo "  Run: node scripts/create-supabase-project.js"
echo ""

