# Deploy Agent Worker to RunPod Serverless

## Why RunPod Serverless?

**Advantages:**
- ✅ **Pay only when processing** (no idle costs)
- ✅ **Auto-scaling** (handles multiple sessions in parallel)
- ✅ **Load balancing** (distributes work automatically)
- ✅ **Better for sporadic usage** (vs 24/7 pod)

**Best for:**
- Testing/development
- Occasional use (few sessions per day)
- Variable workload

**Use regular pods if:**
- Need continuous 24/7 operation
- Process many sessions constantly

---

## Architecture Difference

### Regular Pod (Polling)
```
Worker polls Railway every 10s → Picks up session → Processes it
```
**Cost:** ~$180/month (24/7)

### Serverless (On-Demand)
```
Railway triggers worker via HTTP → Worker processes session → Scales to zero
```
**Cost:** ~$0.02 per session (pay per use)

---

## Step 1: Update Railway to Trigger Serverless Worker

We need to modify Railway to call the serverless endpoint instead of waiting for polling.

### 1.1 Add Serverless Trigger to Agent Session Creation

This will be added after we deploy the serverless worker and get the endpoint URL.

---

## Step 2: Push Serverless Worker Code

I've created the serverless version. Let's push it:

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Add the new files
git add src/agentWorker/serverless.ts
git add src/agentWorker/Dockerfile.serverless
git add .github/workflows/build-agent-worker-serverless.yml
git add DEPLOY_RUNPOD_SERVERLESS.md

# Commit
git commit -m "Add RunPod Serverless worker version

- HTTP server with /run and /ping endpoints
- Processes sessions on-demand via HTTP requests
- Auto-scales based on load
- Separate Dockerfile for serverless deployment"

# Push (triggers GitHub Actions)
git push origin main
```

This will build: `ghcr.io/pappdavid/agent-worker-serverless:latest`

---

## Step 3: Deploy to RunPod Serverless

### 3.1 Go to RunPod Serverless

1. Visit https://www.runpod.io
2. Click **"Serverless"** in the top menu
3. Click **"+ New Endpoint"**

### 3.2 Configure Endpoint

**Basic Settings:**
- **Name:** `agent-worker`
- **Select GPU Type:** Choose **CPU** (cheaper for our use case)
- **Container Image:** `ghcr.io/pappdavid/agent-worker-serverless:latest`
- **Container Disk:** 20 GB

**Container Configuration:**
- **Container Start Command:** Leave default (uses CMD from Dockerfile)

**Environment Variables:**

Add these:

| Variable | Value |
|----------|-------|
| `RAILWAY_API_BASE_URL` | Your Railway URL (e.g., `https://abundant-laughter-production.up.railway.app`) |
| `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |
| `PORT` | `8000` |
| `PORT_HEALTH` | `8001` |

**Scaling Settings:**
- **Min Workers:** 0 (scales to zero when idle)
- **Max Workers:** 3 (or more if you need parallel processing)
- **Idle Timeout:** 60 seconds
- **Request Timeout:** 300 seconds (5 minutes - sessions can take time)

**Advanced Settings:**
- **Max Concurrent Requests:** 1 (each worker handles one session at a time)

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. Copy your **Endpoint URL** (you'll need this for Railway)

Your endpoint URL will look like:
```
https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run
```

---

## Step 4: Update Railway to Call Serverless Endpoint

Now we need Railway to trigger the serverless worker when a session is created.

### 4.1 Add RunPod Endpoint to Railway Environment

```bash
railway variables set RUNPOD_SERVERLESS_ENDPOINT=https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run
railway variables set RUNPOD_API_KEY=YOUR_RUNPOD_API_KEY
```

**Get RunPod API Key:**
1. RunPod dashboard → Settings → API Keys
2. Create new API key
3. Copy the key

### 4.2 Create Serverless Trigger Service

I'll create a service that triggers the serverless worker when a session is created.

---

## Step 5: Test the Serverless Worker

### Manual Test via curl

```bash
# Test health endpoint
curl https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/health

# Test session processing
curl -X POST https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_RUNPOD_API_KEY" \
  -d '{
    "input": {
      "agentSessionId": "YOUR_SESSION_ID"
    }
  }'
```

### Test via UI

1. Go to your Railway app
2. Edit any test
3. Find "Cloud Agentic Recorder"
4. Enter scenario: "Navigate to homepage and take a screenshot"
5. Click "Start Cloud Agent Exploration"
6. Watch RunPod dashboard → Endpoint → Requests tab
7. You should see a request being processed

---

## Cost Comparison

### Regular Pod (24/7)
- **Cost:** ~$0.25/hour = $180/month
- **Idle time:** Wasted (polls even when no work)
- **Best for:** Continuous heavy usage

### Serverless (On-Demand)
- **Cost:** ~$0.02 per 5-minute session
- **Idle time:** $0 (scales to zero)
- **Best for:** Sporadic usage

**Example Monthly Costs:**

| Sessions/Month | Pod (24/7) | Serverless | Savings |
|----------------|------------|------------|---------|
| 10 | $180 | $0.20 | $179.80 |
| 100 | $180 | $2.00 | $178.00 |
| 1,000 | $180 | $20.00 | $160.00 |
| 9,000 | $180 | $180.00 | Break even |

**Use serverless if:** You process fewer than 9,000 sessions/month

---

## Monitoring

### RunPod Serverless Dashboard

1. **Requests Tab:**
   - See all requests
   - Response times
   - Success/failure rates

2. **Workers Tab:**
   - Current active workers
   - Scaling behavior

3. **Logs Tab:**
   - Worker output logs
   - Error messages

### Check Session Status

```bash
# Get session status
curl https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/status/REQUEST_ID \
  -H "Authorization: Bearer YOUR_RUNPOD_API_KEY"
```

---

## Troubleshooting

### Worker Not Starting

**Check:**
- Container image is public
- Environment variables are set
- Ports 8000 and 8001 are exposed

**Fix:**
- Make GitHub package public
- Verify all env vars in RunPod dashboard
- Check Dockerfile.serverless exposes ports

### Health Check Failing

**Error:** `/ping endpoint not responding`

**Fix:**
- Ensure PORT_HEALTH=8001 is set
- Check worker logs for startup errors
- Verify express is installed

### Session Processing Fails

**Check logs in RunPod dashboard:**

**Common issues:**
- `RAILWAY_INTERNAL_API_TOKEN not set` → Add env var
- `OpenAI API error` → Check API key and credits
- `Playwright error` → Ensure browsers installed in Dockerfile

### Request Timeout

**Error:** `Request exceeded timeout`

**Fix:**
- Increase timeout in RunPod settings (default 300s)
- Complex scenarios may take longer
- Consider splitting into smaller sessions

---

## Switching from Pod to Serverless

If you already deployed a regular pod:

1. **Stop the pod** (to avoid double-processing)
2. **Deploy serverless endpoint** (steps above)
3. **Update Railway** with serverless endpoint URL
4. **Test** to ensure it works
5. **Delete the pod** (if serverless works well)

You can keep both and switch by toggling which one is active.

---

## Advanced: Webhook Trigger

For instant processing, set up a webhook from Railway:

```typescript
// In Railway after session creation
await fetch(process.env.RUNPOD_SERVERLESS_ENDPOINT!, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`
  },
  body: JSON.stringify({
    input: {
      agentSessionId: session.id
    }
  })
})
```

This triggers processing immediately instead of waiting for polling.

---

## Summary

**Serverless Deployment:**
1. ✅ Push serverless worker code
2. ✅ GitHub Actions builds image
3. ✅ Deploy to RunPod Serverless
4. ✅ Set environment variables
5. ✅ Get endpoint URL
6. ✅ Configure Railway to trigger endpoint
7. ✅ Test and monitor

**Key Differences from Pod:**
- No polling (HTTP-triggered)
- Scales to zero when idle
- Pay per use (not 24/7)
- Better for variable workload

**Next:** Push the code and follow the steps above! 🚀

