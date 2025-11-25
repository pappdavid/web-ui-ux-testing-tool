# RunPod Agent Worker Deployment Guide

## Generated Internal API Token

**RAILWAY_INTERNAL_API_TOKEN:**
```
75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
```

⚠️ **IMPORTANT:** Keep this token secure! It will be used by both Railway and RunPod.

---

## Step 1: Configure Railway

### 1.1 Add Environment Variable to Railway

1. Go to your Railway project dashboard: https://railway.app
2. Select your project
3. Go to **Variables** tab
4. Add new variable:
   - **Name:** `RAILWAY_INTERNAL_API_TOKEN`
   - **Value:** `75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250`
5. Click **Add** and **Deploy**

### 1.2 Get Your Railway App URL

Your Railway app URL should be something like:
```
https://your-app-name.up.railway.app
```

You'll need this for RunPod configuration.

### 1.3 Verify Migration

The database migration should have already been applied. Verify in Railway logs:

```bash
railway logs
# Look for: "Applying migration `20251125201445_add_agent_models`"
```

If needed, you can manually run:
```bash
railway run npm run db:migrate
```

---

## Step 2: Build and Push Worker Docker Image

### 2.1 Create Docker Hub Account (if needed)

Go to https://hub.docker.com and create an account.

### 2.2 Login to Docker

```bash
docker login
# Enter your Docker Hub username and password
```

### 2.3 Build the Worker Image

```bash
# Navigate to agentWorker directory
cd /Users/davidpapp/WebApp_Tester_2000/src/agentWorker

# Build the image
docker build -t <your-dockerhub-username>/agent-worker:latest -f Dockerfile ../..

# Example:
# docker build -t davidpapp/agent-worker:latest -f Dockerfile ../..
```

Note: The Dockerfile path is `src/agentWorker/Dockerfile` but we need to build from project root for context.

### 2.4 Push to Docker Hub

```bash
docker push <your-dockerhub-username>/agent-worker:latest

# Example:
# docker push davidpapp/agent-worker:latest
```

---

## Step 3: Deploy to RunPod

### 3.1 Create RunPod Account

1. Go to https://www.runpod.io
2. Create an account
3. Add credits (minimum $10 recommended)

### 3.2 Deploy Container

1. Click **Deploy**
2. Select **Deploy a Container**
3. Configure:

**Container Image:**
```
<your-dockerhub-username>/agent-worker:latest
```

**Container Disk:**
- Minimum: 10GB
- Recommended: 20GB

**Template Type:**
- Select **CPU** (Playwright doesn't need GPU)
- Recommended: 4 vCPU, 8GB RAM

**Environment Variables:**

Add these environment variables:

```
RAILWAY_API_BASE_URL=https://your-app-name.up.railway.app
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

**Exposed Ports:**
- None needed (worker polls Railway)

**Volume Mounts:**
- None needed

4. Click **Deploy**

### 3.3 Monitor Worker Logs

Once deployed:
1. Click on your pod
2. Go to **Logs** tab
3. You should see:
   ```
   ============================================================
   Agent Worker Starting
   ============================================================
   [AgentWorker] Railway API: https://your-app.railway.app
   [AgentWorker] OpenAI Model: gpt-4o-mini
   [AgentWorker] Starting polling mode...
   [AgentWorker] Checking for pending sessions...
   ```

---

## Step 4: Test the Feature Locally (Optional)

Before deploying to RunPod, test locally:

### 4.1 Set Environment Variables

Create `.env.local` in agentWorker directory:

```bash
cd /Users/davidpapp/WebApp_Tester_2000/src/agentWorker
cat > .env.local << 'EOF'
RAILWAY_API_BASE_URL=http://localhost:3000
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=./.playwright
EOF
```

### 4.2 Run Worker Locally

```bash
cd /Users/davidpapp/WebApp_Tester_2000

# Make sure app is running
npm run dev

# In another terminal, run worker
export $(cat src/agentWorker/.env.local | xargs)
tsx src/agentWorker/index.ts
```

### 4.3 Create Test Session

1. Go to http://localhost:3000
2. Login with your credentials
3. Go to any test's edit page
4. Find "Cloud Agentic Recorder" section
5. Enter: "Navigate to the homepage and take a screenshot"
6. Click "Start Cloud Agent Exploration"
7. Watch the worker logs

---

## Step 5: Test on Production

### 5.1 Create a Test Session

1. Go to your Railway app URL
2. Login
3. Create or edit a test
4. In "Cloud Agentic Recorder":
   - Enter scenario: "Login with test@example.com and password123"
   - Click "Start Cloud Agent Exploration"

### 5.2 Monitor Progress

- Session status will change: pending → running → completed
- Check RunPod logs to see agent actions
- Refresh page to see status updates

### 5.3 Compile Trace

1. When status shows "completed"
2. Click "Compile trace to steps"
3. Check StepBuilder - you should see steps with 🤖 Agent badges
4. Review and edit steps if needed
5. Run the test normally

---

## Troubleshooting

### Worker Not Starting

**Check RunPod logs for errors:**
- Missing environment variables
- Invalid token
- OpenAI API key issues

**Solution:**
- Verify all environment variables are set
- Ensure RAILWAY_API_BASE_URL includes https://
- Check OpenAI API key is valid

### Worker Not Picking Up Sessions

**Check Railway logs:**
```bash
railway logs
```

Look for 401 Unauthorized errors.

**Solution:**
- Verify RAILWAY_INTERNAL_API_TOKEN matches on both Railway and RunPod
- Check token has no extra spaces or newlines

### OpenAI Errors

**Rate Limit Exceeded:**
- Reduce number of concurrent sessions
- Use gpt-4o-mini instead of gpt-4o
- Add billing to OpenAI account

**Invalid API Key:**
- Verify key starts with `sk-proj-`
- Generate new key from OpenAI dashboard

### Playwright Errors

**Browser Not Found:**
- Verify Dockerfile includes `RUN npx playwright install chromium`
- Check PLAYWRIGHT_BROWSERS_PATH is set

**Selector Not Found:**
- LLM may generate incorrect selectors
- Review trace steps in database
- Agent uses get_dom() to inspect page structure
- May need better scenario descriptions

---

## Cost Estimates

### RunPod
- **CPU Pod (4vCPU, 8GB):** ~$0.20-0.30/hour
- **Monthly (24/7):** ~$144-216/month
- **Recommendation:** Use spot instances for 50% savings

### OpenAI
- **gpt-4o-mini:** $0.150 per 1M input tokens, $0.600 per 1M output tokens
- **Average session:** 5,000-10,000 tokens (~$0.01-0.02)
- **100 sessions/month:** ~$1-2/month

### Railway
- **Current plan covers database and app**
- No additional costs for agent sessions API

---

## Scaling Considerations

### Multiple Workers

Deploy multiple RunPod pods:
- Each polls for pending sessions
- Railway distributes work automatically
- Set different SESSION_ID to run specific tests

### Priority Queue

Modify `/api/agent-sessions?status=pending`:
- Add `orderBy: { createdAt: 'asc' }` for FIFO
- Add priority field to AgentSession model
- Filter by user or test type

### Cost Optimization

1. **Use Spot Instances on RunPod** (50% cheaper)
2. **Use gpt-4o-mini** instead of gpt-4o
3. **Scale down workers** during off-hours
4. **Cache get_dom() results** for repeated pages

---

## Monitoring

### Railway Dashboard

Monitor:
- API request logs
- Database query performance
- Session creation rate

### RunPod Dashboard

Monitor:
- CPU/Memory usage
- Pod uptime
- Cost per hour

### OpenAI Dashboard

Monitor:
- Token usage
- API calls
- Rate limit usage

---

## Next Steps

1. ✅ Set RAILWAY_INTERNAL_API_TOKEN in Railway
2. ✅ Build and push Docker image
3. ✅ Deploy to RunPod with environment variables
4. ✅ Test with simple scenario
5. ⏭️ Monitor and optimize based on usage

**Support:**
- Check logs first: Railway + RunPod
- Review docs: `docs/AGENTIC_BROWSER_RUNPOD.md`
- Test locally before production deployment

---

## Security Notes

⚠️ **DO NOT:**
- Commit RAILWAY_INTERNAL_API_TOKEN to git
- Share the token publicly
- Use the same token for multiple environments

✅ **DO:**
- Use environment variables only
- Rotate token if compromised
- Use different tokens for dev/prod
- Monitor Railway logs for unauthorized access

