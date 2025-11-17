#!/bin/bash

# Quick database setup - tries multiple methods automatically

set -e

echo "🚀 Quick Database Setup"
echo "======================="
echo ""

# Method 1: Check if DATABASE_URL is already set
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is set: $DATABASE_URL"
    echo ""
    echo "Running migrations..."
    npx prisma migrate deploy 2>/dev/null || npx prisma db push
    echo ""
    echo "Seeding database..."
    npm run db:seed
    echo ""
    echo "✅ Setup complete!"
    exit 0
fi

# Method 2: Try Docker
if command -v docker &> /dev/null; then
    echo "🐳 Found Docker - setting up local PostgreSQL..."
    echo ""
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^testing_tool_db$"; then
        echo "Starting existing container..."
        docker start testing_tool_db
    else
        echo "Creating new PostgreSQL container..."
        docker run -d \
            --name testing_tool_db \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=testing_tool \
            -p 5432:5432 \
            postgres:15-alpine
        
        echo "⏳ Waiting for database to be ready..."
        sleep 5
    fi
    
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/testing_tool"
    
    echo "✅ Database is running!"
    echo ""
    echo "Setting up schema..."
    DATABASE_URL="$DATABASE_URL" npx prisma db push
    
    echo "Seeding database..."
    DATABASE_URL="$DATABASE_URL" npm run db:seed
    
    echo ""
    echo "✅ Local database setup complete!"
    echo ""
    echo "DATABASE_URL: $DATABASE_URL"
    echo ""
    echo "Test credentials:"
    echo "  Email: test@example.com"
    echo "  Password: password123"
    echo ""
    echo "⚠️  Note: This is a LOCAL database. For Vercel deployment,"
    echo "   you'll need a cloud database (Supabase, Neon, or Vercel Postgres)"
    exit 0
fi

# Method 3: Provide cloud setup instructions
echo "❌ Docker not found"
echo ""
echo "📋 Cloud Database Setup Options:"
echo ""
echo "Option 1: Supabase (Recommended - Free)"
echo "  1. Go to https://supabase.com"
echo "  2. Sign up and create a project"
echo "  3. Copy connection string from Settings → Database"
echo "  4. Run: vercel env add DATABASE_URL production"
echo ""
echo "Option 2: Neon (Free)"
echo "  1. Go to https://neon.tech"
echo "  2. Sign up and create a project"
echo "  3. Copy connection string"
echo "  4. Run: vercel env add DATABASE_URL production"
echo ""
echo "Option 3: Vercel Postgres"
echo "  1. Go to Vercel Dashboard → Your Project"
echo "  2. Storage → Create Database → Postgres"
echo "  3. It will auto-link to your project"
echo ""
echo "After setting DATABASE_URL in Vercel:"
echo "  vercel env pull .env.local"
echo "  npx prisma migrate deploy"
echo "  npm run db:seed"
echo ""

