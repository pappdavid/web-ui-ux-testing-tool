# 🚂 Deploy to Railway - Quick Guide

## ✅ All Tests Passed - Ready to Deploy!

Your webapp is working perfectly:
- ✅ Registration
- ✅ Login  
- ✅ Dashboard Access
- ✅ Navigation
- ✅ View Tests
- ✅ Create Test
- ✅ Logout

## 🚀 Quick Deployment Steps

### Option 1: Railway Dashboard (Recommended - 5 minutes)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Click "Login" or "Start a New Project"
   - Sign in with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `pappdavid/web-ui-ux-testing-tool`
   - Railway will auto-detect your Dockerfile ✅

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL` ✅

4. **Set Environment Variables**
   - Click on your service (web service)
   - Go to "Variables" tab
   - Add these variables:

   ```bash
   NEXTAUTH_SECRET=T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=
   STORAGE_PATH=/app/storage
   NODE_ENV=production
   ```

   **Note**: After first deploy, you'll get a URL. Then add:
   ```bash
   NEXTAUTH_URL=https://your-app.railway.app
   ```

5. **Deploy**
   - Railway will automatically start building and deploying
   - Watch the build logs in the Railway dashboard
   - Wait for deployment to complete (~3-5 minutes)

6. **Get Your App URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Click "Settings" → "Generate Domain" if needed

7. **Update NEXTAUTH_URL**
   - Go back to Variables
   - Update `NEXTAUTH_URL` with your actual Railway URL:
   ```bash
   NEXTAUTH_URL=https://your-actual-url.up.railway.app
   ```

8. **Run Database Migrations**
   - Click on your service
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "Run Command"
   - Enter: `npx prisma migrate deploy`
   - Click "Run"

9. **Seed Database (Optional)**
   - In the same "Run Command" interface:
   - Enter: `npm run db:seed`
   - Click "Run"

10. **Test Your Deployment**
    - Visit your Railway URL
    - Try registering a new user
    - Try logging in with: `test@example.com` / `password123`
    - Create a test and run it!

---

### Option 2: Railway CLI (After Login)

If you prefer CLI:

```bash
# 1. Login (opens browser)
railway login

# 2. Initialize project from GitHub
railway init --github pappdavid/web-ui-ux-testing-tool

# Or create empty project
railway init

# 3. Add PostgreSQL
railway add postgresql

# 4. Set environment variables
railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

# 5. Deploy
railway up

# 6. Get URL
railway domain

# 7. Update NEXTAUTH_URL (replace with your actual URL)
railway variables set NEXTAUTH_URL="https://your-app.up.railway.app"

# 8. Run migrations
railway run npx prisma migrate deploy

# 9. Seed database
railway run npm run db:seed
```

---

## 📋 Environment Variables Summary

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Auto-set by Railway | Set automatically when you add PostgreSQL |
| `NEXTAUTH_SECRET` | `T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=` | Already generated |
| `NEXTAUTH_URL` | `https://your-app.up.railway.app` | Set after first deploy |
| `STORAGE_PATH` | `/app/storage` | For Playwright screenshots |
| `NODE_ENV` | `production` | Production mode |

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at Railway URL
- [ ] Database migrations ran successfully (`railway run npx prisma migrate deploy`)
- [ ] Can register a new user
- [ ] Can log in with test credentials (`test@example.com` / `password123`)
- [ ] Can create a test
- [ ] Can run a test (Playwright should work in Docker!)
- [ ] Screenshots are saved
- [ ] Check Railway dashboard for logs/monitoring

---

## 🐛 Troubleshooting

### Build Fails
- Check Railway logs in dashboard
- Verify Dockerfile is correct (✅ already configured)
- Ensure all dependencies are in package.json (✅ already done)

### Database Connection Issues
- Verify `DATABASE_URL` is set: Check Variables tab
- Database is automatically linked when you add PostgreSQL service

### Playwright Not Working
- ✅ Should work perfectly in Docker!
- Playwright browsers are installed in Dockerfile
- Check logs for browser launch errors

### Environment Variables Not Set
- Go to Variables tab in Railway dashboard
- Add missing variables
- Redeploy if needed

---

## 🎉 Success!

Once deployed, your app will be live at:
- **URL**: `https://your-app.up.railway.app`
- **GitHub**: https://github.com/pappdavid/web-ui-ux-testing-tool
- **Railway Dashboard**: https://railway.app

---

## 💰 Cost

Railway offers:
- **Free tier**: $5 credit/month
- **Pay-as-you-go**: After free tier
- **Estimated cost**: $5-20/month for this app

---

## 📚 Next Steps

1. **Set up custom domain** (optional):
   - Railway → Settings → Custom Domain

2. **Set up monitoring**:
   - Railway dashboard provides built-in monitoring
   - Check logs: Railway dashboard → Logs tab

3. **Configure backups**:
   - Railway PostgreSQL has automatic backups
   - Check Railway dashboard → Database → Backups

4. **Set up CI/CD**:
   - Railway auto-deploys on push to main branch (if connected to GitHub)
   - Just push to GitHub and Railway will deploy automatically!

---

## 🆘 Support

- Railway Docs: https://docs.railway.app
- Railway Dashboard: https://railway.app
- Railway Discord: https://discord.gg/railway

