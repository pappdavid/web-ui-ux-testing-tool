# Complete Deployment Instructions - Railway + RunPod

## 🎯 Current Status

✅ All code implemented and tested  
✅ Build successful (no errors)  
✅ Database migrations ready  
✅ Documentation complete  
✅ Internal API Token Generated  

**Your Token:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

---

## 📋 Prerequisites

- [ ] Railway account with project "abundant-laughter"
- [ ] OpenAI API key
- [ ] Docker installed (for RunPod deployment)
- [ ] Docker Hub account (free)
- [ ] RunPod account with credits

---

## Part 1: Railway Deployment (Main App)

### Step 1.1: Set Environment Variable via Railway Dashboard

1. **Open Railway Dashboard**
   ```
   https://railway.app/dashboard
   ```

2. **Navigate to your project:**
   - Project: "abundant-laughter"
   - Click on your service (Next.js app)

3. **Go to Variables tab**

4. **Add new variable:**
   - Click "+ New Variable"
   - **Name:** `RAILWAY_INTERNAL_API_TOKEN`
   - **Value:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
   - Click "Add"

5. **Verify other variables are set:**
   - `DATABASE_URL` (your PostgreSQL connection)
   - `NEXTAUTH_SECRET` (your auth secret)
   - `NEXTAUTH_URL` (your Railway domain)

6. **Deploy:**
   - Railway will automatically redeploy
   - Or click "Deploy" button
   - Wait for deployment to complete

### Step 1.2: Verify Railway Deployment

1. **Check deployment logs** for errors
2. **Visit your Railway URL** (should be something like `https://abundant-laughter-production.up.railway.app`)
3. **Test login** to verify app works
4. **Go to a test edit page** and look for "Cloud Agentic Recorder" section

---

## Part 2: Build Agent Worker Docker Image

### Step 2.1: Install Docker (if not installed)

**On macOS:**
```bash
# Download Docker Desktop from:
https://www.docker.com/products/docker-desktop

# Or via Homebrew:
brew install --cask docker
```

**Start Docker Desktop** and wait for it to be running.

### Step 2.2: Login to Docker Hub

```bash
# Create account at https://hub.docker.com if you don't have one

# Login
docker login
# Enter your Docker Hub username and password
```

### Step 2.3: Build and Push Worker Image

**Replace `YOUR_DOCKERHUB_USERNAME` with your actual username:**

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Build the image (this takes 5-10 minutes)
docker build -f src/agentWorker/Dockerfile -t YOUR_DOCKERHUB_USERNAME/agent-worker:latest .

# Example:
# docker build -f src/agentWorker/Dockerfile -t davidpapp/agent-worker:latest .

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/agent-worker:latest
```

**Or use the helper script:**
```bash
./scripts/build-agent-worker.sh YOUR_DOCKERHUB_USERNAME
```

---

## Part 3: Deploy to RunPod

### Step 3.1: Create RunPod Account

1. Go to https://www.runpod.io
2. Sign up for an account
3. Add credits (minimum $10 recommended)

### Step 3.2: Deploy Container

1. **Click "Deploy"** in RunPod dashboard

2. **Select "Deploy a Container"**

3. **Configure Container:**

   **Container Image:**
   ```
   YOUR_DOCKERHUB_USERNAME/agent-worker:latest
   ```

   **Container Disk:**
   - Set to 20GB minimum

   **Select Pod Type:**
   - Choose **CPU** (not GPU - Playwright doesn't need GPU)
   - Recommended: 4 vCPU, 8GB RAM
   - Or minimum: 2 vCPU, 4GB RAM

4. **Set Environment Variables:**

   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `RAILWAY_API_BASE_URL` | Your Railway URL (e.g., `https://abundant-laughter-production.up.railway.app`) |
   | `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
   | `OPENAI_API_KEY` | Your OpenAI API key (starts with `sk-proj-`) |
   | `OPENAI_MODEL` | `gpt-4o-mini` |
   | `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |

5. **Deploy:**
   - Click "Deploy"
   - Wait for pod to start (1-2 minutes)

### Step 3.3: Verify Worker is Running

1. **Click on your pod** in RunPod dashboard

2. **Go to "Logs" tab**

3. **You should see:**
   ```
   ============================================================
   Agent Worker Starting
   ============================================================
   [AgentWorker] Railway API: https://your-app.railway.app
   [AgentWorker] OpenAI Model: gpt-4o-mini
   [AgentWorker] Starting polling mode...
   [AgentWorker] Polling interval: 10000ms
   [AgentWorker] Checking for pending sessions...
   [AgentWorker] No pending sessions found
   ```

4. **If you see errors:**
   - Check environment variables are set correctly
   - Verify `RAILWAY_INTERNAL_API_TOKEN` matches exactly
   - Ensure Railway URL has `https://`
   - Check OpenAI API key is valid

---

## Part 4: Test the Complete System

### Step 4.1: Create an Agent Session

1. **Go to your Railway app URL**

2. **Login** with your credentials

3. **Navigate to any test** and click "Edit"

4. **Find "Cloud Agentic Recorder" section**

5. **Enter a scenario:**
   ```
   Navigate to the homepage and take a screenshot
   ```

6. **Click "Start Cloud Agent Exploration"**

### Step 4.2: Monitor Progress

1. **In the UI:**
   - Session status will show "pending"
   - Then change to "running" (when worker picks it up)
   - Finally "completed" (when done)
   - Page auto-refreshes every 5 seconds

2. **In RunPod logs:**
   ```
   [AgentWorker] Found 1 pending session(s)
   [AgentWorker] Processing session: clxxxxx
   [AgentWorker] Starting session clxxxxx
   [AgentWorker] Launching browser...
   [AgentWorker] Iteration 1/30
   [AgentWorker] Tool: open_page {"url":"https://..."}
   [AgentWorker] Result: Successfully navigated to...
   [AgentWorker] Tool: screenshot
   [AgentWorker] Tool: complete_scenario
   [AgentWorker] Session clxxxxx completed successfully
   ```

### Step 4.3: Compile and Run Test

1. **When status shows "completed"**

2. **Click "Compile trace to steps"**

3. **Check StepBuilder:**
   - You should see new steps
   - Each has a 🤖 Agent badge
   - Steps are editable

4. **Run the test:**
   - Click "Run Test" button
   - Test should execute successfully

---

## ✅ Verification Checklist

### Railway
- [ ] Environment variable `RAILWAY_INTERNAL_API_TOKEN` is set
- [ ] App is deployed and accessible
- [ ] Can login and access test edit page
- [ ] "Cloud Agentic Recorder" section is visible

### RunPod
- [ ] Docker image built and pushed to Docker Hub
- [ ] Pod is running (green status)
- [ ] Logs show "Agent Worker Starting"
- [ ] Worker is polling every 10 seconds
- [ ] No error messages in logs

### Integration
- [ ] Can create agent session from UI
- [ ] Session status changes from pending → running → completed
- [ ] RunPod logs show session processing
- [ ] Can compile trace to steps
- [ ] Steps appear with 🤖 Agent badge
- [ ] Can run compiled test successfully

---

## 🚨 Troubleshooting

### "Token not found" or 401 Errors

**Problem:** Worker can't authenticate with Railway

**Solution:**
1. Verify `RAILWAY_INTERNAL_API_TOKEN` is set in Railway
2. Verify same token is set in RunPod
3. Check for typos or extra spaces
4. Ensure token is exactly: `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

### Worker Not Picking Up Sessions

**Problem:** Sessions stay in "pending" status

**Solution:**
1. Check RunPod logs for errors
2. Verify `RAILWAY_API_BASE_URL` has `https://`
3. Ensure Railway app is deployed and accessible
4. Check RunPod pod is running (not stopped)

### OpenAI API Errors

**Problem:** Worker fails with OpenAI errors

**Solution:**
1. Verify OpenAI API key is valid (get from https://platform.openai.com/api-keys)
2. Check OpenAI account has credits
3. Try `gpt-4o-mini` instead of `gpt-4o` (10x cheaper)
4. Check rate limits on OpenAI dashboard

### Playwright/Browser Errors

**Problem:** Worker crashes with browser errors

**Solution:**
1. Increase RunPod RAM to 8GB minimum
2. Verify `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`
3. Check Docker image was built correctly
4. Try restarting the pod

### Docker Build Fails

**Problem:** Can't build Docker image

**Solution:**
1. Ensure Docker Desktop is running
2. Check you have enough disk space (need ~5GB)
3. Try building with `--no-cache`:
   ```bash
   docker build --no-cache -f src/agentWorker/Dockerfile -t username/agent-worker:latest .
   ```

---

## 💰 Cost Estimates

### RunPod (24/7)
- **4 vCPU, 8GB RAM:** ~$0.25/hour = ~$180/month
- **2 vCPU, 4GB RAM:** ~$0.15/hour = ~$108/month
- **With spot instances:** 50% discount

### OpenAI
- **gpt-4o-mini:** $0.01-0.02 per session
- **100 sessions/month:** ~$1-2

### Railway
- No additional cost for agent APIs
- Standard plan includes database & app

**Total estimate:** $110-185/month for 24/7 operation

**💡 Cost Optimization:**
- Use RunPod spot instances
- Use gpt-4o-mini (not gpt-4o)
- Stop RunPod pod when not actively testing
- Scale down during off-hours

---

## 📞 Support Resources

- **Quick Start:** [QUICK_START_AGENT.md](QUICK_START_AGENT.md)
- **Full Docs:** [docs/AGENTIC_BROWSER_RUNPOD.md](docs/AGENTIC_BROWSER_RUNPOD.md)
- **Architecture:** [RUNPOD_AGENTIC_BROWSER_IMPLEMENTATION.md](RUNPOD_AGENTIC_BROWSER_IMPLEMENTATION.md)
- **Worker README:** [src/agentWorker/README.md](src/agentWorker/README.md)

---

## 🎉 Next Steps

Once everything is verified:

1. **Test with real scenarios:**
   - Login flows
   - Form submissions
   - Multi-page workflows

2. **Monitor and optimize:**
   - Check costs daily
   - Review OpenAI token usage
   - Optimize scenario prompts

3. **Scale as needed:**
   - Add more RunPod workers for parallel processing
   - Use spot instances for cost savings
   - Adjust worker RAM/CPU based on usage

---

## 🔐 Security Reminder

⚠️ **Never commit these to git:**
- `RAILWAY_INTERNAL_API_TOKEN`
- `OPENAI_API_KEY`
- Database credentials

✅ **Always use:**
- Environment variables only
- Separate tokens for dev/prod
- Rotate tokens if compromised

---

## Summary Command Reference

```bash
# Railway - Set token (via dashboard is easier)
railway variables set RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

# Docker - Build and push
./scripts/build-agent-worker.sh YOUR_DOCKERHUB_USERNAME

# Or manually:
docker build -f src/agentWorker/Dockerfile -t YOUR_DOCKERHUB_USERNAME/agent-worker:latest .
docker push YOUR_DOCKERHUB_USERNAME/agent-worker:latest

# Test locally first (optional)
cp agent.env.example .env.local
# Edit .env.local with your OpenAI key
./scripts/test-agent-local.sh
```

**You're ready to deploy! Start with Railway, then build Docker image, then deploy to RunPod.** 🚀

