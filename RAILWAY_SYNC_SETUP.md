# Railway Sync Setup Guide

Since you're logged in on your local machine, here's how to sync Railway access to this environment:

## Option 1: Copy Railway Token (Recommended)

On your local machine, copy the Railway token:

```bash
# On your local machine, get the token:
cat ~/.railway/token

# Then in this environment, set it:
export RAILWAY_TOKEN="your-token-here"
```

Or save it to a file:
```bash
echo "your-token-here" > ~/.railway/token
chmod 600 ~/.railway/token
```

## Option 2: Link Project Directly

If you have a project token, you can link directly:

```bash
railway link --project-token YOUR_PROJECT_TOKEN
```

## Option 3: Use Railway CLI from Local Machine

Run Railway commands from your local machine where you're logged in:

```bash
# From your local machine:
cd /path/to/this/project
railway link
railway add postgresql
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway up
```

## Quick Setup Commands

Once Railway is accessible:

```bash
# 1. Link project (if not already linked)
railway link

# 2. Check status
railway status

# 3. Add PostgreSQL database (if not already added)
railway add postgresql

# 4. View current variables
railway variables

# 5. Set required variables
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

# 6. Run database migrations
railway run npm run db:generate
railway run npm run db:push

# 7. Deploy
railway up
```

## Verify Setup

```bash
railway whoami      # Should show your username
railway status      # Should show project info
railway variables   # Should show DATABASE_URL and other vars
```
