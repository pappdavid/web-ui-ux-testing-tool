# 🔧 Fix Issues and Test - Step by Step

## Current Status
- ✅ App deployed: https://web-ui-ux-testing-tool-production.up.railway.app
- ❌ Environment variables not set
- ❌ Database migrations not run

## Step 1: Set Environment Variables in Railway Dashboard

1. **Go to Railway Dashboard**:
   https://railway.app/project/60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3

2. **Click on your service**: `web-ui-ux-testing-tool`

3. **Go to Variables tab**

4. **Add these variables** (click "New Variable" for each):

   | Variable | Value |
   |----------|-------|
   | `NEXTAUTH_SECRET` | `T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=` |
   | `NEXTAUTH_URL` | `https://web-ui-ux-testing-tool-production.up.railway.app` |
   | `STORAGE_PATH` | `/app/storage` |
   | `NODE_ENV` | `production` |

5. **Verify DATABASE_URL exists** (should be auto-set if PostgreSQL is added)

6. **Railway will auto-redeploy** after variables are set (wait 2-3 minutes)

## Step 2: Run Database Migrations

After variables are set and app redeploys:

1. **In Railway Dashboard**, go to your service
2. **Click "Deployments" tab**
3. **Click on the latest deployment**
4. **Click "Run Command"**
5. **Enter**: `npx prisma migrate deploy`
6. **Click "Run"**

## Step 3: Seed Database

1. **In the same "Run Command" interface**
2. **Enter**: `npm run db:seed`
3. **Click "Run"**

This creates a test user:
- Email: `test@example.com`
- Password: `password123`

## Step 4: Test Again

After migrations and seeding complete, run:

```bash
TEST_URL=https://web-ui-ux-testing-tool-production.up.railway.app npm run test:deployed
```

## Quick Copy-Paste Values

```
NEXTAUTH_SECRET=T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc=
NEXTAUTH_URL=https://web-ui-ux-testing-tool-production.up.railway.app
STORAGE_PATH=/app/storage
NODE_ENV=production
```

## Alternative: Use Railway CLI

If you have Railway CLI authenticated:

```bash
railway login
railway link 60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3

railway variables set NEXTAUTH_SECRET="T781NAeI7ZYtXzq2L9tZzgTnr3WrsKbKdVEIV0DRuKc="
railway variables set NEXTAUTH_URL="https://web-ui-ux-testing-tool-production.up.railway.app"
railway variables set STORAGE_PATH="/app/storage"
railway variables set NODE_ENV="production"

railway run npx prisma migrate deploy
railway run npm run db:seed
```

## Verify Fix

After setting variables and running migrations:

1. **Visit**: https://web-ui-ux-testing-tool-production.up.railway.app
2. **Should see**: Homepage (not 404)
3. **Click "Login"**: Should work (not show configuration error)
4. **Login with**: `test@example.com` / `password123`

## Test Results Expected

After fix, tests should show:
- ✅ Registration
- ✅ Login
- ✅ Dashboard Access
- ✅ Navigation
- ✅ View Tests
- ✅ Create Test
- ✅ API endpoints working

---

**Dashboard**: https://railway.app/project/60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3  
**App URL**: https://web-ui-ux-testing-tool-production.up.railway.app

