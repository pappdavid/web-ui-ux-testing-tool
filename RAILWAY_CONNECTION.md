# Railway CLI Connection Guide

## Quick Connection Steps

### 1. Login to Railway

```bash
railway login
```

This will open your browser for authentication. If you're in a headless environment, you can use:

```bash
railway login --browserless
```

You'll need to get a token from: https://railway.app/account/tokens

### 2. Link or Create Project

**Link existing project:**
```bash
railway link
```

**Create new project:**
```bash
railway init
```

Choose:
- "Create a new project" or select existing
- "Empty project" 
- Connect GitHub repository (optional)

### 3. Add PostgreSQL Database

```bash
railway add postgresql
```

This automatically:
- Creates a PostgreSQL database
- Sets `DATABASE_URL` environment variable
- Links it to your project

### 4. Set Environment Variables

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

**Note**: Replace `your-app.railway.app` with your actual Railway URL (check after first deploy)

### 5. Verify Connection

```bash
# Check login status
railway whoami

# Check project status
railway status

# View environment variables
railway variables

# View DATABASE_URL (masked)
railway variables get DATABASE_URL
```

### 6. Run Database Migrations

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

### 7. Deploy

```bash
# Deploy to Railway
railway up

# Or deploy from current branch
railway up --detach
```

## Useful Railway Commands

```bash
# View logs
railway logs

# Open Railway dashboard
railway open

# View service status
railway status

# Connect to database
railway connect postgresql

# View all variables
railway variables

# Set variable
railway variables set KEY="value"

# Get variable value
railway variables get KEY

# Remove variable
railway variables unset KEY
```

## Troubleshooting

### Not logged in
```bash
railway login
```

### Project not linked
```bash
railway link
# Select your project from the list
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

## Quick Setup Script

Run the automated setup script:

```bash
bash scripts/railway-connect.sh
```

This will guide you through:
- Installing Railway CLI (if needed)
- Logging in
- Linking/creating project
- Checking database setup
- Viewing environment variables

## Next Steps After Connection

1. ✅ Login to Railway CLI
2. ✅ Link/create project
3. ✅ Add PostgreSQL database
4. ✅ Set environment variables
5. ✅ Run database migrations
6. ✅ Deploy application
7. ✅ Test the deployment

## Railway Dashboard

Access your Railway dashboard at: https://railway.app

From there you can:
- View deployments
- Manage environment variables
- View logs
- Monitor resource usage
- Configure domains
- Manage team members
