# Quick Railway Setup Guide

## Prerequisites

Railway CLI is already installed! ✅

## Step 1: Login to Railway

Since we're in a non-interactive environment, use browserless login:

### Option A: Using Token (Recommended)

1. **Get a token:**
   - Go to: https://railway.app/account/tokens
   - Click "Create Token"
   - Copy the token

2. **Login with token:**
   ```bash
   railway login --browserless
   # Paste your token when prompted
   ```

   OR set token directly:
   ```bash
   export RAILWAY_TOKEN="your-token-here"
   railway whoami  # Verify login
   ```

### Option B: Use Helper Script

```bash
bash scripts/railway-login-with-token.sh YOUR_TOKEN
```

## Step 2: Link or Create Project

**Link existing project:**
```bash
railway link
```

**Create new project:**
```bash
railway init
```

## Step 3: Add PostgreSQL Database

```bash
railway add postgresql
```

This automatically sets `DATABASE_URL` environment variable.

## Step 4: Set Environment Variables

```bash
# Generate NextAuth secret
SECRET=$(openssl rand -base64 32)

# Set required variables
railway variables set NEXTAUTH_SECRET="$SECRET"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"
railway variables set PLAYWRIGHT_BROWSERS_PATH="/app/node_modules/playwright/.local-browsers"
```

**Note:** Replace `your-app.railway.app` with your actual Railway URL (check after first deploy).

## Step 5: Run Database Migrations

```bash
# Generate Prisma client
railway run npm run db:generate

# Push schema to database
railway run npm run db:push

# Or run migrations
railway run npm run db:migrate:deploy

# Seed database (optional)
railway run npm run db:seed
```

## Step 6: Deploy

```bash
railway up
```

## Verify Everything Works

```bash
# Check login status
railway whoami

# Check project status
railway status

# View environment variables
railway variables

# View logs
railway logs --tail
```

## Troubleshooting

### Not logged in
```bash
railway login --browserless
# Or use token: export RAILWAY_TOKEN="your-token"
```

### Project not linked
```bash
railway link
```

### DATABASE_URL not set
```bash
railway add postgresql
```

### Check Railway service status
```bash
railway status
railway logs --tail
```

## Next Steps

After successful deployment:

1. ✅ Test the application URL
2. ✅ Verify database connection
3. ✅ Test user registration/login
4. ✅ Create a test
5. ✅ Run a test execution
6. ✅ Check test reports

## Useful Commands

```bash
# View all Railway commands
railway --help

# View project info
railway status

# View logs
railway logs

# Open Railway dashboard
railway open

# Connect to database
railway connect postgresql

# View variables
railway variables

# Set variable
railway variables set KEY="value"

# Get variable
railway variables get KEY
```
