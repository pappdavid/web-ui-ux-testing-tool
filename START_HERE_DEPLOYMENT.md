# 🚀 START HERE: Deployment Checklist

## Your Deployment Token

```
75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
```

Copy this - you'll need it for both Railway and RunPod.

---

## Quick Deployment Steps

### ✅ Step 1: Railway (5 minutes)

1. Go to https://railway.app/dashboard
2. Open project: "abundant-laughter"
3. Click your service → "Variables" tab
4. Add variable:
   - Name: `RAILWAY_INTERNAL_API_TOKEN`
   - Value: `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
5. Save and wait for redeploy

**✓ Verification:** Visit your Railway URL and check test edit page for "Cloud Agentic Recorder"

---

### ✅ Step 2: Build Docker Image (10 minutes)

**Prerequisites:** 
- Docker Desktop installed and running
- Docker Hub account (free at https://hub.docker.com)

**Commands:**
```bash
# Login to Docker Hub
docker login

# Build and push (replace YOUR_USERNAME with your Docker Hub username)
cd /Users/davidpapp/WebApp_Tester_2000
./scripts/build-agent-worker.sh YOUR_USERNAME

# Example:
# ./scripts/build-agent-worker.sh davidpapp
```

**✓ Verification:** Image appears in your Docker Hub repositories

---

### ✅ Step 3: RunPod (5 minutes)

1. Go to https://www.runpod.io
2. Click "Deploy" → "Deploy a Container"
3. Settings:
   - **Image:** `YOUR_USERNAME/agent-worker:latest`
   - **Type:** CPU (4 vCPU, 8GB RAM recommended)
   - **Disk:** 20GB

4. **Environment Variables:**
   ```
   RAILWAY_API_BASE_URL=https://your-railway-url.up.railway.app
   RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
   OPENAI_API_KEY=sk-proj-YOUR_KEY
   OPENAI_MODEL=gpt-4o-mini
   PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
   ```

5. Click "Deploy"

**✓ Verification:** Check pod logs for "Agent Worker Starting" message

---

### ✅ Step 4: Test (2 minutes)

1. Go to your Railway app
2. Edit any test
3. Find "Cloud Agentic Recorder"
4. Enter: "Navigate to the homepage and take a screenshot"
5. Click "Start Cloud Agent Exploration"
6. Watch status change: pending → running → completed
7. Click "Compile trace to steps"
8. See steps with 🤖 Agent badge

**✓ Done!**

---

## If Docker is Not Installed

**Install Docker Desktop:**
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Linux: https://docs.docker.com/engine/install/

Then return to Step 2.

---

## Alternative: Test Locally First

**Before deploying to RunPod, test locally:**

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Copy template
cp agent.env.example .env.local

# Edit .env.local - add your OpenAI key

# Make sure Railway app is deployed and running

# Run worker locally
./scripts/test-agent-local.sh
```

This lets you verify everything works before spending money on RunPod.

---

## Need Help?

**Step-by-step guide:** [DEPLOYMENT_INSTRUCTIONS_FINAL.md](DEPLOYMENT_INSTRUCTIONS_FINAL.md)

**Quick start:** [QUICK_START_AGENT.md](QUICK_START_AGENT.md)

**Full docs:** [docs/AGENTIC_BROWSER_RUNPOD.md](docs/AGENTIC_BROWSER_RUNPOD.md)

---

## Troubleshooting

**"Token not found"**
- Check token matches exactly in Railway AND RunPod
- No extra spaces or newlines

**"Docker command not found"**
- Install Docker Desktop
- Make sure it's running

**"Worker not picking up sessions"**
- Check Railway URL has `https://`
- Verify Railway app is deployed
- Check RunPod logs for errors

**"OpenAI API error"**
- Verify API key is valid
- Check OpenAI account has credits
- Get key from: https://platform.openai.com/api-keys

---

## Cost Estimate

**RunPod:** ~$0.25/hour = $180/month (24/7)  
**OpenAI:** ~$0.01-0.02 per session  
**Railway:** No additional cost

**💡 Save money:** Use RunPod spot instances (50% off) and stop pod when not testing

---

## You're Ready!

1. ✅ Set Railway token (5 min)
2. ✅ Build Docker image (10 min)
3. ✅ Deploy to RunPod (5 min)
4. ✅ Test it works (2 min)

**Total time: ~22 minutes** 🎉

