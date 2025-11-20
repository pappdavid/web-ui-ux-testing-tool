# Railway Auto-Deploy Setup from GitHub Main

## Current Status

✅ **Code pushed to GitHub**: `feat-test-deployed-B7lMb` branch  
✅ **Main branch exists**: Already in repository  
✅ **Railway project linked**: `abundant-laughter` project

## Setup Auto-Deploy from GitHub Main

### Option 1: Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**:
   - Visit: https://railway.app
   - Login to your account
   - Select project: `abundant-laughter`

2. **Connect GitHub Repository**:
   - Go to **Settings** → **Source**
   - Click **Connect GitHub**
   - Select repository: `pappdavid/web-ui-ux-testing-tool`
   - Select branch: `main`
   - Enable **Auto-Deploy**: ✅

3. **Configure Build Settings**:
   - Railway will auto-detect `Dockerfile`
   - Build command: (auto-detected)
   - Start command: `node server.js` (from railway.json)

4. **Verify Environment Variables**:
   - Go to **Variables** tab
   - Ensure these are set:
     - `DATABASE_URL` (from PostgreSQL service)
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`
     - `STORAGE_PATH=/app/storage`
     - `OPENAI_API_KEY`
     - `PLAYWRIGHT_BROWSERS_PATH=/app/.playwright`

### Option 2: Railway CLI

If Railway CLI supports GitHub connection:

```bash
# Link GitHub repository (if not already linked)
railway link --github pappdavid/web-ui-ux-testing-tool

# Set branch to main
railway variables set RAILWAY_GITHUB_BRANCH=main
```

**Note**: Railway CLI GitHub linking may require dashboard setup first.

## Verify Auto-Deploy is Working

1. **Make a test commit**:
   ```bash
   git checkout main
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test: Verify auto-deploy"
   git push origin main
   ```

2. **Check Railway Dashboard**:
   - Go to **Deployments** tab
   - You should see a new deployment starting automatically
   - Wait for build to complete (~2-5 minutes)

3. **Verify Deployment**:
   ```bash
   ./scripts/verify-deployment-and-test.sh
   ```

## Current Deployment Status

- **Project**: `abundant-laughter`
- **Service**: `web-ui-ux-testing-tool`
- **URL**: `https://web-ui-ux-testing-tool-production.up.railway.app`
- **Health**: ✅ OK
- **Database**: ✅ Connected

## Testing All Functions

After auto-deploy is set up, run comprehensive tests:

```bash
export TEST_URL=https://web-ui-ux-testing-tool-production.up.railway.app
npx tsx scripts/test-all-features-webinform.ts
```

This will test:
- ✅ Registration & Login
- ✅ AI Test Generation (OpenAI)
- ✅ Dashboard Access
- ✅ Test Creation
- ✅ Step Management
- ✅ Test Execution
- ✅ Results & Logging
- ✅ Visual Regression

## Troubleshooting

### If Auto-Deploy Doesn't Work

1. **Check Railway Dashboard**:
   - Settings → Source
   - Ensure GitHub repo is connected
   - Ensure branch is set to `main`
   - Ensure Auto-Deploy is enabled

2. **Check GitHub Webhooks**:
   - Railway should have created a webhook
   - Check GitHub repo → Settings → Webhooks
   - Should see Railway webhook

3. **Manual Trigger**:
   - Railway Dashboard → Deployments → Redeploy
   - Or: `railway up` from CLI

### If Tests Fail

1. **Check Browser Launch**:
   - Verify `PLAYWRIGHT_BROWSERS_PATH` is set
   - Check Railway logs for browser errors
   - Ensure browsers are installed in Dockerfile

2. **Check Database**:
   - Verify `DATABASE_URL` is set
   - Check database connection in Railway
   - Run migrations if needed: `railway run npx prisma migrate deploy`

## Next Steps

1. ✅ Push code to GitHub main branch
2. ⏳ Configure Railway auto-deploy (via dashboard)
3. ✅ Verify deployment
4. ✅ Run comprehensive browser tests

---

**Status**: Ready for auto-deploy setup  
**Action Required**: Configure GitHub connection in Railway Dashboard

