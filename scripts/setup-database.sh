#!/bin/bash

# Script to set up database for the application
# This script helps set up a PostgreSQL database using various providers

set -e

echo "🚀 Database Setup Script"
echo "========================"
echo ""

# Check if DATABASE_URL is already set
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is already set"
    echo "   $DATABASE_URL"
    exit 0
fi

echo "Choose a database provider:"
echo "1) Vercel Postgres (Recommended for Vercel deployments)"
echo "2) Supabase (Free tier available)"
echo "3) Neon (Free tier available)"
echo "4) Local PostgreSQL (via Docker)"
echo "5) Manual setup (you provide connection string)"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Setting up Vercel Postgres..."
        echo ""
        echo "Note: Vercel Postgres can be created via:"
        echo "  1. Vercel Dashboard: https://vercel.com/dashboard"
        echo "  2. Go to your project → Storage → Create Database → Postgres"
        echo ""
        echo "After creating, link it to your project and DATABASE_URL will be auto-set."
        echo ""
        read -p "Have you created Vercel Postgres? (y/n): " created
        if [ "$created" = "y" ]; then
            echo "✅ Vercel Postgres should be automatically linked"
            echo "   Run: vercel env pull .env.local"
        fi
        ;;
    2)
        echo ""
        echo "📦 Setting up Supabase..."
        echo ""
        echo "1. Go to https://supabase.com and sign up/login"
        echo "2. Create a new project"
        echo "3. Go to Project Settings → Database"
        echo "4. Copy the connection string (URI format)"
        echo "5. Run: vercel env add DATABASE_URL production"
        echo "   Then paste the connection string"
        echo ""
        echo "Example connection string format:"
        echo "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
        ;;
    3)
        echo ""
        echo "📦 Setting up Neon..."
        echo ""
        echo "1. Go to https://neon.tech and sign up/login"
        echo "2. Create a new project"
        echo "3. Copy the connection string from the dashboard"
        echo "4. Run: vercel env add DATABASE_URL production"
        echo "   Then paste the connection string"
        echo ""
        echo "Example connection string format:"
        echo "postgresql://[user]:[password]@[hostname]/[database]?sslmode=require"
        ;;
    4)
        echo ""
        echo "📦 Setting up Local PostgreSQL via Docker..."
        echo ""
        
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        echo "Starting PostgreSQL container..."
        docker-compose up -d db
        
        echo ""
        echo "⏳ Waiting for database to be ready..."
        sleep 5
        
        echo ""
        echo "✅ Local PostgreSQL is running!"
        echo ""
        echo "Connection string:"
        echo "postgresql://postgres:postgres@localhost:5432/testing_tool"
        echo ""
        echo "To use this locally, add to .env:"
        echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/testing_tool\""
        echo ""
        echo "Then run migrations:"
        echo "npm run db:push"
        echo "npm run db:seed"
        ;;
    5)
        echo ""
        echo "📝 Manual Setup"
        echo ""
        read -p "Enter your PostgreSQL connection string: " db_url
        echo ""
        echo "To add to Vercel:"
        echo "vercel env add DATABASE_URL production"
        echo "Then paste: $db_url"
        echo ""
        echo "To add locally, create .env file with:"
        echo "DATABASE_URL=\"$db_url\""
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📋 Next Steps:"
echo "1. Ensure DATABASE_URL is set in Vercel (for production) or .env (for local)"
echo "2. Run migrations: npx prisma migrate deploy (or npm run db:push for dev)"
echo "3. Seed database: npm run db:seed"
echo "4. Test login with: test@example.com / password123"

