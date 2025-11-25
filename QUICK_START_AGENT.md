# Quick Start: Cloud Agentic Browser

Get your AI-powered test explorer running in 5 minutes!

## Prerequisites

- ✅ Next.js app running on Railway
- ✅ OpenAI API key
- ✅ Docker installed (for deployment)

## Option 1: Test Locally (Recommended First)

### 1. Copy Environment Template

```bash
cp agent.env.example .env.local
```

### 2. Edit .env.local

```bash
# Edit these values
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY
```

Keep the generated `RAILWAY_INTERNAL_API_TOKEN` as-is.

### 3. Start Your App

```bash
npm run dev
```

### 4. Run Worker in Another Terminal

```bash
./scripts/test-agent-local.sh
```

### 5. Test It!

1. Open http://localhost:3000
2. Login
3. Edit any test
4. Find "Cloud Agentic Recorder"
5. Enter: "Navigate to the homepage and take a screenshot"
6. Click "Start Cloud Agent Exploration"
7. Watch the worker logs!

---

## Option 2: Deploy to RunPod (Production)

### 1. Set Railway Environment Variable

```bash
# Go to Railway dashboard
# Variables tab > Add variable:
#   Name: RAILWAY_INTERNAL_API_TOKEN
#   Value: 75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
```

### 2. Build and Push Docker Image

```bash
# Replace 'your-username' with your Docker Hub username
./scripts/build-agent-worker.sh your-username

# Example:
# ./scripts/build-agent-worker.sh davidpapp
```

This will:
- Build the Docker image
- Push to Docker Hub
- Give you the image name to use in RunPod

### 3. Deploy on RunPod

1. Go to https://www.runpod.io
2. Click **Deploy** > **Deploy a Container**
3. Configure:

**Container Image:**
```
your-username/agent-worker:latest
```

**Pod Type:**
- CPU Pod (4vCPU, 8GB RAM recommended)

**Environment Variables:**
```
RAILWAY_API_BASE_URL=https://your-app.railway.app
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=sk-proj-YOUR_KEY
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

4. Click **Deploy**

### 4. Verify It's Running

Check RunPod logs for:
```
============================================================
Agent Worker Starting
============================================================
[AgentWorker] Starting polling mode...
[AgentWorker] Checking for pending sessions...
```

### 5. Test on Production

1. Go to your Railway app
2. Create/edit a test
3. Use Cloud Agentic Recorder
4. Monitor in RunPod logs

---

## Troubleshooting

### "Token not found" error
- Check RAILWAY_INTERNAL_API_TOKEN is set in both Railway AND RunPod
- Verify no extra spaces or newlines

### "OpenAI API error"
- Verify your OpenAI API key is valid
- Check you have credits in OpenAI account
- Try gpt-4o-mini instead of gpt-4o (cheaper)

### Worker not picking up sessions
- Check Railway logs for 401 errors
- Verify Railway app URL is correct
- Ensure token matches exactly

### Playwright errors
- RunPod pod needs at least 8GB RAM
- Check PLAYWRIGHT_BROWSERS_PATH is set correctly

---

## Cost Estimates

**RunPod:** ~$0.20-0.30/hour (CPU pod)
**OpenAI:** ~$0.01-0.02 per session (gpt-4o-mini)
**Railway:** No additional cost

**Tips to save money:**
- Use RunPod spot instances (50% cheaper)
- Use gpt-4o-mini instead of gpt-4o
- Stop RunPod pod when not in use
- Scale to zero in Railway when idle

---

## What It Does

1. **You describe a scenario** in natural language
2. **AI agent explores your app** using Playwright
3. **Records every action** (clicks, inputs, etc.)
4. **You compile to test steps** that can run repeatedly
5. **Steps are editable** just like manual steps

Example scenarios:
- "Login with test@example.com and create a new post"
- "Search for 'shoes', filter by size 10, add to cart"
- "Complete the checkout flow with test data"
- "Navigate through the settings and change preferences"

---

## Next Steps

✅ **Local Testing:** Run `./scripts/test-agent-local.sh`
✅ **Production:** Deploy to RunPod
✅ **Monitor:** Check logs and costs
✅ **Optimize:** Adjust prompts, scale workers

**Full Documentation:** See `docs/AGENTIC_BROWSER_RUNPOD.md` and `DEPLOYMENT_RUNPOD_AGENT.md`

---

## Security Reminder

⚠️ **Never commit sensitive tokens to git!**

The `RAILWAY_INTERNAL_API_TOKEN` is already generated for you:
```
75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
```

Keep it secure and only use in:
- Railway environment variables
- RunPod environment variables
- Local .env.local (gitignored)

