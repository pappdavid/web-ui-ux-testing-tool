# Deploy to Railway and RunPod - Step by Step

## Current Status

✅ Code complete and tested
✅ Database migrations ready
✅ Internal API token generated: `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

---

## Part 1: Deploy Main App to Railway

### Option A: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Select project: "abundant-laughter"

2. **Deploy from GitHub** (if not already deployed)
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect Next.js and deploy

3. **Set Environment Variables**
   - Go to your service → "Variables" tab
   - Add these variables:

   ```
   DATABASE_URL=<your-postgres-connection-string>
   NEXTAUTH_SECRET=<your-nextauth-secret>
   NEXTAUTH_URL=<your-railway-domain>
   RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
   PLAYWRIGHT_BROWSERS_PATH=./.playwright
   STORAGE_PATH=./storage
   ```

4. **Trigger Deployment**
   - Click "Deploy" or commit to GitHub
   - Wait for build to complete
   - Check logs for any errors

### Option B: Via Railway CLI

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Link to your Railway project
railway link

# Set the internal API token
railway variables set RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

# Deploy
railway up
```

---

## Part 2: Build and Push Agent Worker Docker Image

I'll now build the Docker image for you.

**Docker Hub Username:** You need to provide your Docker Hub username

