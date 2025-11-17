# Railway Deployment with API Token

You've provided a Railway API token. Here's how to use it:

## Option 1: Railway Dashboard (Easiest - No CLI needed)

1. **Go to Railway Dashboard**: https://railway.app
2. **Login** with your account
3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo" (if connected) or "Empty Project"
4. **Railway will automatically**:
   - Detect your `Dockerfile`
   - Build and deploy your app
5. **Add PostgreSQL**:
   - Click "New" → "Database" → "Add PostgreSQL"
6. **Set Environment Variables**:
   - Go to your service → Variables
   - Add:
     - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
     - `NEXTAUTH_URL` (your Railway URL - get it after deploy)
     - `STORAGE_PATH` = `/app/storage`
     - `NODE_ENV` = `production`
7. **Run Migrations**:
   - Go to your service → Deployments → Latest
   - Click "Shell" or use CLI: `railway run npx prisma migrate deploy`

## Option 2: Railway CLI (After Login)

The Railway CLI requires interactive login, but once logged in, you can use the token for API operations.

### Step 1: Login to CLI
```bash
railway login
```
*This opens your browser - login with your Railway account*

### Step 2: Initialize Project
```bash
railway init
```
Choose: "Create a new project" → "Empty project"

### Step 3: Add PostgreSQL
```bash
railway add postgresql
```

### Step 4: Set Environment Variables
```bash
# Generate secret
SECRET=$(openssl rand -base64 32)

# Set variables
railway variables set NEXTAUTH_SECRET="$SECRET"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"
```

### Step 5: Deploy
```bash
railway up
```

### Step 6: Get URL and Update NEXTAUTH_URL
```bash
# Get URL
railway domain

# Update NEXTAUTH_URL (replace with your actual URL)
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
```

### Step 7: Run Migrations
```bash
railway run npx prisma migrate deploy
```

## Option 3: Using Railway API Directly

Your API token: `609b0c57-a91e-47bd-9a13-1fdfd84797b7`

You can use Railway's GraphQL API directly. See: https://docs.railway.app/develop/api

Example:
```bash
curl -X POST https://api.railway.app/graphql/v1 \
  -H "Authorization: Bearer 609b0c57-a91e-47bd-9a13-1fdfd84797b7" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id } }"}'
```

## Recommended Approach

**Use Railway Dashboard** - It's the easiest way:
1. No CLI setup needed
2. Visual interface
3. Automatic Dockerfile detection
4. Easy environment variable management
5. Built-in PostgreSQL service

## What Happens After Deployment

1. ✅ Railway builds your Docker image (includes Playwright)
2. ✅ Deploys your app with a public URL
3. ✅ Database is automatically connected
4. ✅ **Playwright tests will work!** (no size limits)

## Next Steps

1. Go to https://railway.app
2. Login with your account
3. Create a new project
4. Railway will detect your Dockerfile automatically
5. Add PostgreSQL service
6. Set environment variables
7. Deploy!

Your Dockerfile is ready and includes Playwright browsers, so tests will work once deployed! 🚀

