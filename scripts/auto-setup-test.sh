#!/bin/bash

# Automated database setup and test script
# This script will guide you through database setup and immediately test registration/login

set -e

echo "🚀 Automated Database Setup & Test"
echo "===================================="
echo ""

# Function to test API endpoints
test_registration() {
    local email=$1
    local password=$2
    echo "Testing registration: $email"
    curl -s -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"confirmPassword\":\"$password\"}" \
        | jq '.' 2>/dev/null || echo "Response received"
}

test_login() {
    local email=$1
    local password=$2
    echo "Testing login: $email"
    curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
        | jq '.' 2>/dev/null || echo "Response received"
}

# Check if we have a database URL
if [ ! -f .env ] || ! grep -q "DATABASE_URL" .env || grep -q "file:./dev.db" .env 2>/dev/null; then
    echo "📋 Database Setup Required"
    echo ""
    echo "We need a PostgreSQL database. Here are your options:"
    echo ""
    echo "Option 1: Neon (Free, Fast Setup)"
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
    echo ""
    # Try to read from stdin if provided, otherwise prompt
    if [ -t 0 ]; then
        read -p "Paste your PostgreSQL connection string here: " db_url
    else
        read db_url
    fi
    
    if [ -z "$db_url" ] || [[ ! "$db_url" == postgresql://* ]]; then
        echo "❌ Invalid connection string. Expected format: postgresql://user:pass@host:port/db"
        echo ""
        echo "Quick setup options:"
        echo "  Neon: https://console.neon.tech/signup"
        echo "  Supabase: https://supabase.com/dashboard/projects"
        exit 1
    fi
    
    # Create/update .env
    cat > .env << EOF
DATABASE_URL="$db_url"
NEXTAUTH_SECRET="test-secret-key-for-local-development-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PATH="./storage"
PLAYWRIGHT_BROWSERS_PATH="./.playwright"
EOF
    
    echo ""
    echo "✅ Database URL saved to .env"
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo ""
echo "📦 Setting up database schema..."
npx prisma generate
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up database schema"
    echo "Check your DATABASE_URL in .env"
    exit 1
fi

echo ""
echo "🌱 Seeding database..."
npm run db:seed 2>&1 | grep -v "warn" || true

echo ""
echo "✅ Database ready!"
echo ""

# Kill any existing server
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start server
echo "🚀 Starting development server..."
npm run dev > /tmp/nextjs-test.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is running!"
        break
    fi
    sleep 1
done

sleep 3

echo ""
echo "🧪 Testing Registration & Login"
echo "=================================="
echo ""

# Test 1: Registration with new email
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Test 1: Registration"
echo "---------------------"
REGISTER_RESULT=$(test_registration "$TEST_EMAIL" "$TEST_PASSWORD")
echo "$REGISTER_RESULT"
echo ""

if echo "$REGISTER_RESULT" | grep -qi "success\|id\|email\|user"; then
    echo "✅ Registration successful!"
    REG_SUCCESS=true
else
    echo "⚠️  Registration may have failed - checking response"
    REG_SUCCESS=false
fi

echo ""
echo "Test 2: Login with newly registered account"
echo "--------------------------------------------"
LOGIN_RESULT=$(test_login "$TEST_EMAIL" "$TEST_PASSWORD")
echo "$LOGIN_RESULT"
echo ""

if echo "$LOGIN_RESULT" | grep -qi "success\|token\|session\|redirect"; then
    echo "✅ Login successful!"
    LOGIN_SUCCESS=true
else
    echo "⚠️  Login may have failed - checking response"
    LOGIN_SUCCESS=false
fi

echo ""
echo "Test 3: Login with default test credentials"
echo "--------------------------------------------"
DEFAULT_LOGIN=$(test_login "test@example.com" "password123")
echo "$DEFAULT_LOGIN"
echo ""

if echo "$DEFAULT_LOGIN" | grep -qi "success\|token\|session\|redirect"; then
    echo "✅ Default login successful!"
    DEFAULT_SUCCESS=true
else
    echo "⚠️  Default login may have failed"
    DEFAULT_SUCCESS=false
fi

echo ""
echo "📊 Test Summary"
echo "==============="
echo "Registration: $([ "$REG_SUCCESS" = true ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Login (new user): $([ "$LOGIN_SUCCESS" = true ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Login (default): $([ "$DEFAULT_SUCCESS" = true ] && echo "✅ PASS" || echo "❌ FAIL")"
echo ""

if [ "$REG_SUCCESS" = true ] && [ "$LOGIN_SUCCESS" = true ]; then
    echo "🎉 All critical tests passed!"
    echo ""
    echo "✅ Registration and Login are working!"
    echo ""
    echo "🌐 Test in browser: http://localhost:3000"
    echo "📝 Server logs: tail -f /tmp/nextjs-test.log"
    echo "🛑 Stop server: kill $SERVER_PID"
    echo ""
    echo "Test credentials created:"
    echo "  Email: $TEST_EMAIL"
    echo "  Password: $TEST_PASSWORD"
    echo ""
    echo "Default test credentials:"
    echo "  Email: test@example.com"
    echo "  Password: password123"
else
    echo "⚠️  Some tests failed. Check the responses above."
    echo "📝 Server logs: tail -f /tmp/nextjs-test.log"
    echo "🛑 Stop server: kill $SERVER_PID"
fi

