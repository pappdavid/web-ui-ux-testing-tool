# ✅ RunPod Serverless Deployment Checklist

## 🎯 Current Status

✅ **Code pushed to GitHub** (Commit: `74703dd`)  
⏳ **GitHub Actions building** (2 images)  
⏳ **Railway deploying** (main app)

---

## 📋 Step-by-Step Checklist

### ⏳ Wait for Builds (10-15 minutes)

**Monitor GitHub Actions:**
```
https://github.com/pappdavid/web-ui-ux-testing-tool/actions
```

Look for:
- ✅ "Build Agent Worker (Serverless)" - Creates serverless image
- ✅ "Build Agent Worker" - Creates polling image (backup)

**Monitor Railway:**
```
https://railway.app/dashboard
```

Look for "Active" deployment status

---

### 1️⃣ Make GitHub Package Public (2 minutes)

**After GitHub Actions completes:**

1. Go to: https://github.com/pappdavid?tab=packages
2. Find: **"agent-worker-serverless"**
3. Click on it
4. Click "Package settings" (right sidebar)
5. Scroll to "Danger Zone"
6. "Change visibility" → Select **"Public"**
7. Type `agent-worker-serverless` to confirm
8. Click "I understand, change package visibility"

✅ Check: Package shows "Public" label

---

### 2️⃣ Set Railway Environment Variable (2 minutes)

**Option A: Via Railway Dashboard (Easier)**

1. Go to: https://railway.app/dashboard
2. Select project: "abundant-laughter"
3. Click your service → **"Variables"** tab
4. Click "+ New Variable"
5. Add:
   - **Name:** `RAILWAY_INTERNAL_API_TOKEN`
   - **Value:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
6. Click "Add"
7. Railway will redeploy automatically

**Option B: Via CLI**

```bash
cd /Users/davidpapp/WebApp_Tester_2000
railway link
railway variables set RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
```

✅ Check: Variable appears in Railway dashboard

---

### 3️⃣ Deploy to RunPod Serverless (5 minutes)

1. **Go to RunPod:** https://www.runpod.io

2. **Click "Serverless"** (top menu)

3. **Click "+ New Endpoint"**

4. **Configure Basic Settings:**
   - **Endpoint Name:** `agent-worker`
   - **Select GPU Type:** **CPU** (cheaper, sufficient for Playwright)
   - **Container Image:** `ghcr.io/pappdavid/agent-worker-serverless:latest`
   - **Container Disk:** 20 GB

5. **Add Environment Variables:**

   **First, get your Railway URL:**
   - Go to Railway → Your service → Settings → Domains
   - Copy the URL (e.g., `https://abundant-laughter-production.up.railway.app`)

   **Then add these 7 variables:**

   ```
   RAILWAY_API_BASE_URL=https://YOUR-RAILWAY-URL.up.railway.app
   RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
   OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
   OPENAI_MODEL=gpt-4o-mini
   PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
   PORT=8000
   PORT_HEALTH=8001
   ```

6. **Configure Scaling:**
   - **Min Workers:** `0` (scales to zero when idle)
   - **Max Workers:** `3` (or more if needed)
   - **GPU IDs:** Leave default
   - **Idle Timeout:** `60` seconds
   - **Execution Timeout:** `300` seconds (5 minutes)
   - **Max Concurrent Requests per Worker:** `1`

7. **Click "Deploy"**

8. **Wait for deployment** (~2 minutes)

9. **Copy your Endpoint URL and ID:**
   - Format: `https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run`
   - Save this - you'll need it for Railway!

✅ Check: Endpoint shows "Ready" status in RunPod dashboard

---

### 4️⃣ Get RunPod API Key (1 minute)

1. RunPod dashboard → Click your profile → **"Settings"**
2. Go to **"API Keys"** section
3. Click **"+ API Key"**
4. Name: `Railway Integration`
5. Click "Create"
6. **Copy the key** (starts with `RP-...` or similar)

✅ Check: API key saved securely

---

### 5️⃣ Connect Railway to RunPod (2 minutes)

**Add RunPod configuration to Railway:**

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Set endpoint URL (from Step 3)
railway variables set RUNPOD_SERVERLESS_ENDPOINT=https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run

# Set API key (from Step 4)
railway variables set RUNPOD_API_KEY=YOUR_RUNPOD_API_KEY
```

**Or via Railway Dashboard:**
- Variables tab → Add variables:
  - `RUNPOD_SERVERLESS_ENDPOINT` = your endpoint URL
  - `RUNPOD_API_KEY` = your API key

Railway will redeploy automatically.

✅ Check: Variables appear in Railway dashboard

---

### 6️⃣ Test the Complete System (5 minutes)

1. **Go to your Railway app URL**

2. **Login** with your credentials

3. **Navigate to any test** → Click "Edit"

4. **Find "Cloud Agentic Recorder" section**

5. **Enter a simple scenario:**
   ```
   Navigate to the homepage and take a screenshot
   ```

6. **Click "Start Cloud Agent Exploration"**

7. **Monitor Progress:**

   **In UI:**
   - Session status: "pending" (Railway created it)
   - Then "pending" → "running" (RunPod picked it up)
   - Then "completed" (Worker finished)
   - Auto-refreshes every 5 seconds

   **In RunPod Dashboard:**
   - Go to: Serverless → Your Endpoint → "Requests" tab
   - You'll see your request appear
   - Click on it to see logs in real-time
   - Status: IN_PROGRESS → COMPLETED

8. **Compile to Steps:**
   - Click "Compile trace to steps" button
   - Steps appear in StepBuilder
   - Each step has 🤖 Agent badge

9. **Run the Test:**
   - Click "Run Test"
   - Test executes normally
   - Verify it passes

✅ Check: Full cycle works end-to-end

---

## 🎉 Success Criteria

You'll know everything is working when:

- ✅ Can create agent session in UI
- ✅ Railway logs show "Serverless worker triggered"
- ✅ RunPod shows request in dashboard
- ✅ Session status changes to "completed"
- ✅ Can compile trace to steps
- ✅ Steps appear with 🤖 Agent badge
- ✅ Test runs successfully

---

## 💰 Cost Estimate (First Month)

### Setup Costs
- RunPod: $0 (pay per use)
- Railway: Your existing plan
- GitHub: $0 (free)

### Per-Session Costs
- RunPod: ~$0.02 per 5-minute session
- OpenAI (gpt-4o-mini): ~$0.01 per session
- **Total: ~$0.03 per session**

### Monthly Estimate
| Sessions | Cost |
|----------|------|
| 10 | $0.30 |
| 50 | $1.50 |
| 100 | $3.00 |
| 500 | $15.00 |
| 1,000 | $30.00 |

**Compare to 24/7 pod: $180/month minimum!**

---

## 🔍 Troubleshooting

### GitHub Actions Fails

**Check:** https://github.com/pappdavid/web-ui-ux-testing-tool/actions

**Common issues:**
- Dockerfile syntax error → Review Dockerfile.serverless
- Missing dependencies → Check package.json

**Fix:** Review error logs, fix, push again

### RunPod Can't Pull Image

**Error:** "Failed to pull image"

**Fix:**
1. Ensure package is **Public** (Step 1)
2. Wait for GitHub Actions to complete
3. Verify image exists: https://github.com/pappdavid?tab=packages

### Worker Not Triggering

**Railway logs show:** "Failed to trigger serverless"

**Fix:**
1. Check `RUNPOD_SERVERLESS_ENDPOINT` is set
2. Verify `RUNPOD_API_KEY` is correct
3. Test endpoint manually with curl (see docs)

### Session Timeout

**Error:** Worker takes too long

**Fix:**
- Increase "Execution Timeout" in RunPod (default 300s)
- Simplify scenario description
- Check worker logs for bottlenecks

---

## 📞 Support Resources

- **Quick Start:** [QUICK_START_AGENT.md](QUICK_START_AGENT.md)
- **Serverless Guide:** [DEPLOY_RUNPOD_SERVERLESS.md](DEPLOY_RUNPOD_SERVERLESS.md)
- **Full Docs:** [docs/AGENTIC_BROWSER_RUNPOD.md](docs/AGENTIC_BROWSER_RUNPOD.md)
- **Implementation:** [RUNPOD_SERVERLESS_COMPLETE.md](RUNPOD_SERVERLESS_COMPLETE.md)

---

## 🚦 Progress Tracking

**Check off as you complete each step:**

- [ ] Wait for GitHub Actions to complete
- [ ] Make `agent-worker-serverless` package public
- [ ] Set `RAILWAY_INTERNAL_API_TOKEN` in Railway
- [ ] Deploy to RunPod Serverless
- [ ] Get RunPod endpoint URL
- [ ] Get RunPod API key
- [ ] Set `RUNPOD_SERVERLESS_ENDPOINT` in Railway
- [ ] Set `RUNPOD_API_KEY` in Railway
- [ ] Test creating an agent session
- [ ] Verify session processes successfully
- [ ] Test compiling trace to steps
- [ ] Run compiled test

---

## 🎊 You're All Set!

**Current builds will complete in ~10-15 minutes.**

**While waiting:**
1. ☕ Get coffee
2. 📖 Review [DEPLOY_RUNPOD_SERVERLESS.md](DEPLOY_RUNPOD_SERVERLESS.md)
3. 🔑 Prepare your OpenAI API key
4. 🌐 Note your Railway URL

**Then follow Steps 1-6 above!**

**Total deployment time: ~25 minutes** ⏱️

---

**Links for Quick Access:**

- GitHub Actions: https://github.com/pappdavid/web-ui-ux-testing-tool/actions
- Railway Dashboard: https://railway.app/dashboard
- RunPod Serverless: https://www.runpod.io/console/serverless
- OpenAI API Keys: https://platform.openai.com/api-keys

**Everything is automated and building now! 🎉**

