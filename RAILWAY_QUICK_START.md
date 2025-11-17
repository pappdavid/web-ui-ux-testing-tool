# Railway Quick Start - Copy & Paste Commands

## Step-by-Step Deployment

### 1. Login to Railway
```bash
railway login
```
*This will open your browser. Login with GitHub or email.*

### 2. Initialize Project
```bash
railway init
```
*When prompted:*
- Select **"Create a new project"**
- Name it: `web-ui-ux-testing-tool` (or any name)
- Select **"Empty project"**

### 3. Add PostgreSQL Database
```bash
railway add postgresql
```
*This automatically creates and links a PostgreSQL database.*

### 4. Set Environment Variables

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
*Copy the output - you'll need it in the next step.*

**Set all environment variables:**
```bash
# Replace YOUR_SECRET with the output from above
railway variables set NEXTAUTH_SECRET="YOUR_SECRET"

railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"
```

### 5. Deploy Application
```bash
railway up
```
*This will:*
- Build your Docker image
- Deploy your application
- Show you the deployment URL

### 6. Get Your App URL
```bash
railway domain
```
*Copy the URL shown (e.g., `https://your-app.railway.app`)*

### 7. Update NEXTAUTH_URL
```bash
# Replace YOUR_URL with the URL from step 6
railway variables set NEXTAUTH_URL="YOUR_URL"
```

### 8. Run Database Migrations
```bash
railway run npx prisma migrate deploy
```

### 9. Seed Database (Optional)
```bash
railway run npm run db:seed
```

### 10. Test Your Deployment
```bash
# Open your app
railway open

# View logs
railway logs
```

---

## All-in-One Script (After Login)

Once you're logged in, you can run this:

```bash
# Generate secret
SECRET=$(openssl rand -base64 32)

# Set variables (NEXTAUTH_URL will be set after first deploy)
railway variables set NEXTAUTH_SECRET="$SECRET"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

# Deploy
railway up

# Get URL and update NEXTAUTH_URL
URL=$(railway domain)
railway variables set NEXTAUTH_URL="$URL"

# Run migrations
railway run npx prisma migrate deploy
```

---

## Verify Deployment

1. **Check status:**
   ```bash
   railway status
   ```

2. **View logs:**
   ```bash
   railway logs
   ```

3. **Open app:**
   ```bash
   railway open
   ```

4. **Test features:**
   - Register a new account
   - Login
   - Create a test
   - Run a test (Playwright should work!)

---

## Troubleshooting

### If build fails:
```bash
railway logs --deploy
```

### If database connection fails:
```bash
# Check DATABASE_URL is set
railway variables

# Test connection
railway run npx prisma db pull
```

### If Playwright doesn't work:
- Check logs: `railway logs`
- Verify Dockerfile includes Playwright browsers
- Should work perfectly in Docker! ✅

---

## Next Steps After Deployment

1. ✅ Test registration/login
2. ✅ Create a test for webinform.hu
3. ✅ Run the test - Playwright should work!
4. ✅ Verify screenshots are saved
5. ✅ Check Railway dashboard for monitoring

---

## Railway Dashboard

Access your dashboard at: https://railway.app

Here you can:
- View deployments
- Check logs
- Monitor usage
- Manage environment variables
- View database
- Set up custom domains

