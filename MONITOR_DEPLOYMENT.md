# 🚂 Monitor Railway Deployment Status

## Quick Status Check

### Option 1: Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://railway.app
2. **Login** with your account
3. **Select your project**: `web-ui-ux-testing-tool`
4. **View deployment status**:
   - Current deployment status
   - Build logs
   - Service logs
   - Environment variables

### Option 2: Railway CLI (After Login)

```bash
# 1. Login (opens browser)
railway login

# 2. Link to your project (if not already linked)
railway link <project-id>

# 3. Check status
railway status

# 4. View build logs
railway logs --build

# 5. View deployment logs
railway logs --deployment

# 6. View service logs
railway logs

# 7. Get your app URL
railway domain
```

### Option 3: Using the Token

The token `d4fce5af-640b-4097-a588-c8768d254f10` appears to be a **project token**.

Project tokens can be used for:
- CI/CD deployments
- API access
- Automated scripts

**To use with Railway CLI:**
1. First login interactively: `railway login`
2. Then the token can be used for project-specific operations

**To use with Railway API:**
```bash
export RAILWAY_TOKEN="d4fce5af-640b-4097-a588-c8768d254f10"

# Query projects
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d '{"query": "{ projects { edges { node { id name } } } }"}'
```

## Monitoring Scripts

### Check Status Once
```bash
bash scripts/check-railway-status.sh
```

### Monitor Continuously
```bash
bash scripts/monitor-railway.sh
```

### Check via API
```bash
bash scripts/check-railway-api.sh
```

## What to Check

### ✅ Build Status
- Is the build successful?
- Any errors in build logs?
- Docker image built correctly?

### ✅ Deployment Status
- Is the deployment active?
- Service running?
- Health checks passing?

### ✅ Application Status
- Can you access the app URL?
- Are environment variables set?
- Database connected?

### ✅ Logs
- Application logs
- Error logs
- Build logs

## Common Issues

### Build Failed
- Check Dockerfile syntax
- Verify all dependencies
- Check build logs for specific errors

### Deployment Failed
- Check environment variables
- Verify database connection
- Check service logs

### Application Not Starting
- Check service logs: `railway logs`
- Verify PORT environment variable
- Check if migrations ran: `railway run npx prisma migrate deploy`

## Quick Commands Reference

```bash
# Status
railway status

# Logs
railway logs                    # Service logs
railway logs --build           # Build logs
railway logs --deployment       # Deployment logs

# Environment
railway variables              # List variables
railway variables set KEY=val  # Set variable

# Database
railway connect postgresql     # Connect to DB
railway run <command>          # Run command in Railway env

# Deployment
railway up                     # Deploy
railway down                   # Remove deployment

# Info
railway domain                # Get app URL
railway open                  # Open dashboard
```

## Next Steps After Deployment

1. **Verify Deployment**:
   ```bash
   railway status
   railway domain
   ```

2. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

3. **Seed Database**:
   ```bash
   railway run npm run db:seed
   ```

4. **Test Application**:
   - Visit your Railway URL
   - Register a user
   - Login
   - Create and run a test

5. **Monitor**:
   - Check logs regularly
   - Monitor Railway dashboard
   - Set up alerts if needed

---

## Railway Dashboard Links

- **Dashboard**: https://railway.app
- **Documentation**: https://docs.railway.app
- **Status Page**: https://status.railway.app

---

**Current Token**: `d4fce5af-640b-4097-a588-c8768d254f10`

Save this token securely for CI/CD and automated deployments.

