# Configure RunPod Credentials in Railway

## Your RunPod Credentials

**Endpoint URL:** `https://82nsylciwb4j4p.api.runpod.ai`  
**API Key:** `<YOUR_RUNPOD_API_KEY>`

**Internal Token:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

---

## Set These in Railway Dashboard (Recommended)

### Step 1: Go to Railway Dashboard

🔗 **https://railway.app/dashboard**

### Step 2: Select Your Project

- Click on project: **"abundant-laughter"**
- Click on your **service** (the main Next.js app)

### Step 3: Go to Variables Tab

Click the **"Variables"** tab

### Step 4: Add These 3 Variables

Click **"+ New Variable"** for each:

#### Variable 1: Internal API Token
- **Name:** `RAILWAY_INTERNAL_API_TOKEN`
- **Value:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`

#### Variable 2: RunPod Endpoint
- **Name:** `RUNPOD_SERVERLESS_ENDPOINT`
- **Value:** `https://82nsylciwb4j4p.api.runpod.ai/run`

**Note:** I added `/run` to the end - this is the actual endpoint path for processing sessions.

#### Variable 3: RunPod API Key
- **Name:** `RUNPOD_API_KEY`
- **Value:** `<YOUR_RUNPOD_API_KEY>`

### Step 5: Save and Deploy

- After adding all 3 variables, Railway will automatically redeploy
- Wait for deployment to complete (~2-3 minutes)

---

## Verify Configuration

### Check Variables are Set

In Railway dashboard → Variables tab, you should see:

```
✓ RAILWAY_INTERNAL_API_TOKEN = 75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
✓ RUNPOD_SERVERLESS_ENDPOINT = https://82nsylciwb4j4p.api.runpod.ai/run
✓ RUNPOD_API_KEY = <YOUR_RUNPOD_API_KEY>
```

Plus your existing variables:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- etc.

---

## Test the Connection

### Step 1: Create an Agent Session

1. Go to your Railway app URL
2. Login
3. Edit any test
4. Find "Cloud Agentic Recorder"
5. Enter scenario:
   ```
   Navigate to the homepage and take a screenshot
   ```
6. Click "Start Cloud Agent Exploration"

### Step 2: Monitor Processing

**In Railway Logs:**
```bash
# If you have Railway CLI linked
railway logs

# Or check in dashboard: Deployments → View Logs
```

Look for:
```
[RunPodTrigger] Triggering serverless worker for session: clxxxxx
[RunPodTrigger] Serverless worker triggered successfully: job-abc123
```

**In RunPod Dashboard:**
1. Go to: https://www.runpod.io/console/serverless
2. Click your endpoint
3. Go to "Requests" tab
4. You'll see the request appear and process

**In UI:**
- Session status will change: pending → running → completed
- Auto-refreshes every 5 seconds

### Step 3: Compile and Verify

1. When status = "completed"
2. Click "Compile trace to steps"
3. Verify steps appear with 🤖 Agent badge
4. Run the test to confirm it works

---

## Troubleshooting

### "Failed to trigger serverless" in Railway Logs

**Check:**
1. Verify all 3 variables are set in Railway
2. Ensure no typos in endpoint URL
3. Check API key is correct

**Test endpoint manually:**
```bash
curl -X POST https://82nsylciwb4j4p.api.runpod.ai/health \
  -H "Authorization: Bearer <YOUR_RUNPOD_API_KEY>"
```

### Session Stays "Pending"

**Possible causes:**
1. RunPod endpoint not responding
2. Worker crashed on startup
3. Missing environment variables in RunPod

**Check:**
- RunPod dashboard → Your endpoint → Status (should be "Ready")
- RunPod → Logs tab for errors
- Verify all environment variables set in RunPod

### "Unauthorized" Error in RunPod Logs

**Issue:** Worker can't authenticate with Railway

**Fix:**
1. Verify `RAILWAY_INTERNAL_API_TOKEN` is set in RunPod
2. Check it matches: `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
3. Ensure Railway URL in RunPod has `https://`

---

## Full RunPod Environment Variables

Make sure your RunPod Serverless endpoint has these set:

| Variable | Value |
|----------|-------|
| `RAILWAY_API_BASE_URL` | Your Railway URL (from Railway → Settings → Domains) |
| `RAILWAY_INTERNAL_API_TOKEN` | `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250` |
| `OPENAI_API_KEY` | Your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |
| `PORT` | `8000` |
| `PORT_HEALTH` | `8001` |

---

## Summary of Configuration

### Railway Environment Variables
```bash
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
RUNPOD_SERVERLESS_ENDPOINT=https://82nsylciwb4j4p.api.runpod.ai/run
RUNPOD_API_KEY=<YOUR_RUNPOD_API_KEY>
```

### RunPod Serverless Environment
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

**Go to Railway Dashboard and add the 3 variables shown above!**

Then wait for Railway to redeploy and test the system.

**Complete checklist:** [SERVERLESS_CHECKLIST.md](SERVERLESS_CHECKLIST.md)

🚀 **Almost there!**

