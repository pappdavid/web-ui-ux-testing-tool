# Railway Deployment Guide

## Quick Start

### Step 1: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with Railway.

### Step 2: Initialize Project

```bash
railway init
```

Choose:
- **"Create a new project"** (or select existing)
- **"Empty project"** 
- Connect your GitHub repository (optional but recommended)

### Step 3: Add PostgreSQL Database

```bash
railway add postgresql
```

This automatically:
- Creates a PostgreSQL database
- Sets `DATABASE_URL` environment variable
- Links it to your project

### Step 4: Set Environment Variables

```bash
# Generate a secret
openssl rand -base64 32

# Set environment variables
railway variables set NEXTAUTH_SECRET="your-generated-secret-here"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"
```

**Note**: Replace `your-generated-secret-here` with the output from `openssl rand -base64 32`
**Note**: Replace `your-app.railway.app` with your actual Railway URL (you'll get this after first deploy)

### Step 5: Deploy

```bash
railway up
```

Railway will:
- Detect your Dockerfile automatically
- Build the Docker image
- Deploy your application
- Provide you with a URL

### Step 6: Get Your App URL

```bash
railway domain
```

Or check the Railway dashboard: https://railway.app

### Step 7: Run Database Migrations

```bash
railway run npx prisma migrate deploy
```

### Step 8: Seed Database (Optional)

```bash
railway run npm run db:seed
```

---

## Using the Automated Script

For an interactive guided setup:

```bash
bash scripts/deploy-railway.sh
```

This script will guide you through all the steps above.

---

## Manual Deployment Steps

### 1. Login
```bash
railway login
```

### 2. Initialize
```bash
railway init
```

### 3. Add Database
```bash
railway add postgresql
```

### 4. Set Variables
```bash
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"
```

### 5. Deploy
```bash
railway up
```

### 6. Get URL and Update NEXTAUTH_URL
```bash
# Get your URL
railway domain

# Update NEXTAUTH_URL with your actual URL
railway variables set NEXTAUTH_URL="https://your-actual-url.railway.app"
```

### 7. Run Migrations
```bash
railway run npx prisma migrate deploy
```

---

## Railway Commands Reference

```bash
# View project status
railway status

# View logs
railway logs

# Open app in browser
railway open

# View environment variables
railway variables

# Run a command in Railway environment
railway run <command>

# View deployment logs
railway logs --deploy

# Connect to database
railway connect postgresql
```

---

## Troubleshooting

### Build Fails
- Check Railway logs: `railway logs`
- Verify Dockerfile is correct
- Ensure all dependencies are in package.json

### Database Connection Issues
- Verify `DATABASE_URL` is set: `railway variables`
- Check database is running: `railway status`
- Test connection: `railway run npx prisma db pull`

### Playwright Not Working
- ✅ Should work perfectly in Docker!
- Check logs for browser launch errors
- Verify Playwright browsers are installed in Dockerfile

### Environment Variables Not Set
- List variables: `railway variables`
- Set missing ones: `railway variables set KEY="value"`
- Redeploy: `railway up`

---

## Post-Deployment Checklist

- [ ] App is accessible at Railway URL
- [ ] Database migrations ran successfully
- [ ] Can register a new user
- [ ] Can log in
- [ ] Can create a test
- [ ] Can run a test (Playwright should work!)
- [ ] Screenshots are saved
- [ ] Check Railway dashboard for usage/monitoring

---

## Cost

Railway offers:
- **Free tier**: $5 credit/month
- **Pay-as-you-go**: After free tier
- **Estimated cost**: $5-20/month for this app

---

## Next Steps

1. **Set up custom domain** (optional):
   ```bash
   railway domain add your-domain.com
   ```

2. **Set up monitoring**:
   - Railway dashboard provides built-in monitoring
   - Check logs: `railway logs`

3. **Configure backups**:
   - Railway PostgreSQL has automatic backups
   - Check Railway dashboard for backup settings

4. **Set up CI/CD** (optional):
   - Connect GitHub repo for auto-deploy
   - Railway will auto-deploy on push to main branch

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Dashboard: https://railway.app
- Railway Discord: https://discord.gg/railway

