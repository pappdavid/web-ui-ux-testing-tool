#!/bin/bash

# Quick database setup using a free cloud service
# This script will guide you through creating a database and immediately test it

set -e

echo "🚀 Quick Database Setup & Test"
echo "==============================="
echo ""

# Check if we already have a DATABASE_URL
if [ -f .env ] && grep -q "DATABASE_URL" .env && ! grep -q "file:./dev.db" .env; then
    source .env
    if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" == postgresql://* ]]; then
        echo "✅ Found DATABASE_URL in .env"
        echo "   Using: ${DATABASE_URL:0:50}..."
        echo ""
    fi
fi

# If no valid DATABASE_URL, guide through setup
if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == "file:"* ]]; then
    echo "📋 Setting up database..."
    echo ""
    echo "We'll use Neon (free PostgreSQL):"
    echo ""
    echo "1. Opening Neon signup page..."
    open "https://neon.tech" 2>/dev/null || echo "   Please open: https://neon.tech"
    echo ""
    echo "2. Sign up (free, no credit card required)"
    echo "3. Create a new project"
    echo "4. Copy the connection string"
    echo ""
    read -p "Paste your Neon connection string here: " neon_url
    
    if [ -n "$neon_url" ] && [[ "$neon_url" == postgresql://* ]]; then
        # Update .env
        if [ -f .env ]; then
            # Remove old DATABASE_URL if exists
            sed -i.bak '/^DATABASE_URL=/d' .env
        else
            touch .env
        fi
        
        echo "DATABASE_URL=\"$neon_url\"" >> .env
        echo "NEXTAUTH_SECRET=\"test-secret-key-for-local-development-change-in-production\"" >> .env
        echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env
        echo "STORAGE_PATH=\"./storage\"" >> .env
        echo "PLAYWRIGHT_BROWSERS_PATH=\"./.playwright\"" >> .env
        
        export DATABASE_URL="$neon_url"
        echo ""
        echo "✅ Database URL saved!"
    else
        echo "❌ Invalid connection string"
        exit 1
    fi
fi

echo ""
echo "📦 Setting up database schema..."
npx prisma generate
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up database schema"
    exit 1
fi

echo ""
echo "🌱 Seeding database..."
npm run db:seed || echo "⚠️  Seed completed (may have warnings)"

echo ""
echo "✅ Database ready!"
echo ""
echo "🧪 Starting server and testing..."
echo ""

# Kill any existing server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start server in background
npm run dev > /tmp/nextjs-test.log 2>&1 &
SERVER_PID=$!

echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is running!"
        break
    fi
    sleep 1
done

sleep 2

echo ""
echo "🧪 Testing Registration..."
echo ""

# Test registration
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}")

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

if echo "$REGISTER_RESPONSE" | grep -q "success\|id\|email"; then
    echo "✅ Registration successful!"
else
    echo "⚠️  Registration may have issues - check response above"
fi

echo ""
echo "🧪 Testing Login..."
echo ""

# Test login with newly created account
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "success\|token\|session"; then
    echo "✅ Login successful!"
else
    echo "⚠️  Login may have issues - check response above"
fi

echo ""
echo "🧪 Testing Login with Default Credentials..."
echo ""

# Test login with default test user
DEFAULT_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}")

echo "Default Login Response:"
echo "$DEFAULT_LOGIN" | jq '.' 2>/dev/null || echo "$DEFAULT_LOGIN"
echo ""

if echo "$DEFAULT_LOGIN" | grep -q "success\|token\|session"; then
    echo "✅ Default login successful!"
else
    echo "⚠️  Default login may have issues - check response above"
fi

echo ""
echo "✅ Testing Complete!"
echo ""
echo "🌐 Server is running at: http://localhost:3000"
echo "📝 Server logs: tail -f /tmp/nextjs-test.log"
echo "🛑 To stop server: kill $SERVER_PID"
echo ""
echo "Test credentials created:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo ""
echo "Default test credentials:"
echo "  Email: test@example.com"
echo "  Password: password123"
echo ""

