# Configure Your RunPod Endpoint

## Current Status

✅ **RunPod endpoint exists:** `82nsylciwb4j4p`  
✅ **API key valid:** Working  
✅ **Workers running:** 2 ready, 1 active  
⚠️ **Container:** Needs to be updated with our image

---

## The Issue

Your RunPod endpoint is running but returning HTTP 400 because it's not configured with our agent worker container yet.

**Think of it like this:**
- ✅ The restaurant (endpoint) is open
- ✅ The staff (workers) are there
- ⚠️ But they're serving the wrong menu (different container)

We need to update it with our menu (Docker image)!

---

## 🔧 Fix: Update RunPod Endpoint

### Step 1: Go to RunPod Serverless

🔗 **https://www.runpod.io/console/serverless**

### Step 2: Find Your Endpoint

Look for endpoint ID: **`82nsylciwb4j4p`**

Click on it to open configuration

### Step 3: Update Container Image

**Critical:** Change the container image to:

```
ghcr.io/pappdavid/agent-worker-serverless:latest
```

**Where to set this:**
- Look for "Container Image" or "Docker Image" field
- Replace whatever is there with the above

### Step 4: Verify Environment Variables

**Make sure ALL 7 of these are set:**

```bash
# Get your Railway URL first
# Railway Dashboard → Your Service → Settings → Domains
# Example: https://abundant-laughter-production.up.railway.app

RAILWAY_API_BASE_URL=<your-railway-url-here>
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=<your-openai-key>
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
PORT=8000
PORT_HEALTH=8001
```

### Step 5: Check Scaling Settings

- **Min Workers:** 0
- **Max Workers:** 2-3
- **Idle Timeout:** 60 seconds
- **Execution Timeout:** 300 seconds (5 minutes)

### Step 6: Save/Update

Click **"Update"** or **"Save"** button

RunPod will:
1. Pull the new Docker image
2. Restart workers with new container
3. Workers will be ready in 2-3 minutes

---

## Step 7: Wait for Workers to be Ready

**In RunPod dashboard:**
- Go to your endpoint
- Check "Workers" tab
- Watch status change:
  - "Initializing" → "Ready"

**Usually takes 2-3 minutes**

---

## Step 8: Test the Endpoint Again

```bash
curl -X POST https://82nsylciwb4j4p.api.runpod.ai \
  -H "Authorization: Bearer <YOUR_RUNPOD_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"input":{"agentSessionId":"test-connection"}}'
```

**Expected response (success):**
```json
{
  "id": "job-abc123",
  "status": "IN_QUEUE"
}
```

**If you get this, it's working!** ✅

---

## ⚠️ Prerequisites

Before updating RunPod:

### 1. GitHub Actions Must Be Complete

Check: https://github.com/pappdavid/web-ui-ux-testing-tool/actions

**Look for:** "Build Agent Worker (Serverless)"
- ⏳ Running: Wait for it
- ✅ Complete: Good to go

### 2. Package Must Be Public

Check: https://github.com/pappdavid?tab=packages

**Look for:** "agent-worker-serverless"
- If it exists but says "Private": Make it Public
- If it doesn't exist yet: Wait for GitHub Actions

**How to make public:**
1. Click the package
2. Package settings → Danger Zone
3. Change visibility → Public
4. Type package name to confirm

---

## Common Issues

### "Failed to pull image"

**Cause:** Package is private or doesn't exist

**Fix:**
1. Wait for GitHub Actions to complete
2. Make package public
3. Try updating RunPod again

### "Container crashed on startup"

**Cause:** Missing environment variables

**Fix:**
- Check all 7 variables are set in RunPod
- Verify OPENAI_API_KEY is valid
- Ensure RAILWAY_API_BASE_URL includes `https://`

### "Timeout" or "No workers available"

**Cause:** Workers taking too long to initialize

**Fix:**
- Wait 3-5 minutes for first cold start
- Check container disk is 20GB minimum
- Verify workers show "Ready" status

---

## What Success Looks Like

### Before Configuration
```bash
curl https://82nsylciwb4j4p.api.runpod.ai
→ HTTP 400 (timeout)
```

### After Configuration
```bash
curl https://82nsylciwb4j4p.api.runpod.ai
→ HTTP 200 with job ID
```

### When Processing Session
```json
{
  "id": "sync-abc123-xyz",
  "status": "COMPLETED",
  "output": {
    "success": true,
    "agentSessionId": "clxxxxx"
  }
}
```

---

## 🎯 Summary

**Your endpoint works!** It just needs:

1. ✅ Wait for GitHub Actions build
2. ✅ Make package public  
3. ✅ Update RunPod with our image
4. ✅ Verify environment variables
5. ✅ Test endpoint
6. ✅ Set Railway variables
7. ✅ Test complete system

**Total time: ~15-20 minutes**

---

## 📚 More Help

- **Configuration:** [STATUS_AND_NEXT_STEPS.md](STATUS_AND_NEXT_STEPS.md)
- **Deployment:** [DEPLOY_RUNPOD_SERVERLESS.md](DEPLOY_RUNPOD_SERVERLESS.md)
- **Architecture:** [docs/AGENTIC_BROWSER_RUNPOD.md](docs/AGENTIC_BROWSER_RUNPOD.md)

---

**Next: Wait for GitHub Actions, then update RunPod endpoint with our Docker image!** 🚀

