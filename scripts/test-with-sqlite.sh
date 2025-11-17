#!/bin/bash

# Test registration and login using SQLite (temporary, for testing)
set -e

echo "🧪 Testing with SQLite Database"
echo "================================"
echo ""

# Backup original schema
cp prisma/schema.prisma prisma/schema.postgres.prisma.bak 2>/dev/null || true

# Use SQLite schema temporarily
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Set SQLite database URL
export DATABASE_URL="file:./test.db"
echo "DATABASE_URL=\"$DATABASE_URL\"" > .env.test
echo "NEXTAUTH_SECRET=\"test-secret-key-for-local-development\"" >> .env.test
echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.test
echo "STORAGE_PATH=\"./storage\"" >> .env.test
echo "PLAYWRIGHT_BROWSERS_PATH=\"./.playwright\"" >> .env.test

# Copy to main .env for testing
cp .env.test .env

echo "📦 Setting up SQLite database..."
npx prisma generate
npx prisma db push --accept-data-loss

echo ""
echo "🌱 Seeding database..."
# Create test user manually for SQLite
npx tsx -e "
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash },
    create: {
      email: 'test@example.com',
      passwordHash,
    },
  });
  console.log('✅ Test user created');
}

main().catch(console.error).finally(() => prisma.\$disconnect());
"

echo ""
echo "✅ Database ready!"
echo ""

# Kill any existing server
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start server
echo "🚀 Starting server..."
npm run dev > /tmp/nextjs-sqlite-test.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server..."
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

# Test registration
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Test 1: Registration"
echo "---------------------"
REGISTER_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}")
echo "$REGISTER_RESULT" | jq '.' 2>/dev/null || echo "$REGISTER_RESULT"
echo ""

if echo "$REGISTER_RESULT" | grep -qi "success\|id\|email"; then
    echo "✅ Registration successful!"
else
    echo "❌ Registration failed"
fi

echo ""
echo "Test 2: Login with new account"
echo "-------------------------------"
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
echo "$LOGIN_RESULT" | jq '.' 2>/dev/null || echo "$LOGIN_RESULT"
echo ""

if echo "$LOGIN_RESULT" | grep -qi "success\|token\|session\|redirect"; then
    echo "✅ Login successful!"
else
    echo "❌ Login failed"
fi

echo ""
echo "Test 3: Login with default credentials"
echo "--------------------------------------"
DEFAULT_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}")
echo "$DEFAULT_LOGIN" | jq '.' 2>/dev/null || echo "$DEFAULT_LOGIN"
echo ""

if echo "$DEFAULT_LOGIN" | grep -qi "success\|token\|session\|redirect"; then
    echo "✅ Default login successful!"
else
    echo "❌ Default login failed"
fi

echo ""
echo "✅ Testing Complete!"
echo ""
echo "🌐 Test in browser: http://localhost:3000"
echo "🛑 Stop server: kill $SERVER_PID"
echo ""
echo "Note: This uses SQLite for testing. For production, use PostgreSQL."
echo "To switch back to PostgreSQL:"
echo "  1. Restore schema: cp prisma/schema.postgres.prisma.bak prisma/schema.prisma"
echo "  2. Set DATABASE_URL to your PostgreSQL connection string"
echo "  3. Run: npx prisma generate && npx prisma db push"

# Restore original schema
cp prisma/schema.postgres.prisma.bak prisma/schema.prisma 2>/dev/null || true

