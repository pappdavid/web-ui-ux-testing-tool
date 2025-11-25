# ⚠️ RunPod Endpoint Needs Configuration

## Test Results

**Endpoint:** `https://82nsylciwb4j4p.api.runpod.ai`

**Health Check:** ✅ Working (2 ready workers, 1 running)  
**Load Balancer:** ⚠️ Returns HTTP 400 (timeout after 2 minutes)

---

## What This Means

Your RunPod endpoint exists and is running, but it's either:

1. **Not configured with our Docker image yet**, OR
2. **Using a different container** that doesn't have our `/run` handler

The workers are healthy, but they're not running our agent worker code.

---

## ✅ How to Fix (Update RunPod Endpoint)

### Step 1: Wait for GitHub Actions

**First, check if the Docker image is built:**

🔗 https://github.com/pappdavid/web-ui-ux-testing-tool/actions

Look for: **"Build Agent Worker (Serverless)"**
- ⏳ If running: Wait for it to complete
- ✅ If complete: Proceed to Step 2

### Step 2: Make Package Public

1. Go to: https://github.com/pappdavid?tab=packages
2. Look for: **"agent-worker-serverless"** package
3. Click on it
4. Package settings → Danger Zone → Change visibility → **Public**
5. Confirm

### Step 3: Update RunPod Endpoint Configuration

**Go to RunPod:** https://www.runpod.io/console/serverless

**Find your endpoint:** `82nsylciwb4j4p`

**Click on it to edit configuration**

**Update these settings:**

#### Container Image
```
ghcr.io/pappdavid/agent-worker-serverless:latest
```

**Note:** This is the key change! Your endpoint might have a different image or no image configured.

#### Environment Variables (Verify all 7 are set)

| Variable | Value |
|----------|-------|
| `RAILWAY_API_BASE_URL` | Your Railway URL (e.g., `https://abundant-laughter-production.up.railway.app`) |
| `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |
| `PORT` | `8000` |
| `PORT_HEALTH` | `8001` |

**Get Railway URL:**
- Railway Dashboard → Your Service → Settings → Domains
- Copy the full URL (must include `https://`)

#### Scaling Configuration
- **Min Workers:** 0
- **Max Workers:** 3
- **Idle Timeout:** 60 seconds
- **Execution Timeout:** 300 seconds (5 minutes)
- **Max Concurrent Requests per Worker:** 1

#### Container Settings
- **Container Disk:** 20 GB minimum
- **GPU Type:** CPU

**Click "Update" or "Save"**

---

## Step 4: Wait for RunPod to Pull Image

After updating:
1. RunPod will pull the new Docker image
2. This takes 2-3 minutes
3. Workers will restart with new container

**Monitor in RunPod:**
- Go to your endpoint
- Check "Workers" tab
- Should show workers initializing then ready

---

## Step 5: Test Again

Once workers show "Ready" status:

```bash
curl -X POST https://82nsylciwb4j4p.api.runpod.ai \
  -H "Authorization: Bearer <YOUR_RUNPOD_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"input":{"agentSessionId":"test-123"}}'
```

**Expected response:**
```json
{
  "id": "job-abc123xyz",
  "status": "IN_QUEUE"
}
```

Or:
```json
{
  "success": true,
  "agentSessionId": "test-123"
}
```

**Not 400 anymore!**

---

## Current Endpoint Status

**Based on health check response:**

```json
{
  "jobs": {
    "completed": 0,
    "failed": 0,
    "inProgress": 0,
    "inQueue": 0,
    "retried": 0
  },
  "workers": {
    "idle": 2,
    "initializing": 0,
    "ready": 2,
    "running": 1,
    "throttled": 0,
    "unhealthy": 0
  }
}
```

**Analysis:**
- ✅ Endpoint is alive
- ✅ 2 workers ready
- ✅ 1 worker running
- ⚠️ But returning 400 on requests

**Conclusion:** Workers are running a different container (not ours yet)

---

## 🔍 Troubleshooting

### After Configuration Update

#### If Still 400

**Check RunPod Logs:**
1. Go to endpoint → Logs tab
2. Look for errors like:
   - "Image pull failed"
   - "Missing environment variable"
   - "Container crashed"

**Common fixes:**
- Ensure package is Public on GitHub
- Verify image name is exactly: `ghcr.io/pappdavid/agent-worker-serverless:latest`
- Check all environment variables are set

#### If 401 Unauthorized

**Issue:** API key is wrong

**Fix:**
- Verify you're using: `<YOUR_RUNPOD_API_KEY>`
- Check Authorization header format: `Bearer <key>`

#### If 404 Not Found

**Issue:** Endpoint path is wrong

**Fix:**
- Use load balancer URL: `https://82nsylciwb4j4p.api.runpod.ai`
- Don't add /run or /runsync (load balancer handles routing)

---

## What RunPod Load Balancer Does

Your endpoint URL `https://82nsylciwb4j4p.api.runpod.ai` is a **load balancer**.

**It automatically:**
- Routes requests to available workers
- Handles scaling (spins up workers on demand)
- Manages health checks
- Returns responses from workers

**You send requests to:**
```
POST https://82nsylciwb4j4p.api.runpod.ai
```

**RunPod handles:**
- Finding available worker
- Sending request to worker's /run endpoint
- Returning worker's response
- Scaling workers up/down

---

## 🎯 Action Plan

**Right now:**

1. ✅ **Check GitHub Actions status**
   - https://github.com/pappdavid/web-ui-ux-testing-tool/actions
   - Wait if still building

2. ✅ **Make package public** (when build done)
   - https://github.com/pappdavid?tab=packages

3. ✅ **Update RunPod endpoint** with our image
   - https://www.runpod.io/console/serverless
   - Set image: `ghcr.io/pappdavid/agent-worker-serverless:latest`
   - Verify all 7 environment variables

4. ✅ **Wait for container pull** (~3 min)

5. ✅ **Test endpoint** (should return 200 now)

6. ✅ **Set Railway variables** and test complete system

---

## 📋 Configuration Checklist

### In RunPod Endpoint Settings

- [ ] Container image: `ghcr.io/pappdavid/agent-worker-serverless:latest`
- [ ] RAILWAY_API_BASE_URL set (with your Railway URL)
- [ ] RAILWAY_INTERNAL_API_TOKEN set
- [ ] OPENAI_API_KEY set
- [ ] OPENAI_MODEL set to `gpt-4o-mini`
- [ ] PLAYWRIGHT_BROWSERS_PATH set to `/ms-playwright`
- [ ] PORT set to `8000`
- [ ] PORT_HEALTH set to `8001`
- [ ] Container disk: 20GB minimum
- [ ] GPU type: CPU
- [ ] Min workers: 0
- [ ] Max workers: 3

### In Railway Dashboard

- [ ] RAILWAY_INTERNAL_API_TOKEN set
- [ ] RUNPOD_SERVERLESS_ENDPOINT set to `https://82nsylciwb4j4p.api.runpod.ai`
- [ ] RUNPOD_API_KEY set to `<YOUR_RUNPOD_API_KEY>`

---

## 💡 Key Insight

You already have a RunPod endpoint created (`82nsylciwb4j4p`), but it needs to be **updated** with our custom Docker image and configuration.

**It's like having a car (endpoint) but needing to put in the right engine (our container image).**

---

## 📞 Next Steps

1. **Check GitHub Actions** - Is the build done?
2. **Make package public** - Can RunPod pull it?
3. **Update RunPod endpoint** - Use our image
4. **Test endpoint** - Should work now
5. **Set Railway vars** - Complete integration
6. **Test full system** - Create agent session!

**See:** [STATUS_AND_NEXT_STEPS.md](STATUS_AND_NEXT_STEPS.md) for complete guide

---

**The endpoint exists and is healthy. Just needs our container image!** 🔧✨

