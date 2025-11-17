#!/bin/bash

# Automated database setup script
# This script attempts to set up a database automatically

set -e

echo "🚀 Automated Database Setup"
echo "============================"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found - Setting up local PostgreSQL..."
    echo ""
    
    # Start PostgreSQL container
    docker-compose up -d db 2>/dev/null || {
        echo "Starting PostgreSQL container..."
        docker run -d \
            --name testing_tool_db \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=testing_tool \
            -p 5432:5432 \
            postgres:15-alpine
        
        echo "⏳ Waiting for database to start..."
        sleep 5
    }
    
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/testing_tool"
    echo "✅ Local PostgreSQL is running!"
    echo ""
    echo "DATABASE_URL=$DATABASE_URL"
    echo ""
    
    # Run migrations
    echo "📦 Running database migrations..."
    npx prisma migrate deploy 2>/dev/null || npx prisma db push
    
    # Seed database
    echo "🌱 Seeding database..."
    npm run db:seed
    
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Test login credentials:"
    echo "  Email: test@example.com"
    echo "  Password: password123"
    echo ""
    echo "To use this database with Vercel, you'll need to:"
    echo "  1. Use a cloud database (Supabase, Neon, Vercel Postgres)"
    echo "  2. Or use a tunnel service like ngrok to expose local DB"
    exit 0
fi

# If Docker not available, provide instructions
echo "❌ Docker not found"
echo ""
echo "Please choose one of these options:"
echo ""
echo "Option 1: Install Docker and run this script again"
echo "  macOS: brew install --cask docker"
echo "  Then start Docker Desktop"
echo ""
echo "Option 2: Use a cloud database"
echo "  Run: ./scripts/setup-database.sh"
echo ""
echo "Option 3: Use Neon (Free, API-based)"
echo "  1. Sign up at https://neon.tech"
echo "  2. Create a project"
echo "  3. Copy connection string"
echo "  4. Run: vercel env add DATABASE_URL production"
echo ""

