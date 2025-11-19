# Railway Login Instructions

Since we're in a non-interactive environment, you'll need to use browserless login with a token.

## Step 1: Get Railway Token

1. Go to: https://railway.app/account/tokens
2. Click "Create Token"
3. Give it a name (e.g., "CLI Access")
4. Copy the token (you'll only see it once!)

## Step 2: Login with Token

Once you have the token, run:

```bash
railway login --browserless
```

When prompted, paste your token.

## Alternative: Set Token Directly

You can also set the token as an environment variable:

```bash
export RAILWAY_TOKEN="your-token-here"
railway whoami  # Verify it works
```

## After Login

Once logged in, you can:

```bash
# Check login status
railway whoami

# Link to existing project
railway link

# Or create new project
railway init

# Add PostgreSQL database
railway add postgresql

# View variables
railway variables

# Deploy
railway up
```

## Quick Setup Script

After logging in, you can run:

```bash
bash scripts/railway-connect.sh
```

This will help you:
- Verify login
- Link/create project
- Check database setup
- View environment variables
