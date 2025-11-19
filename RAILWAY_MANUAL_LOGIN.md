# Railway Manual Login Instructions

## Current Situation

Railway CLI requires **interactive mode** for login, which is not available in this environment. The token provided (`7af6d306-6acc-492d-a168-de512c6b4ac7`) is also not recognized as a valid user authentication token.

## Solution: Manual Login Required

You need to login to Railway CLI **manually** on your local machine or in an interactive terminal.

### Step 1: Get a Valid User Token

1. Go to: https://railway.app/account/tokens
2. Click **"Create Token"**
3. Select **"User Token"** (not Project Token)
4. Give it a name (e.g., "CLI Access")
5. **Copy the token immediately** (you'll only see it once!)

### Step 2: Login on Your Machine

**Option A: Interactive Login (Easiest)**
```bash
railway login
```
This will open your browser for authentication.

**Option B: Browserless Login with Token**
```bash
railway login --browserless
# Paste your token when prompted
```

**Option C: Set Token as Environment Variable**
```bash
export RAILWAY_TOKEN="your-token-here"
railway whoami  # Verify login works
```

### Step 3: Link Project

After logging in:
```bash
# Link existing project
railway link

# OR create new project
railway init
```

### Step 4: Set Up Database

```bash
# Add PostgreSQL database
railway add postgresql

# This automatically sets DATABASE_URL
```

### Step 5: Set Environment Variables

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

### Step 6: Run Database Migrations

```bash
railway run npm run db:generate
railway run npm run db:push
railway run npm run db:seed  # Optional
```

### Step 7: Deploy

```bash
railway up
```

## Alternative: Use Railway Dashboard

If CLI login is not possible, you can:

1. **Use Railway Dashboard**: https://railway.app
   - Manage projects
   - Set environment variables
   - View logs
   - Deploy via GitHub integration

2. **Use Railway API**: Direct API calls with your token
   - API Docs: https://docs.railway.app/reference/api

## Verify Setup

After manual login and setup:

```bash
railway whoami      # Should show your username
railway status      # Should show project status
railway variables   # Should show environment variables
railway logs        # Should show deployment logs
```

## Troubleshooting

### Token Not Working
- Make sure it's a **User Token**, not Project Token
- Check token hasn't expired at https://railway.app/account/tokens
- Create a new token if needed

### Still Can't Login
- Try: `railway logout` then `railway login` again
- Check Railway status: https://status.railway.app
- Verify Railway CLI version: `railway --version`

## Next Steps After Login

Once you're logged in manually:

1. ✅ Link/create project
2. ✅ Add PostgreSQL database  
3. ✅ Set environment variables
4. ✅ Run database migrations
5. ✅ Deploy application
6. ✅ Test the deployment
