# 🚀 RunPod Serverless Deployment - IN PROGRESS

## ✅ Code Pushed to GitHub

**Commit:** `74703dd`  
**Repository:** `pappdavid/web-ui-ux-testing-tool`  
**Branch:** `main`

---

## 🔄 What's Building Now

### GitHub Actions (In Progress)

**Two Docker images are building:**

1. **Polling Worker** (original)
   - Image: `ghcr.io/pappdavid/agent-worker:latest`
   - Use for: 24/7 operation
   - Workflow: "Build Agent Worker"

2. **Serverless Worker** (NEW - recommended!)
   - Image: `ghcr.io/pappdavid/agent-worker-serverless:latest`
   - Use for: Pay-per-use, auto-scaling
   - Workflow: "Build Agent Worker (Serverless)"

**Monitor:** https://github.com/pappdavid/web-ui-ux-testing-tool/actions

**Time:** ~10-15 minutes for both builds

### Railway (In Progress)

**Auto-deploying your main app with:**
- ✅ Agent session API endpoints
- ✅ Serverless trigger service
- ✅ Express dependency
- ✅ All agent models and compiler

**Monitor:** https://railway.app/dashboard → "abundant-laughter"

---

## ⏭️ Next Steps (Do After Builds Complete)

### Step 1: Make GitHub Packages Public (~2 min)

**After GitHub Actions completes:**

1. Go to: https://github.com/pappdavid?tab=packages
2. Click **"agent-worker-serverless"** package
3. Package settings → Danger Zone → Change visibility → **Public**
4. Type `agent-worker-serverless` to confirm

**Also make the polling version public** (if you want both options):
- Repeat for "agent-worker" package

### Step 2: Set Railway Environment Variables (~2 min)

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Link to Railway (if not already linked)
railway link

# Set internal API token
railway variables set RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250

# These will be added after RunPod deployment:
# railway variables set RUNPOD_SERVERLESS_ENDPOINT=<from-runpod>
# railway variables set RUNPOD_API_KEY=<from-runpod>
```

**Or via Railway Dashboard:**
- Go to: https://railway.app/dashboard → Variables tab
- Add: `RAILWAY_INTERNAL_API_TOKEN` = `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

### Step 3: Deploy to RunPod Serverless (~5 min)

**Once GitHub Actions completes and package is public:**

1. **Go to RunPod:** https://www.runpod.io

2. **Click "Serverless"** in top menu

3. **Click "+ New Endpoint"**

4. **Configure:**

   **Endpoint Name:** `agent-worker`

   **Container Image:**
   ```
   ghcr.io/pappdavid/agent-worker-serverless:latest
   ```

   **GPU Type:** CPU

   **Container Disk:** 20 GB

   **Environment Variables:**

   | Variable | Value |
   |----------|-------|
   | `RAILWAY_API_BASE_URL` | Get from Railway → Settings → Domains |
   | `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
   | `OPENAI_API_KEY` | Get from https://platform.openai.com/api-keys |
   | `OPENAI_MODEL` | `gpt-4o-mini` |
   | `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |
   | `PORT` | `8000` |
   | `PORT_HEALTH` | `8001` |

   **Scaling:**
   - Min Workers: **0** (scales to zero)
   - Max Workers: **3**
   - Idle Timeout: **60** seconds
   - Request Timeout: **300** seconds
   - Max Concurrent Requests: **1**

5. **Click "Deploy"**

6. **Copy your Endpoint URL** (shown after deployment)

### Step 4: Connect Railway to RunPod (~2 min)

**After RunPod deployment:**

1. **Get your RunPod API Key:**
   - RunPod → Settings → API Keys → Create Key

2. **Get your Endpoint URL:**
   - Format: `https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run`
   - From RunPod Serverless → Your Endpoint → Info

3. **Set in Railway:**
   ```bash
   railway variables set RUNPOD_SERVERLESS_ENDPOINT=https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/run
   railway variables set RUNPOD_API_KEY=YOUR_RUNPOD_API_KEY
   ```

   Or via Railway Dashboard → Variables tab

### Step 5: Test the System! (~2 min)

1. **Go to your Railway app**
2. **Login**
3. **Edit any test**
4. **Find "Cloud Agentic Recorder"**
5. **Enter scenario:**
   ```
   Navigate to the homepage and take a screenshot
   ```
6. **Click "Start Cloud Agent Exploration"**
7. **Watch it process:**
   - Railway logs show: "Triggering serverless worker..."
   - RunPod dashboard shows request appear
   - Session status: pending → running → completed
8. **Click "Compile trace to steps"**
9. **Verify steps with 🤖 Agent badge**

---

## 📊 Current Status

| Task | Status | Time |
|------|--------|------|
| Push to GitHub | ✅ Complete | Done |
| GitHub Actions (Polling) | ⏳ Building | ~10 min |
| GitHub Actions (Serverless) | ⏳ Building | ~10 min |
| Railway Deployment | ⏳ Deploying | ~5 min |
| Make Packages Public | ⬜ Waiting | 2 min |
| Set Railway Token | ⬜ Waiting | 2 min |
| Deploy RunPod Serverless | ⬜ Waiting | 5 min |
| Set RunPod Endpoint | ⬜ Waiting | 2 min |
| Test System | ⬜ Waiting | 2 min |

**Total estimated time: ~40 minutes** (mostly automated waiting)

---

## 🎯 What You'll Get

### Serverless Architecture

```
User creates session in UI
       ↓
Railway API creates AgentSession
       ↓
Railway triggers RunPod endpoint
       ↓
RunPod spins up worker (0-30 seconds)
       ↓
Worker processes session with AI + Playwright
       ↓
Worker posts trace steps to Railway
       ↓
Worker completes and scales to zero
       ↓
User compiles trace to steps
```

### Cost Benefits

**If you process 100 sessions/month:**
- Regular Pod: $180/month (24/7 running)
- **Serverless: $2/month** (pay per use)
- **Savings: $178/month (99% cheaper!)**

### Features

- ✅ Instant processing (no 10s polling delay)
- ✅ Auto-scaling (handles parallel sessions)
- ✅ Load balancing (distributes work)
- ✅ Scales to zero (no idle costs)
- ✅ Same AI + Playwright capabilities
- ✅ HTTP /ping health checks
- ✅ Request/response monitoring

---

## 🔍 Monitoring

### GitHub Actions
```
https://github.com/pappdavid/web-ui-ux-testing-tool/actions
```
Look for two workflows:
- "Build Agent Worker" (polling)
- "Build Agent Worker (Serverless)" (serverless)

### Railway
```
https://railway.app/dashboard
```
Check deployment status and logs

### RunPod (After Deployment)
```
https://www.runpod.io/console/serverless
```
Monitor:
- Requests (processing history)
- Workers (scaling behavior)
- Logs (real-time output)

---

## 📖 Documentation

- **[RUNPOD_SERVERLESS_COMPLETE.md](RUNPOD_SERVERLESS_COMPLETE.md)** - Complete setup guide
- **[DEPLOY_RUNPOD_SERVERLESS.md](DEPLOY_RUNPOD_SERVERLESS.md)** - Deployment instructions
- **[RUNPOD_SSH_SETUP.md](RUNPOD_SSH_SETUP.md)** - SSH info (not needed for serverless)

---

## 💡 Pro Tips

1. **Start with serverless** - It's cheaper for most use cases
2. **Monitor costs** - RunPod dashboard shows usage
3. **Scale gradually** - Start with max 1-2 workers
4. **Use gpt-4o-mini** - 10x cheaper than gpt-4o
5. **Check logs** - RunPod Serverless → Logs tab

---

## ⏱️ Timeline

**Now:** Builds running  
**+10 min:** GitHub Actions complete  
**+12 min:** Make packages public  
**+14 min:** Set Railway token  
**+19 min:** Deploy to RunPod Serverless  
**+21 min:** Configure Railway with endpoint  
**+23 min:** Test the system  
**+25 min:** 🎉 Everything working!

---

## 🎯 Immediate Next Steps

**Right now, while builds are running:**

1. **Get your OpenAI API key ready:**
   - Go to: https://platform.openai.com/api-keys
   - Create new key or copy existing one

2. **Get your Railway URL:**
   - Go to: https://railway.app/dashboard → "abundant-laughter"
   - Settings → Domains
   - Copy the Railway-provided domain

3. **Create RunPod account** (if not already):
   - Go to: https://www.runpod.io
   - Sign up
   - Add $10-20 credits

**Then wait for builds to complete and follow Steps 1-5 above!**

---

## ✨ You're Using the Best Approach!

**RunPod Serverless = Modern, Cost-Effective, Scalable** 🚀

- No SSH needed (HTTP endpoints)
- No 24/7 costs (pay per use)
- Auto-scaling (handles spikes)
- Load balanced (distributes work)
- Easy monitoring (RunPod dashboard)

**Everything is building. Follow the checklist when builds complete!** ✅

