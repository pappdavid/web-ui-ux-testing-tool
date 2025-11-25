# Set Railway Variables - READY TO GO

## 🎯 Your RunPod Credentials

I have your RunPod serverless endpoint and API key ready to configure!

**Endpoint:** `https://82nsylciwb4j4p.api.runpod.ai`  
**API Key:** `<YOUR_RUNPOD_API_KEY>`  
**Internal Token:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

---

## ⚡ Quick Setup (Via Railway Dashboard)

### Go to Railway Dashboard
🔗 **https://railway.app/dashboard**

### Select Project
Click: **"abundant-laughter"**

### Click Your Service
Select your Next.js app service

### Go to Variables Tab
Click the **"Variables"** tab in the service

### Add These 3 Variables

Click **"+ New Variable"** and add each:

#### 1. Internal API Token
```
Name:  RAILWAY_INTERNAL_API_TOKEN
Value: 75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
```

#### 2. RunPod Endpoint
```
Name:  RUNPOD_SERVERLESS_ENDPOINT
Value: https://82nsylciwb4j4p.api.runpod.ai/run
```

#### 3. RunPod API Key
```
Name:  RUNPOD_API_KEY
Value: <YOUR_RUNPOD_API_KEY>
```

### Deploy

Railway will automatically redeploy after you add these variables.

---

## ✅ Verification

After Railway redeploys (~3 minutes):

### Test the Connection

Run this script to verify RunPod is accessible:

```bash
cd /Users/davidpapp/WebApp_Tester_2000
./scripts/test-runpod-connection.sh
```

This will test:
- ✅ Health endpoint responds
- ✅ /run endpoint is accessible
- ✅ API key is valid

### Check Railway Logs

```bash
# Via dashboard: Railway → Service → Deployments → View Logs

# Look for successful deployment:
✓ Build succeeded
✓ Starting server...
✓ Server running on port 3000
```

---

## 🧪 Test the Complete System

### Create Your First Agent Session

1. **Go to your Railway app URL**
   - Get from: Railway → Service → Settings → Domains

2. **Login** with your credentials

3. **Go to any test → Edit**

4. **Find "Cloud Agentic Recorder" section**

5. **Enter a simple scenario:**
   ```
   Navigate to the homepage, wait for the page to load, and take a screenshot
   ```

6. **Click "Start Cloud Agent Exploration"**

### Watch It Process

**In your Railway app:**
- Status updates every 5 seconds
- pending → running → completed

**In RunPod Dashboard:**
1. Go to: https://www.runpod.io/console/serverless
2. Click your endpoint: `agent-worker`
3. Go to "Requests" tab
4. You'll see your request appear
5. Click on it to see real-time logs

**Expected logs in RunPod:**
```
[Serverless] Processing session: clxxxxx
[AgentWorker] Starting session clxxxxx
[AgentWorker] Launching browser...
[AgentWorker] Iteration 1/30
[AgentWorker] Tool: open_page
[AgentWorker] Result: Successfully navigated to...
[AgentWorker] Tool: screenshot
[AgentWorker] Tool: complete_scenario
[AgentWorker] Session completed successfully
```

### Compile the Results

1. When status shows "completed"
2. Click **"Compile trace to steps"**
3. Success message appears
4. Steps show in StepBuilder
5. Each step has 🤖 **Agent** badge

### Run the Test

1. Click "Run Test" button
2. Test executes the agent-generated steps
3. Verify it passes successfully

---

## 💰 Cost Tracking

### Monitor RunPod Usage

Go to: https://www.runpod.io/console/serverless → Your endpoint

**Requests Tab shows:**
- Total requests processed
- Average execution time
- Success/failure rates

**Expected costs:**
- First session: ~$0.02-0.03
- Per session: ~$0.02
- 100 sessions/month: ~$2-3

**Way cheaper than 24/7 pod at $180/month!**

---

## 🔧 Advanced Configuration

### Adjust Worker Scaling

In RunPod Serverless → Your Endpoint → Configuration:

**For light usage:**
- Min Workers: 0
- Max Workers: 1
- Idle Timeout: 30s

**For heavy usage:**
- Min Workers: 0
- Max Workers: 5
- Idle Timeout: 60s

**For development:**
- Min Workers: 1 (keeps one warm)
- Max Workers: 2
- Idle Timeout: 300s

### Adjust Timeouts

If sessions take longer than 5 minutes:
- Increase "Execution Timeout" to 600s (10 min)
- Complex scenarios may need more time

---

## 🎊 Success Indicators

You'll know it's working when:

1. ✅ Railway logs show "Serverless worker triggered successfully"
2. ✅ RunPod shows request in "Requests" tab
3. ✅ Session status changes to "completed"
4. ✅ Can compile trace to steps
5. ✅ Steps have 🤖 Agent badge
6. ✅ Test runs successfully

---

## 🚨 If Something Goes Wrong

### Check Railway Logs First

Look for trigger messages:
```
[RunPodTrigger] Triggering serverless worker for session: clxxxxx
```

If missing:
- Verify `RUNPOD_SERVERLESS_ENDPOINT` is set
- Check it ends with `/run`

If error:
- Check `RUNPOD_API_KEY` is correct
- Verify endpoint URL is accessible

### Check RunPod Logs

Go to: RunPod → Serverless → Your Endpoint → Logs

Look for:
- Worker startup messages
- Environment variable validation
- Processing errors

Common issues:
- Missing `RAILWAY_INTERNAL_API_TOKEN` in RunPod
- Invalid `OPENAI_API_KEY`
- Missing Playwright browsers

### Test Manually

```bash
# Test RunPod health
curl https://82nsylciwb4j4p.api.runpod.ai/health \
  -H "Authorization: Bearer <YOUR_RUNPOD_API_KEY>"

# Should return: {"status":"healthy"}
```

---

## 📞 Support

- **Setup Guide:** [DEPLOY_RUNPOD_SERVERLESS.md](DEPLOY_RUNPOD_SERVERLESS.md)
- **Checklist:** [SERVERLESS_CHECKLIST.md](SERVERLESS_CHECKLIST.md)
- **Architecture:** [docs/AGENTIC_BROWSER_RUNPOD.md](docs/AGENTIC_BROWSER_RUNPOD.md)
- **Troubleshooting:** [RUNPOD_SERVERLESS_COMPLETE.md](RUNPOD_SERVERLESS_COMPLETE.md)

---

## 🎯 Quick Action Items

**Right now:**

1. ✅ **Add 3 variables in Railway dashboard** (see above)
2. ⏳ **Wait for Railway redeploy** (~3 min)
3. ✅ **Test connection** (`./scripts/test-runpod-connection.sh`)
4. ✅ **Create agent session** in UI
5. ✅ **Watch it process** in RunPod dashboard
6. ✅ **Compile and run** the test

**Total time: ~10 minutes from now!** ⏱️

---

**Your serverless worker is ready. Just add those 3 variables to Railway!** 🚀

