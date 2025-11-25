# 🚂 Railway Setup Instructions

## Quick Start

To enable automated fixing and deployment, you need to authenticate Railway CLI:

### Step 1: Authenticate Railway CLI

```bash
railway login
```

This will:
1. Open your browser
2. Prompt you to authenticate with Railway
3. Complete the authentication flow
4. Return to terminal when done

### Step 2: Verify Authentication

```bash
railway whoami
```

You should see your Railway username/email.

### Step 3: Link to Project

```bash
railway link 60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3
```

### Step 4: Run Automated Fix Script

```bash
bash scripts/fix-railway-env.sh
```

This will:
- ✅ Set all required environment variables
- ✅ Run database migrations
- ✅ Seed the database
- ✅ Trigger redeploy

### Step 5: Run Continuous Test Loop

```bash
bash scripts/master-test-fix-deploy.sh
```

This will:
- ✅ Test the app continuously
- ✅ Automatically fix issues
- ✅ Redeploy when needed
- ✅ Continue until all tests pass

## What Gets Fixed Automatically

Once Railway CLI is authenticated, the scripts will automatically:

1. **Set Environment Variables**:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `STORAGE_PATH`
   - `NODE_ENV`

2. **Run Database Migrations**:
   - `npx prisma migrate deploy`

3. **Seed Database**:
   - `npm run db:seed`

4. **Trigger Redeploy**:
   - `railway up`

5. **Test Continuously**:
   - Browser automation tests
   - API endpoint tests
   - Health checks

## Monitoring

### View Test Loop Logs
```bash
tail -f /tmp/railway-test-loop.log
```

### Check Railway Status
```bash
railway status
```

### View Railway Logs
```bash
railway logs
```

### Check Environment Variables
```bash
railway variables
```

## Manual Setup (Alternative)

If you prefer to set up manually via Railway Dashboard:

1. Go to: https://railway.app/project/60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3
2. Click your service → **Variables**
3. Add the variables listed in `AUTOMATED_TESTING.md`
4. Wait for auto-redeploy
5. Run migrations via Dashboard → Deployments → Run Command

## Current Status

- ✅ Test scripts created
- ✅ Health endpoint added
- ✅ Automated fix scripts ready
- ⏳ Waiting for Railway CLI authentication
- ⏳ Environment variables need to be set
- ⏳ Database migrations need to run

## Next Steps

1. **Authenticate**: `railway login`
2. **Run Fix Script**: `bash scripts/fix-railway-env.sh`
3. **Run Test Loop**: `bash scripts/master-test-fix-deploy.sh`

The scripts will handle the rest automatically!

