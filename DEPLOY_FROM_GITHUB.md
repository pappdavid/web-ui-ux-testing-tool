# Deploy Agent Worker from GitHub to RunPod

## Overview

This guide shows you how to deploy the agent worker to RunPod directly from GitHub, without needing Docker Hub.

**Benefits:**
- ✅ No Docker Hub account needed
- ✅ Automated builds on every push
- ✅ Free GitHub Container Registry
- ✅ Simpler workflow

---

## Step 1: Enable GitHub Actions (One-time setup)

### 1.1 Make Container Registry Public

1. Go to your GitHub repository
2. After first push, go to: `https://github.com/YOUR_USERNAME?tab=packages`
3. Click on your `agent-worker` package
4. Click "Package settings" (on the right)
5. Scroll to "Danger Zone"
6. Click "Change visibility" → Select "Public"
7. Type the package name to confirm

**Why?** RunPod needs to pull the image without authentication.

### 1.2 Verify GitHub Actions is Enabled

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Actions" → "General"
4. Ensure "Allow all actions and reusable workflows" is selected
5. Save if you made changes

---

## Step 2: Push to GitHub (Triggers Build)

The GitHub Actions workflow will automatically build and push your Docker image when you push to the `main` branch.

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Commit the workflow file
git add .github/workflows/build-agent-worker.yml
git commit -m "Add GitHub Actions workflow for agent worker"

# Push to GitHub (triggers automatic build)
git push origin main
```

### Monitor the Build

1. Go to your GitHub repository
2. Click "Actions" tab
3. You'll see "Build Agent Worker" workflow running
4. Click on it to see progress (takes 5-10 minutes)
5. Once complete, you'll see your image name in the logs

**Your image will be:**
```
ghcr.io/YOUR_GITHUB_USERNAME/agent-worker:latest
```

---

## Step 3: Deploy to Railway (Set Token)

While the Docker image is building, let's set up Railway:

### Via Railway Dashboard (Recommended)

1. Go to https://railway.app/dashboard
2. Select project: "abundant-laughter"
3. Click your service → "Variables" tab
4. Add new variable:
   - **Name:** `RAILWAY_INTERNAL_API_TOKEN`
   - **Value:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
5. Click "Add" and wait for redeploy

### Via Railway CLI (Alternative)

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Link to Railway project
railway link

# Set the token
railway variables set RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

# Deploy latest changes
railway up
```

---

## Step 4: Deploy to RunPod

### 4.1 Create RunPod Account

1. Go to https://www.runpod.io
2. Sign up and add credits (~$10 minimum)

### 4.2 Configure Serverless Worker

1. **Click "Deploy"** in RunPod dashboard

2. **Select "Deploy a Container"**

3. **Container Configuration:**

   **Container Image:**
   ```
   ghcr.io/YOUR_GITHUB_USERNAME/agent-worker:latest
   ```
   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

   **Container Disk:** 20GB minimum

   **Pod Type:** CPU (not GPU)
   - Recommended: 4 vCPU, 8GB RAM (~$0.25/hr)
   - Minimum: 2 vCPU, 4GB RAM (~$0.15/hr)

4. **Environment Variables:**

   Click "Environment Variables" section and add:

   | Variable | Value |
   |----------|-------|
   | `RAILWAY_API_BASE_URL` | Your Railway URL (e.g., `https://abundant-laughter-production.up.railway.app`) |
   | `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
   | `OPENAI_API_KEY` | Your OpenAI API key (get from https://platform.openai.com/api-keys) |
   | `OPENAI_MODEL` | `gpt-4o-mini` |
   | `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |

   **To get your Railway URL:**
   - Go to Railway dashboard → Your service → Settings → Domains
   - Copy the Railway-provided domain

5. **Deploy:**
   - Click "Deploy" button
   - Wait for pod to start (~1-2 minutes)

---

## Step 5: Verify Deployment

### Check RunPod Logs

1. Click on your pod in RunPod dashboard
2. Go to "Logs" tab
3. You should see:
   ```
   ============================================================
   Agent Worker Starting
   ============================================================
   [AgentWorker] Railway API: https://your-app.railway.app
   [AgentWorker] OpenAI Model: gpt-4o-mini
   [AgentWorker] Starting polling mode...
   [AgentWorker] Checking for pending sessions...
   ```

### Test the System

1. Go to your Railway app URL
2. Login
3. Edit any test
4. Find "Cloud Agentic Recorder" section
5. Enter scenario:
   ```
   Navigate to the homepage and take a screenshot
   ```
6. Click "Start Cloud Agent Exploration"
7. Watch status change: pending → running → completed
8. Check RunPod logs to see worker processing
9. Click "Compile trace to steps"
10. Verify steps appear with 🤖 Agent badge

---

## Updating the Worker

Whenever you make changes to the agent worker code:

```bash
# Commit and push changes
git add .
git commit -m "Update agent worker"
git push origin main
```

GitHub Actions will automatically:
1. Build new Docker image
2. Push to GitHub Container Registry with `latest` tag

RunPod will:
1. Pull the new image on next restart
2. Or restart your pod manually to get latest image

**To force RunPod to update:**
1. Go to RunPod dashboard
2. Stop your pod
3. Start it again
4. It will pull the latest image

---

## Troubleshooting

### "Failed to pull image" Error

**Problem:** RunPod can't access your GitHub Container Registry

**Solution:**
1. Make sure package is set to **Public** (Step 1.1)
2. Verify image name is correct: `ghcr.io/YOUR_USERNAME/agent-worker:latest`
3. Check GitHub Actions build completed successfully

### GitHub Actions Build Fails

**Problem:** Workflow fails to build image

**Solution:**
1. Go to Actions tab on GitHub
2. Click on failed workflow
3. Review error logs
4. Common issues:
   - Syntax error in Dockerfile
   - Missing dependencies in package.json
   - Build context issues

### Worker Not Starting

**Problem:** Pod starts but worker doesn't run

**Solution:**
1. Check RunPod logs for errors
2. Verify all environment variables are set
3. Ensure `RAILWAY_INTERNAL_API_TOKEN` matches Railway
4. Check `OPENAI_API_KEY` is valid

### Token Authentication Errors

**Problem:** Worker can't authenticate with Railway

**Solution:**
1. Verify token is exactly: `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
2. Check Railway variable is set correctly
3. Ensure no extra spaces or newlines
4. Verify Railway URL has `https://`

---

## Manual Trigger Build (Optional)

If you want to rebuild without pushing code:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Build Agent Worker" workflow
4. Click "Run workflow" button
5. Select `main` branch
6. Click "Run workflow"

---

## Cost Optimization

### Use Spot Instances
- RunPod spot instances are ~50% cheaper
- May be interrupted but will restart automatically

### Scale Down When Not Testing
1. Stop RunPod pod when not in use
2. Start it only when needed
3. Worker will catch up on pending sessions

### Use Smaller Pod
- For light usage: 2 vCPU, 4GB RAM
- For heavy usage: 4 vCPU, 8GB RAM
- Scale up only if needed

---

## Architecture Summary

```
┌─────────────────┐
│   GitHub Repo   │
│   (Your Code)   │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│ GitHub Actions  │ Builds Docker image
│  (Auto Build)   │
└────────┬────────┘
         │ Push image
         ▼
┌─────────────────┐
│     GHCR        │ Stores Docker image
│ (Free Registry) │ ghcr.io/user/agent-worker:latest
└────────┬────────┘
         │ Pull image
         ▼
┌─────────────────┐
│     RunPod      │ Runs worker container
│   (Worker Pod)  │ Polls Railway every 10s
└────────┬────────┘
         │ API calls
         ▼
┌─────────────────┐
│    Railway      │ Manages sessions
│  (Main App)     │ Stores trace steps
└─────────────────┘
```

---

## Quick Command Reference

```bash
# Push changes to trigger build
git add .
git commit -m "Update worker"
git push origin main

# Set Railway token via CLI
railway link
railway variables set RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

# Deploy to Railway
railway up

# View GitHub Actions logs
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# View your Docker images
# Go to: https://github.com/YOUR_USERNAME?tab=packages
```

---

## Next Steps

✅ **Push workflow to GitHub** (triggers build)  
✅ **Make package public** (allows RunPod to pull)  
✅ **Set Railway token** (enables worker auth)  
✅ **Deploy to RunPod** (start worker)  
✅ **Test the system** (create agent session)

**Total setup time: ~15 minutes** (most of it is waiting for builds)

---

## Support

- **GitHub Actions Issues:** Check Actions tab → Workflow logs
- **RunPod Issues:** Check pod logs in dashboard
- **Railway Issues:** Check service logs
- **Integration Issues:** See [DEPLOYMENT_INSTRUCTIONS_FINAL.md](DEPLOYMENT_INSTRUCTIONS_FINAL.md)

**You're using the modern DevOps approach! 🚀**

