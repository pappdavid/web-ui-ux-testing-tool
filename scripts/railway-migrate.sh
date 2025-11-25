#!/bin/bash

# Run database migrations on Railway
# This script helps apply migrations to production database

echo "Running database migrations on Railway..."
echo ""

# Try to run migration
railway run --service web-ui-ux-testing-tool npm run db:migrate:deploy 2>/dev/null

if [ $? -ne 0 ]; then
  echo ""
  echo "Note: If you see 'Multiple services' error,"
  echo "go to Railway Dashboard and manually run:"
  echo ""
  echo "  npx prisma migrate deploy"
  echo ""
  echo "Or add to Start Command:"
  echo "  npx prisma migrate deploy && npm start"
  echo ""
fi

