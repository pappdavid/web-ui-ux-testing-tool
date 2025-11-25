# RunPod Endpoint Configuration

## Your RunPod Information

**Endpoint Base URL:** `https://82nsylciwb4j4p.api.runpod.ai`  
**API Key:** `<YOUR_RUNPOD_API_KEY>`

---

## Understanding RunPod Serverless Endpoints

RunPod Serverless uses this URL structure:

```
Base URL: https://ENDPOINT_ID.api.runpod.ai
```

Your endpoint ID: `82nsylciwb4j4p`

The complete endpoint for requests is:
```
https://82nsylciwb4j4p.api.runpod.ai/run
```

Or in RunPod API v2 format:
```
https://api.runpod.ai/v2/82nsylciwb4j4p/run
```

Both formats should work - we'll use the first one since that's what RunPod provided.

---

## Set in Railway (3 Variables)

### Option 1: Railway Dashboard (Easiest)

1. Go to: **https://railway.app/dashboard**
2. Project: **"abundant-laughter"**
3. Click your service → **"Variables"** tab
4. Add these **3 variables**:

```
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

RUNPOD_SERVERLESS_ENDPOINT=https://82nsylciwb4j4p.api.runpod.ai/run

RUNPOD_API_KEY=<YOUR_RUNPOD_API_KEY>
```

### Option 2: Railway CLI (Advanced)

If you can access Railway CLI interactively:

```bash
railway link
railway variables set RAILWAY_INTERNAL_API_TOKEN="75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250"
railway variables set RUNPOD_SERVERLESS_ENDPOINT="https://82nsylciwb4j4p.api.runpod.ai/run"
railway variables set RUNPOD_API_KEY="<YOUR_RUNPOD_API_KEY>"
```

---

## Verify RunPod Endpoint Configuration

### Check Your RunPod Serverless Endpoint

1. Go to: **https://www.runpod.io/console/serverless**
2. Find your endpoint (should be listed)
3. Click on it
4. Verify these settings:

**Environment Variables in RunPod:**

Get your Railway URL first:
- Railway Dashboard → Your Service → Settings → Domains
- Copy the domain (e.g., `https://abundant-laughter-production.up.railway.app`)

Then ensure RunPod has these 7 variables:

```
RAILWAY_API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
PORT=8000
PORT_HEALTH=8001
```

**Container Image:**
```
ghcr.io/pappdavid/agent-worker-serverless:latest
```

**Make sure GitHub package is public:**
- Go to: https://github.com/pappdavid?tab=packages
- Find "agent-worker-serverless"
- Should show "Public" label
- If not, change visibility to Public

---

## Test the System

### Step 1: Test RunPod Endpoint Manually

```bash
# Simple health test (may not work until worker is deployed)
curl -X POST https://82nsylciwb4j4p.api.runpod.ai/run \
  -H "Authorization: Bearer <YOUR_RUNPOD_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"input":{"test":"connection"}}'
```

If it returns HTTP 200/202, the endpoint is working.

### Step 2: Test via Railway UI

1. **Visit your Railway app**
2. **Login**
3. **Create/Edit a test**
4. **Use Cloud Agentic Recorder:**
   - Scenario: "Navigate to https://example.com and take a screenshot"
   - Click "Start Cloud Agent Exploration"

5. **Monitor:**
   - Railway logs (shows trigger attempt)
   - RunPod dashboard (shows request)
   - UI (shows status updates)

### Step 3: Verify Complete Flow

1. Session created → Status: "pending"
2. Railway triggers RunPod → Logs show trigger
3. RunPod processes → Status: "running"
4. Worker completes → Status: "completed"
5. Compile to steps → Steps appear
6. Steps have 🤖 badge → Agent-generated
7. Run test → Test passes

---

## Troubleshooting

### RunPod Returns 400 Bad Request

**Likely causes:**
1. Worker not deployed yet
2. Container image not pulled
3. Health check endpoint not ready

**Fix:**
- Wait for GitHub Actions to complete
- Ensure package is public
- Check RunPod logs for startup errors

### "Failed to trigger serverless" in Railway

**Check Railway logs:**
```
Error triggering serverless: 401 Unauthorized
```

**Fix:**
- Verify `RUNPOD_API_KEY` is correct in Railway
- Check no extra spaces in variable values
- Ensure endpoint URL is correct

### Session Stays "Pending"

**Possible issues:**
1. RunPod not triggered (check Railway logs)
2. Worker crashed (check RunPod logs)
3. Missing env vars (check RunPod configuration)

**Debug:**
- Check Railway has all 3 variables set
- Verify RunPod endpoint is "Ready"
- Review RunPod request logs

---

## Expected Behavior

### When You Create a Session

**Railway Side:**
1. POST /api/agent-sessions creates session
2. Calls triggerRunPodServerlessWorker()
3. Logs: "Triggering serverless worker for session: clxxxxx"
4. Logs: "Serverless worker triggered successfully: job-abc123"

**RunPod Side:**
1. Receives HTTP request at /run endpoint
2. Spins up worker (0-30 seconds)
3. Worker processes session
4. Posts trace steps back to Railway
5. Scales to zero after completion

**User Side:**
1. Sees session in UI
2. Status auto-updates every 5s
3. Sees "completed" status
4. Clicks "Compile trace to steps"
5. Reviews and runs test

---

## Summary

### Railway Variables to Set

```bash
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
RUNPOD_SERVERLESS_ENDPOINT=https://82nsylciwb4j4p.api.runpod.ai/run
RUNPOD_API_KEY=<YOUR_RUNPOD_API_KEY>
```

### RunPod Variables to Verify

```bash
RAILWAY_API_BASE_URL=<your-railway-url>
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=<your-openai-key>
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
PORT=8000
PORT_HEALTH=8001
```

---

## Next Action

**Set those 3 variables in Railway now!**

Then test by creating an agent session in your app.

**You're minutes away from having an AI agent explore your apps!** 🤖✨

