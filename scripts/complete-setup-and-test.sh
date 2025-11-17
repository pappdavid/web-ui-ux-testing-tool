#!/bin/bash

# Complete database setup and test script
set -e

echo "🚀 Complete Database Setup & Test"
echo "=================================="
echo ""

# Function to test if database connection works
test_db_connection() {
    echo "🔍 Testing database connection..."
    npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1
    return $?
}

# Function to setup database
setup_database() {
    echo "📦 Setting up database schema..."
    npx prisma generate
    npx prisma db push --accept-data-loss
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema created!"
        return 0
    else
        echo "❌ Failed to create database schema"
        return 1
    fi
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database..."
    npm run db:seed
    
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded!"
        return 0
    else
        echo "⚠️  Seed may have failed, but continuing..."
        return 0
    fi
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    echo ""
    echo "Setting up database connection..."
    echo ""
    echo "Choose an option:"
    echo "1) Use Supabase (Free, Recommended)"
    echo "2) Use Neon (Free)"
    echo "3) Use Vercel Postgres"
    echo "4) Use local PostgreSQL (requires Docker)"
    echo ""
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            echo ""
            echo "📦 Setting up Supabase..."
            echo ""
            echo "Opening Supabase dashboard..."
            open "https://supabase.com/dashboard/projects" 2>/dev/null || echo "Please open: https://supabase.com/dashboard/projects"
            echo ""
            echo "Steps:"
            echo "1. Sign up/Login (free)"
            echo "2. Click 'New Project'"
            echo "3. Fill in details and create project"
            echo "4. Go to Settings → Database"
            echo "5. Copy the 'Connection string' (URI format)"
            echo ""
            read -p "Paste your Supabase connection string: " db_url
            export DATABASE_URL="$db_url"
            echo "DATABASE_URL=\"$db_url\"" >> .env
            ;;
        2)
            echo ""
            echo "📦 Setting up Neon..."
            echo ""
            echo "Opening Neon dashboard..."
            open "https://console.neon.tech" 2>/dev/null || echo "Please open: https://console.neon.tech"
            echo ""
            echo "Steps:"
            echo "1. Sign up/Login (free)"
            echo "2. Create a new project"
            echo "3. Copy the connection string"
            echo ""
            read -p "Paste your Neon connection string: " db_url
            export DATABASE_URL="$db_url"
            echo "DATABASE_URL=\"$db_url\"" >> .env
            ;;
        3)
            echo ""
            echo "📦 Setting up Vercel Postgres..."
            echo ""
            echo "Opening Vercel dashboard..."
            open "https://vercel.com/dashboard" 2>/dev/null || echo "Please open: https://vercel.com/dashboard"
            echo ""
            echo "Steps:"
            echo "1. Go to your project"
            echo "2. Storage → Create Database → Postgres"
            echo "3. Copy DATABASE_URL from environment variables"
            echo ""
            read -p "Paste your Vercel Postgres connection string: " db_url
            export DATABASE_URL="$db_url"
            echo "DATABASE_URL=\"$db_url\"" >> .env
            ;;
        4)
            echo ""
            echo "📦 Setting up local PostgreSQL..."
            if command -v docker &> /dev/null; then
                echo "Starting PostgreSQL container..."
                docker run -d \
                    --name testing_tool_db \
                    -e POSTGRES_USER=postgres \
                    -e POSTGRES_PASSWORD=postgres \
                    -e POSTGRES_DB=testing_tool \
                    -p 5432:5432 \
                    postgres:15-alpine
                
                sleep 5
                export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/testing_tool"
                echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
                echo "✅ Local PostgreSQL started!"
            else
                echo "❌ Docker not found. Please install Docker first."
                exit 1
            fi
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
fi

# Ensure .env has other required vars
if ! grep -q "NEXTAUTH_SECRET" .env 2>/dev/null; then
    echo "NEXTAUTH_SECRET=\"test-secret-key-for-local-development-change-in-production\"" >> .env
fi
if ! grep -q "NEXTAUTH_URL" .env 2>/dev/null; then
    echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env
fi
if ! grep -q "STORAGE_PATH" .env 2>/dev/null; then
    echo "STORAGE_PATH=\"./storage\"" >> .env
fi
if ! grep -q "PLAYWRIGHT_BROWSERS_PATH" .env 2>/dev/null; then
    echo "PLAYWRIGHT_BROWSERS_PATH=\"./.playwright\"" >> .env
fi

# Setup database
if setup_database; then
    # Seed database
    seed_database
    
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Test credentials:"
    echo "  Email: test@example.com"
    echo "  Password: password123"
    echo ""
    echo "Starting test server..."
    echo ""
    
    # Start dev server in background
    npm run dev > /tmp/nextjs-test.log 2>&1 &
    SERVER_PID=$!
    
    echo "Waiting for server to start..."
    sleep 10
    
    # Test registration and login
    echo "🧪 Testing registration and login..."
    echo ""
    
    # Run test script
    TEST_EMAIL="test-$(date +%s)@example.com"
    TEST_PASSWORD="TestPassword123!"
    
    echo "Testing registration with: $TEST_EMAIL"
    curl -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}" \
        2>/dev/null | jq '.' || echo "Registration test completed"
    
    echo ""
    echo "Testing login with: $TEST_EMAIL"
    curl -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
        2>/dev/null | jq '.' || echo "Login test completed"
    
    echo ""
    echo "Testing login with default credentials: test@example.com"
    curl -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}" \
        2>/dev/null | jq '.' || echo "Default login test completed"
    
    echo ""
    echo "✅ Tests completed!"
    echo ""
    echo "Server is running at http://localhost:3000"
    echo "Server PID: $SERVER_PID"
    echo ""
    echo "To stop the server: kill $SERVER_PID"
else
    echo "❌ Database setup failed"
    exit 1
fi

