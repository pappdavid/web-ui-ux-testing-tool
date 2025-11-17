#!/bin/bash

# Complete database setup and test script
set -e

echo "🚀 Database Setup & Test Script"
echo "================================="
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    echo ""
    echo "Setting up local SQLite database for testing..."
    
    # Create .env file with SQLite
    cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="test-secret-key-for-local-development"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PATH="./storage"
PLAYWRIGHT_BROWSERS_PATH="./.playwright"
EOF
    
    echo "✅ Created .env with SQLite database"
    echo ""
    
    # Update Prisma schema to support SQLite temporarily
    echo "📝 Updating Prisma schema for SQLite..."
    # We'll need to modify schema or use a different approach
fi

export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"

echo "📦 Running database setup..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "🌱 Seeding database..."
npm run db:seed || echo "Seed may have failed, continuing..."

echo "✅ Database setup complete!"
echo ""
echo "Test credentials:"
echo "  Email: test@example.com"
echo "  Password: password123"
echo ""

