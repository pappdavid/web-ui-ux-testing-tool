#!/bin/bash

# Production Setup Script
# This script helps set up the application for production deployment

set -e

echo "🚀 Production Setup"
echo "==================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

echo "Step 1: Environment Variables"
echo "-----------------------------"
echo ""

# Check for .env.production.local
if [ ! -f ".env.production.local" ]; then
    echo "📝 Creating .env.production.local from example..."
    cp .env.production.example .env.production.local 2>/dev/null || true
    echo ""
    echo "⚠️  Please edit .env.production.local with your production values:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - NEXTAUTH_URL (your production domain)"
    echo ""
    read -p "Press Enter after you've configured .env.production.local..."
fi

# Load production env
if [ -f ".env.production.local" ]; then
    export $(cat .env.production.local | grep -v '^#' | xargs)
fi

# Validate required variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your-super-secret-key-change-this-in-production" ]; then
    echo "❌ NEXTAUTH_SECRET must be set to a secure value"
    echo "   Generate one with: openssl rand -base64 32"
    exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
    echo "❌ NEXTAUTH_URL is required"
    exit 1
fi

echo "✅ Environment variables validated"
echo ""

echo "Step 2: Database Setup"
echo "----------------------"
echo ""

# Check database connection
echo "Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Cannot connect to database"
    echo "   Please check your DATABASE_URL in .env.production.local"
    exit 1
fi

# Run migrations
echo ""
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Migration failed, trying db push..."
    npx prisma db push --accept-data-loss
fi

echo ""
echo "Step 3: Build Application"
echo "-------------------------"
echo ""

echo "Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "Step 4: Generate Prisma Client"
echo "-------------------------------"
echo ""

npx prisma generate
echo "✅ Prisma Client generated"

echo ""
echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Review .env.production.local settings"
echo "2. Test locally: npm run start"
echo "3. Deploy to Vercel: vercel --prod"
echo "4. Set environment variables in Vercel dashboard"
echo ""

