# Deploy to Railway NOW - Step by Step

## 🚀 Quick Deployment Guide

### Method 1: Railway Dashboard (Easiest - Recommended)

1. **Open Railway Dashboard**
   - Go to: https://railway.app
   - Login with your account

2. **Create New Project**
   - Click "New Project" button
   - Select "Empty Project" (or "Deploy from GitHub repo" if you want to connect GitHub)

3. **Railway Auto-Detects Dockerfile**
   - Railway will automatically detect your `Dockerfile`
   - It will start building your Docker image
   - This includes Playwright browsers! ✅

4. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

5. **Set Environment Variables**
   - Go to your service → "Variables" tab
   - Click "New Variable" and add:
   
   ```
   NEXTAUTH_SECRET = [Generate with: openssl rand -base64 32]
   STORAGE_PATH = /app/storage
   NODE_ENV = production
   ```
   
   **Note**: After first deploy, get your URL and add:
   ```
   NEXTAUTH_URL = https://your-app.railway.app
   ```

6. **Deploy**
   - Railway will automatically deploy when you create the project
   - Watch the build logs in real-time
   - Wait for deployment to complete (5-10 minutes first time)

7. **Get Your URL**
   - Click on your service
   - Go to "Settings" → "Generate Domain"
   - Copy the URL (e.g., `https://web-ui-ux-testing-tool-production.up.railway.app`)

8. **Update NEXTAUTH_URL**
   - Go back to Variables
   - Update `NEXTAUTH_URL` with your actual Railway URL

9. **Run Database Migrations**
   - Go to your service → "Deployments" → Latest deployment
   - Click "Shell" or use CLI:
   ```bash
   railway run npx prisma migrate deploy
   ```

10. **Test Your Deployment!**
    - Visit your Railway URL
    - Register a new account
    - Create a test
    - **Run a test - Playwright will work!** 🎉

---

### Method 2: Railway CLI (After Login)

If you prefer CLI, run these commands:

```bash
# 1. Login (opens browser)
railway login

# 2. Initialize project
railway init
# Choose: "Create a new project" → "Empty project"

# 3. Add PostgreSQL
railway add postgresql

# 4. Generate secret and set variables
SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_SECRET="$SECRET"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

# 5. Deploy
railway up

# 6. Get URL and update NEXTAUTH_URL
URL=$(railway domain)
railway variables set NEXTAUTH_URL="$URL"

# 7. Run migrations
railway run npx prisma migrate deploy

# 8. Optional: Seed database
railway run npm run db:seed
```

---

## ✅ What's Ready

- ✅ `Dockerfile` - Optimized with Playwright browsers
- ✅ `railway.json` - Railway configuration
- ✅ All dependencies configured
- ✅ Database migrations ready
- ✅ Environment variables template

## 🎯 Expected Results

After deployment:
- ✅ App accessible at Railway URL
- ✅ Database connected
- ✅ Authentication working
- ✅ Test creation working
- ✅ **Playwright tests running successfully!** 🚀

## 📊 Monitoring

- View logs: Railway dashboard → Your service → Logs
- Check status: Railway dashboard → Your service → Deployments
- Monitor usage: Railway dashboard → Usage tab

## 🆘 Troubleshooting

### Build fails?
- Check logs in Railway dashboard
- Verify Dockerfile is correct
- Check environment variables are set

### Database connection fails?
- Verify `DATABASE_URL` is set (auto-set by Railway PostgreSQL)
- Check database service is running

### Playwright not working?
- ✅ Should work perfectly in Docker!
- Check logs for browser launch errors
- Verify Playwright browsers are in Dockerfile (they are!)

---

## 🚀 Ready to Deploy?

**Go to https://railway.app and follow Method 1 above!**

Your Dockerfile is ready - Railway will detect it automatically and deploy with Playwright support! 🎉

