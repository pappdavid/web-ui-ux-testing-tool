# Quick Deployment Guide

## Option 1: Deploy to Vercel (Fastest)

### Prerequisites
- Vercel account (free at https://vercel.com)
- PostgreSQL database (Vercel Postgres, Supabase, or Neon)

### Steps

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NEXTAUTH_SECRET` - Run: `openssl rand -base64 32`
     - `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://your-app.vercel.app`)
     - `STORAGE_PATH` - Set to `/tmp` (or use S3/Vercel Blob)
     - `PLAYWRIGHT_BROWSERS_PATH` - Set to `0`

4. **Run Database Migrations**:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

5. **Redeploy** to apply environment variables:
   ```bash
   vercel --prod
   ```

## Option 2: Deploy with Docker

1. **Build and run**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. **Run migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Access**: http://localhost:3000

## Option 3: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and deploy**:
   ```bash
   railway login
   railway init
   railway add postgresql
   railway up
   ```

3. **Set environment variables** in Railway dashboard

4. **Run migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

## Post-Deployment

1. Visit your deployed URL
2. Register a new account
3. Create your first test
4. Verify everything works!

