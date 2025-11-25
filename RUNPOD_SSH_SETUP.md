# RunPod SSH Access Setup

## Important Note

**For the Agent Worker deployment, you DON'T need SSH access.**

The agent worker runs as a containerized service and logs are available through the RunPod dashboard. SSH is only needed if you want to:
- Debug inside the container
- Manually inspect the running worker
- Access the pod's file system

**Most users won't need this.** Logs in the RunPod dashboard are sufficient.

---

## If You Still Want SSH Access

### Step 1: Generate SSH Key (If You Don't Have One)

Check if you already have an SSH key:
```bash
ls -la ~/.ssh/id_*.pub
```

If you see `id_rsa.pub` or `id_ed25519.pub`, you already have a key. **Skip to Step 2.**

If not, generate one:
```bash
# Generate ED25519 key (recommended, more secure)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Or RSA key (if ED25519 not supported)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one if you prefer)
```

### Step 2: Copy Your Public Key

```bash
# For ED25519
cat ~/.ssh/id_ed25519.pub

# For RSA
cat ~/.ssh/id_rsa.pub
```

Copy the entire output (starts with `ssh-ed25519` or `ssh-rsa`).

### Step 3: Add SSH Key to RunPod

1. **Go to RunPod Dashboard:** https://www.runpod.io

2. **Click on your profile icon** (top right)

3. **Select "Settings"**

4. **Go to "SSH Keys" section**

5. **Click "Add SSH Key"**

6. **Paste your public key** and give it a name (e.g., "MacBook")

7. **Save**

### Step 4: Deploy Pod with SSH Enabled

When deploying your agent worker pod:

1. In the deployment configuration
2. Look for **"Expose Ports"** or **"SSH Access"** section
3. Enable SSH access (usually port 22)
4. Deploy the pod

### Step 5: Connect to Your Pod

Once deployed, RunPod will show you the SSH command:

```bash
# Format will be something like:
ssh root@<pod-id>.runpod.io -p <port>

# Example:
ssh root@abc123def456.runpod.io -p 12345
```

---

## For Agent Worker: Use RunPod Logs Instead

### View Logs (No SSH Needed)

1. **Go to RunPod Dashboard**
2. **Click on your pod**
3. **Go to "Logs" tab**
4. **See real-time logs:**
   ```
   [AgentWorker] Starting polling mode...
   [AgentWorker] Checking for pending sessions...
   ```

### Common Operations Without SSH

**View logs:**
- RunPod Dashboard → Pod → Logs tab

**Restart worker:**
- RunPod Dashboard → Pod → Stop → Start

**Check environment variables:**
- RunPod Dashboard → Pod → Configuration tab

**Update worker code:**
1. Push changes to GitHub
2. GitHub Actions rebuilds image
3. Stop and start RunPod pod to pull latest image

---

## Debugging Inside Container (Advanced)

If you really need to debug inside the running container:

### Via RunPod Web Terminal

1. Go to your pod in RunPod dashboard
2. Click "Connect" or "Terminal" button
3. You'll get a web-based terminal inside the container

### Via SSH (If Enabled)

```bash
# SSH into pod
ssh root@<pod-id>.runpod.io -p <port>

# Once inside, access the container
docker ps  # List running containers
docker exec -it <container-id> /bin/bash

# Inside container, you can:
ls /app  # View application files
node --version  # Check Node version
npx playwright --version  # Check Playwright
cat /app/src/agentWorker/index.ts  # View source files
```

---

## What You Actually Need for Deployment

For the agent worker deployment, you only need:

### ✅ Required
- RunPod account with credits
- GitHub package (already building)
- Environment variables
- Railway URL and token

### ❌ Not Required
- SSH key
- SSH access
- Terminal access
- Direct pod access

---

## Recommended Workflow

1. **Deploy pod with Docker image**
   ```
   ghcr.io/pappdavid/agent-worker:latest
   ```

2. **Set environment variables in RunPod dashboard**

3. **Start pod**

4. **Monitor via Logs tab**

5. **If issues, check logs first**

6. **If logs insufficient, use web terminal**

7. **SSH only as last resort**

---

## Troubleshooting Without SSH

### Worker Not Starting

**Check logs for:**
```
Error: RAILWAY_INTERNAL_API_TOKEN not set
Error: OPENAI_API_KEY not set
```

**Fix:** Add missing environment variables in RunPod dashboard

### Worker Can't Connect to Railway

**Check logs for:**
```
Failed to fetch pending sessions
Error: getaddrinfo ENOTFOUND
```

**Fix:** 
- Verify `RAILWAY_API_BASE_URL` is correct
- Ensure Railway app is deployed
- Check Railway URL has `https://`

### OpenAI Errors

**Check logs for:**
```
OpenAI API error: 401 Unauthorized
```

**Fix:**
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI account has credits

### All Issues Can Be Diagnosed from Logs

The worker logs everything you need:
- Startup messages
- Environment variable validation
- Connection attempts
- Tool executions
- Error messages

**No SSH needed for 99% of cases.**

---

## Quick Reference

### View Logs
```
RunPod Dashboard → Pod → Logs tab
```

### Restart Pod
```
RunPod Dashboard → Pod → Stop → Start
```

### Update Worker
```bash
# On your machine
git push origin main

# Wait for GitHub Actions to build
# Then in RunPod: Stop → Start (pulls latest image)
```

### Check Environment
```
RunPod Dashboard → Pod → Configuration tab
```

---

## Summary

**For Agent Worker Deployment:**
- ❌ SSH not required
- ✅ Use RunPod Logs tab
- ✅ Use RunPod dashboard for configuration
- ✅ Push code to GitHub for updates

**If you absolutely need SSH:**
1. Generate key: `ssh-keygen -t ed25519`
2. Add to RunPod settings
3. Enable SSH when deploying pod
4. Use web terminal first (easier)

**Most common issues are solved by:**
1. Checking logs
2. Verifying environment variables
3. Ensuring Railway is deployed
4. Validating OpenAI API key

---

## Next Steps

**Skip SSH setup** and proceed with deployment:

1. ✅ Wait for GitHub Actions to complete
2. ✅ Make package public
3. ✅ Deploy to RunPod (no SSH needed)
4. ✅ Monitor via Logs tab

**See:** [DEPLOYMENT_STATUS_NOW.md](DEPLOYMENT_STATUS_NOW.md) for deployment steps.

