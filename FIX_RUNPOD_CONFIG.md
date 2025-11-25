# 🔧 Fix RunPod Configuration

## Issue Found!

Looking at your RunPod Release #5 (current):

**❌ WRONG:**
```
RAILWAY_API_BASE_URL = web-ui-ux-testing-tool-production.up.railway.app
```

**✅ CORRECT:**
```
RAILWAY_API_BASE_URL = https://web-ui-ux-testing-tool-production.up.railway.app
```

**Missing:** `https://` prefix!

This is why the worker times out - it can't connect to Railway without the protocol.

---

## ✅ Good News

Everything else looks perfect:

✅ **Container Image:** `ghcr.io/pappdavid/agent-worker-serverless:latest` (correct!)  
✅ **Container Disk:** 20 GB (good!)  
✅ **PORT:** 8000 (correct!)  
✅ **PORT_HEALTH:** 8001 (correct!)  
✅ **Workers:** 5 running (excellent!)  
✅ **Using RunPod Secrets:** Good security practice!

---

## 🔧 How to Fix (2 minutes)

### Step 1: Go to RunPod Endpoint

🔗 https://www.runpod.io/console/serverless

**Click your endpoint:** `82nsylciwb4j4p`

### Step 2: Edit Environment Variable

**Find:** `RAILWAY_API_BASE_URL`

**Change from:**
```
web-ui-ux-testing-tool-production.up.railway.app
```

**Change to:**
```
https://web-ui-ux-testing-tool-production.up.railway.app
```

**Add the `https://` prefix!**

### Step 3: Save/Update

**Click "Update" or "Save"**

Workers will restart automatically (~1-2 minutes)

---

## Verify All Environment Variables

While you're there, double-check all 7 are set:

```
✓ RAILWAY_API_BASE_URL = https://web-ui-ux-testing-tool-production.up.railway.app
✓ RAILWAY_INTERNAL_API_TOKEN = {{ RUNPOD_SECRET_RAILWAY_INTERNAL_API_TOKEN }}
✓ OPENAI_API_KEY = {{ RUNPOD_SECRET_OPENAI_API_KEY }}
✓ OPENAI_MODEL = gpt-4o-mini
✓ PLAYWRIGHT_BROWSERS_PATH = /ms-playwright
✓ PORT = 8000
✓ PORT_HEALTH = 8001
```

**Using RunPod Secrets is great!** Just ensure:
- `RUNPOD_SECRET_RAILWAY_INTERNAL_API_TOKEN` = `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
- `RUNPOD_SECRET_OPENAI_API_KEY` = Your OpenAI key

---

## Test After Fix

**Wait 1-2 minutes for workers to restart, then test:**

```bash
curl -X POST https://82nsylciwb4j4p.api.runpod.ai \
  -H "Authorization: Bearer <YOUR_RUNPOD_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"input":{"agentSessionId":"test-after-fix"}}'
```

**Should now return:**
```json
{
  "id": "job-abc123",
  "status": "IN_QUEUE"
}
```

Or process synchronously and return results!

---

## Set Railway Variables

While waiting for RunPod to restart, set these in Railway:

🔗 https://railway.app/dashboard → "abundant-laughter" → Variables

```
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

RUNPOD_SERVERLESS_ENDPOINT=https://82nsylciwb4j4p.api.runpod.ai

RUNPOD_API_KEY=<YOUR_RUNPOD_API_KEY>
```

---

## After Both Configurations

**Railway will have:**
- Connection to RunPod serverless endpoint
- Ability to trigger workers automatically

**RunPod will have:**
- Connection to Railway API
- Ability to fetch sessions and post traces

**Then the complete flow works:**
1. User creates agent session in Railway UI
2. Railway automatically triggers RunPod
3. RunPod worker processes session
4. Worker posts trace back to Railway
5. User compiles trace to steps
6. Test runs!

---

## 🎯 Action Items (Do Now!)

**Priority 1:**
- [ ] Fix `RAILWAY_API_BASE_URL` in RunPod (add `https://`)

**Priority 2:**
- [ ] Set 3 variables in Railway

**Priority 3:**
- [ ] Wait for workers to restart (~2 min)

**Priority 4:**
- [ ] Test endpoint again (should work!)

**Priority 5:**
- [ ] Test complete system via UI

---

## Expected Timeline

- **Now:** Fix RAILWAY_API_BASE_URL
- **+2 min:** Workers restart
- **+4 min:** Set Railway variables
- **+7 min:** Railway redeploys
- **+9 min:** Test endpoint (should work!)
- **+11 min:** Test via UI (create agent session!)
- **+15 min:** 🎉 Complete!

---

## 🎊 You're Very Close!

**Configuration is 95% correct!**

Just need to:
1. Add `https://` to RAILWAY_API_BASE_URL in RunPod
2. Set 3 variables in Railway
3. Test!

**Then everything will work!** ✅

---

**Quick fix:** Go to RunPod → Edit endpoint → Add `https://` to RAILWAY_API_BASE_URL → Save!

