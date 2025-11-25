# 🔧 Fix Database Migration Issue

## Issue Detected

**Problem:** Test shows "Test not found" when trying to edit

**Cause:** The database migration for the new `source` field hasn't been applied to production yet.

**Solution:** Run the migration in Railway production

---

## Quick Fix (Via Railway Dashboard)

### Method 1: Trigger Migration via Railway Dashboard

1. **Go to Railway Dashboard**
   - https://railway.app/dashboard
   - Project: "abundant-laughter"

2. **Find your service** (Next.js app)

3. **Go to "Settings" tab**

4. **Scroll to "Deploy" section**

5. **Add a "Build Command" or "Start Command" override:**
   - Or find "Custom Build Command"

**Actually, easier method:**

### Method 2: Deploy with Migration

Railway should run migrations automatically on deploy. Let's verify the migration files are in the repo and trigger a redeploy:

1. **Check that migration exists:**
   - The migration file is at: `prisma/migrations/20251125201445_add_agent_models/migration.sql`
   - It was created when we ran the migration locally

2. **Trigger redeploy:**
   - Railway → Your service → Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a small change to trigger redeploy

---

## Better Fix: Add Migration to Start Command

We need to ensure migrations run automatically before the app starts.

### Update Railway Configuration

**In Railway Dashboard → Settings:**

Find "Start Command" and change it to:

```bash
npm run db:migrate:deploy && npm start
```

Or if that doesn't work:

```bash
npx prisma migrate deploy && npm start
```

This runs migrations before starting the app.

---

## Alternative: Run Migration Manually

Since Railway CLI has multiple services, let's create a simple migration script:

I'll add this to your repo now.

