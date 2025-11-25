# 🚂 Deploy to Railway via CLI

## Quick Start

Since Railway CLI requires interactive authentication, follow these steps:

### Step 1: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with Railway.

### Step 2: Run Automated Deployment

After login, run the automated deployment script:

```bash
bash scripts/deploy-railway-auto.sh
```

This script will:
- ✅ Check Railway authentication
- ✅ Initialize or link Railway project
- ✅ Add PostgreSQL database
- ✅ Set environment variables
- ✅ Deploy your application
- ✅ Run database migrations
- ✅ Seed the database

---

## Manual Deployment Steps

If you prefer to run commands manually:

### 1. Login
```bash
railway login
```

### 2. Initialize Project
```bash
railway init
```
Choose:
- **"Create a new project"** (or select existing)
- **"Empty project"** or connect GitHub repo

### 3. Add PostgreSQL
```bash
railway add postgresql
```

### 4. Set Environment Variables
```bash
railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"
```

### 5. Deploy
```bash
railway up
```

### 6. Get URL and Set NEXTAUTH_URL
```bash
# Get your URL
railway domain

# Set NEXTAUTH_URL (replace with your actual URL)
railway variables set NEXTAUTH_URL="https://your-app.up.railway.app"
```

### 7. Run Migrations
```bash
railway run npx prisma migrate deploy
```

### 8. Seed Database
```bash
railway run npm run db:seed
```

---

## Using the Provided Token

The token `609b0c57-a91e-47bd-9a13-1fdfd84797b7` appears to be a **project token**.

Project tokens are used for:
- CI/CD deployments
- Automated scripts
- Project-specific access

To use it:

1. **Via Railway Dashboard**:
   - Go to Railway project settings
   - Use the token in CI/CD pipelines
   - Or use Railway's API directly

2. **Via Railway CLI**:
   - First login with `railway login` (interactive)
   - Then link to the project using the token
   - Or use Railway API with the token

---

## Railway API Usage (Advanced)

If you want to use the Railway API directly with the token:

```bash
export RAILWAY_TOKEN="609b0c57-a91e-47bd-9a13-1fdfd84797b7"

# Railway GraphQL API
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d '{"query": "{ projects { edges { node { id name } } } }"}'
```

---

## Troubleshooting

### "Unauthorized" Error
- Run `railway login` first
- Railway CLI requires interactive browser authentication

### Token Not Working
- The token format suggests it's a project token
- Use `railway login` for account-level access
- Project tokens work with Railway API, not CLI directly

### Deployment Fails
- Check logs: `railway logs`
- Verify Dockerfile exists (✅ already configured)
- Check environment variables: `railway variables`

### Database Connection Issues
- Verify PostgreSQL is added: `railway status`
- Check DATABASE_URL: `railway variables`
- Database is auto-linked when you add PostgreSQL service

---

## Post-Deployment

After successful deployment:

1. **Test your app**:
   - Visit your Railway URL
   - Register a new user
   - Login with: `test@example.com` / `password123`

2. **Monitor**:
   - View logs: `railway logs`
   - Open dashboard: `railway open`
   - Check status: `railway status`

3. **Update**:
   - Push to GitHub (if connected)
   - Railway will auto-deploy
   - Or run `railway up` manually

---

## Useful Railway Commands

```bash
# View project status
railway status

# View logs
railway logs

# Open in browser
railway open

# View environment variables
railway variables

# Run a command
railway run <command>

# Connect to database
railway connect postgresql

# View deployments
railway logs --deploy
```

---

## Next Steps

1. ✅ Login: `railway login`
2. ✅ Deploy: `bash scripts/deploy-railway-auto.sh`
3. ✅ Test your deployed app
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring/alerts

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Dashboard: https://railway.app
- Railway Discord: https://discord.gg/railway

