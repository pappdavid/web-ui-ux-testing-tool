# ✅ RunPod Serverless Setup Complete

## What's Been Added

I've created a **serverless version** of the agent worker optimized for RunPod Serverless:

### New Files Created

1. **`src/agentWorker/serverless.ts`**
   - HTTP server with Express
   - `/run` endpoint for processing sessions
   - `/ping` endpoint for health checks
   - Listens on PORT (8000) and PORT_HEALTH (8001)

2. **`src/agentWorker/Dockerfile.serverless`**
   - Optimized for RunPod Serverless
   - Exposes ports 8000 and 8001
   - Includes express dependency

3. **`.github/workflows/build-agent-worker-serverless.yml`**
   - Builds serverless Docker image
   - Pushes to: `ghcr.io/pappdavid/agent-worker-serverless:latest`

4. **`src/server/services/runpodTrigger.ts`**
   - Service to trigger RunPod serverless endpoint
   - Called automatically when agent session created
   - Falls back to polling if not configured

5. **`DEPLOY_RUNPOD_SERVERLESS.md`**
   - Complete deployment guide
   - Cost comparison
   - Configuration instructions

### Updated Files

- **`package.json`** - Added express and @types/express
- **`src/app/api/agent-sessions/route.ts`** - Triggers serverless worker on session creation

---

## 🚀 Deploy to RunPod Serverless Now

### Step 1: Push Code to GitHub

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Add all changes
git add -A

# Commit
git commit -m "Add RunPod Serverless worker support

- Add HTTP server with /run and /ping endpoints
- Auto-trigger serverless worker on session creation  
- Include express for HTTP handling
- Separate Dockerfile for serverless deployment"

# Push (triggers GitHub Actions)
git push origin main
```

### Step 2: Wait for GitHub Actions

GitHub will build **two images**:
1. `ghcr.io/pappdavid/agent-worker:latest` (polling version)
2. `ghcr.io/pappdavid/agent-worker-serverless:latest` (serverless version)

**Check:** https://github.com/pappdavid/web-ui-ux-testing-tool/actions

---

## Step 3: Make Package Public

After build completes:

1. Go to: https://github.com/pappdavid?tab=packages
2. Click **"agent-worker-serverless"** package
3. Package settings → Danger Zone → Change visibility → **Public**
4. Type `agent-worker-serverless` to confirm

---

## Step 4: Deploy to RunPod Serverless

### 4.1 Go to RunPod Serverless

1. Visit: https://www.runpod.io
2. Click **"Serverless"** in top menu
3. Click **"+ New Endpoint"**

### 4.2 Configure Endpoint

**Endpoint Name:** `agent-worker`

**Container Image:**
```
ghcr.io/pappdavid/agent-worker-serverless:latest
```

**GPU Type:** Select **CPU** (cheaper, Playwright doesn't need GPU)

**Container Disk:** 20 GB

**Environment Variables:**

| Variable | Value |
|----------|-------|
| `RAILWAY_API_BASE_URL` | Your Railway URL |
| `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |
| `PORT` | `8000` |
| `PORT_HEALTH` | `8001` |

**Scaling Configuration:**
- **Min Workers:** 0 (scales to zero when idle)
- **Max Workers:** 3
- **Idle Timeout:** 60 seconds
- **Request Timeout:** 300 seconds (5 minutes)
- **Max Concurrent Requests per Worker:** 1

**Click "Deploy"**

---

## Step 5: Configure Railway with RunPod Endpoint

After RunPod deployment, you'll get an endpoint URL like:
```
https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run
```

Add this to Railway:

```bash
cd /Users/davidpapp/WebApp_Tester_2000

railway variables set RUNPOD_SERVERLESS_ENDPOINT=https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run

# Get your RunPod API key from: RunPod Dashboard → Settings → API Keys
railway variables set RUNPOD_API_KEY=YOUR_RUNPOD_API_KEY
```

**Or via Railway Dashboard:**
1. Go to Variables tab
2. Add:
   - `RUNPOD_SERVERLESS_ENDPOINT` = your endpoint URL
   - `RUNPOD_API_KEY` = your RunPod API key

---

## Step 6: Test the System

### 6.1 Create Agent Session

1. Go to your Railway app
2. Edit any test
3. Find "Cloud Agentic Recorder"
4. Enter: "Navigate to the homepage and take a screenshot"
5. Click "Start Cloud Agent Exploration"

### 6.2 Watch Serverless Execution

**In RunPod Dashboard:**
1. Go to Serverless → Your Endpoint
2. Click "Requests" tab
3. You'll see the request appear and process in real-time

**In UI:**
- Status will change: pending → running → completed
- Much faster than polling (instant start!)

### 6.3 Compile and Verify

1. When status shows "completed"
2. Click "Compile trace to steps"
3. Verify steps appear with 🤖 Agent badge

---

## 💰 Cost Advantage: Serverless vs Pod

### Traditional Pod (Polling)
```
Cost: $0.25/hour × 24 hours × 30 days = $180/month
Even if you only use it once!
```

### Serverless (On-Demand)
```
Base: $0 when idle
Active: ~$0.02 per 5-minute session
100 sessions/month = $2/month (99% savings!)
```

**Serverless wins if you process < 9,000 sessions/month**

---

## How It Works

### Polling Mode (Original)
```
Worker runs 24/7 → Polls Railway every 10s → Picks up pending session
```
💰 Always costs money (even when idle)

### Serverless Mode (New)
```
Session created → Railway calls RunPod endpoint → Worker spins up → Processes session → Scales to zero
```
💰 Only costs when processing

---

## Monitoring

### RunPod Serverless Dashboard

**Requests Tab:**
- See all session processing requests
- Response times
- Success/error rates

**Workers Tab:**
- Current active workers (0-3)
- Auto-scaling behavior

**Logs Tab:**
- Real-time worker output
- Error messages

### Railway Logs

```bash
railway logs
```

Look for:
```
[RunPodTrigger] Triggering serverless worker for session: clxxxxx
[RunPodTrigger] Serverless worker triggered successfully: job-abc123
```

---

## Troubleshooting

### "Failed to trigger serverless"

**Check Railway logs for:**
```
Error triggering serverless: 401 Unauthorized
```

**Fix:**
- Verify `RUNPOD_API_KEY` is set in Railway
- Check API key is valid (RunPod → Settings → API Keys)

### Worker Not Responding

**Check RunPod logs:**
- Go to Serverless → Endpoint → Logs
- Look for startup errors

**Common issues:**
- Missing environment variables
- Package not public
- Ports not exposed correctly

### Session Stays "Pending"

**Possible causes:**
1. RunPod endpoint not configured in Railway
2. Serverless worker not deployed
3. Worker crashed on startup

**Fix:**
- Check `RUNPOD_SERVERLESS_ENDPOINT` is set in Railway
- Verify endpoint exists in RunPod dashboard
- Review RunPod logs for errors

---

## Dual Mode Support

The system supports BOTH modes simultaneously:

### Mode 1: Serverless (Instant, Cost-Effective)
- Railway triggers RunPod via HTTP
- Sessions process immediately
- Scales to zero when idle

### Mode 2: Polling (Simple, Always Running)
- Worker polls Railway every 10s
- Picks up any pending sessions
- Runs 24/7

**How to choose:**

**Use Serverless if:**
- You have the RunPod endpoint configured
- Prefer pay-per-use pricing
- Want instant processing

**Falls back to Polling if:**
- Serverless endpoint not configured
- Serverless request fails
- You prefer simplicity

Both can coexist - serverless processes first, polling catches anything missed.

---

## Quick Command Reference

```bash
# Push serverless code
git add -A
git commit -m "Add serverless support"
git push origin main

# Set Railway variables
railway variables set RUNPOD_SERVERLESS_ENDPOINT=https://api.runpod.ai/v2/YOUR_ID/run
railway variables set RUNPOD_API_KEY=YOUR_RUNPOD_API_KEY

# Test health endpoint
curl https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/health

# Trigger manually
curl -X POST https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run \
  -H "Authorization: Bearer YOUR_RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"agentSessionId":"clxxxxx"}}'
```

---

## Next Steps

1. ✅ **Push code** (commands above)
2. ⏳ **Wait for GitHub Actions** (~10 min)
3. ✅ **Make package public**
4. ✅ **Deploy to RunPod Serverless**
5. ✅ **Set Railway env vars** (endpoint + API key)
6. ✅ **Test the system**

**See:** [DEPLOY_RUNPOD_SERVERLESS.md](DEPLOY_RUNPOD_SERVERLESS.md) for detailed steps

---

## Summary

✅ **Serverless worker created**  
✅ **Auto-trigger on session creation**  
✅ **Cost-optimized** (pay per use)  
✅ **Faster processing** (instant start)  
✅ **Auto-scaling** (handles parallel sessions)

**Ready to deploy serverless! 🚀**

