#!/bin/bash

# Deploy to Railway using GraphQL API
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-609b0c57-a91e-47bd-9a13-1fdfd84797b7}"
GITHUB_REPO="pappdavid/web-ui-ux-testing-tool"

echo "🚂 Railway Deployment via GraphQL API"
echo "====================================="
echo ""

# Railway GraphQL API endpoint
RAILWAY_API="https://backboard.railway.app/graphql/v2"

echo "📋 Step 1: Creating Railway project..."
echo ""

# Create project mutation
CREATE_PROJECT_MUTATION='
mutation {
  projectCreate(input: { name: "web-ui-ux-testing-tool" }) {
    id
    name
  }
}
'

RESPONSE=$(curl -s -X POST "$RAILWAY_API" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "{\"query\": \"$CREATE_PROJECT_MUTATION\"}")

echo "Response: $RESPONSE"
echo ""

# Check if project was created
if echo "$RESPONSE" | grep -q "projectCreate"; then
  PROJECT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✅ Project created! ID: $PROJECT_ID"
else
  echo "⚠️  Project creation response: $RESPONSE"
  echo ""
  echo "Trying to list existing projects..."
  
  LIST_PROJECTS_QUERY='
  query {
    projects {
      edges {
        node {
          id
          name
        }
      }
    }
  }
  '
  
  PROJECTS=$(curl -s -X POST "$RAILWAY_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -d "{\"query\": \"$LIST_PROJECTS_QUERY\"}")
  
  echo "Projects: $PROJECTS"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "Since Railway CLI requires interactive login, here are your options:"
echo ""
echo "Option 1: Use Railway Dashboard (Recommended)"
echo "----------------------------------------------"
echo "1. Go to https://railway.app"
echo "2. Login with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select: $GITHUB_REPO"
echo "5. Railway will auto-detect Dockerfile"
echo "6. Add PostgreSQL: '+ New' → 'Database' → 'PostgreSQL'"
echo "7. Set environment variables (see below)"
echo ""
echo "Option 2: Use Railway CLI after login"
echo "--------------------------------------"
echo "1. Run: railway login (opens browser)"
echo "2. Run: railway init"
echo "3. Run: railway add postgresql"
echo "4. Set variables (see below)"
echo "5. Run: railway up"
echo ""
echo "Environment Variables to Set:"
echo "============================="
echo "NEXTAUTH_SECRET=T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
echo "STORAGE_PATH=/app/storage"
echo "NODE_ENV=production"
echo "NEXTAUTH_URL=https://your-app.up.railway.app (set after deploy)"
echo ""
echo "After deployment, run migrations:"
echo "railway run npx prisma migrate deploy"
echo "railway run npm run db:seed"

