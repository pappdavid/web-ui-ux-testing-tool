# Database Setup Guide

## Current Status

✅ DATABASE_URL environment variable has been added to Vercel (placeholder value)

⚠️ **You need to replace it with a real PostgreSQL connection string!**

## Quick Setup Options

### Option 1: Neon (Recommended - Free, Fast Setup)

1. **Sign up**: https://console.neon.tech/signup
   - Free tier available
   - No credit card required

2. **Create Project**:
   - Click "Create Project"
   - Choose a name (e.g., "web-ui-ux-testing-tool")
   - Select a region close to your users
   - Click "Create Project"

3. **Get Connection String**:
   - After project creation, you'll see the connection string
   - Format: `postgresql://user:password@host:5432/database?sslmode=require`
   - Copy the connection string

4. **Add to Vercel**:
   ```bash
   vercel env rm DATABASE_URL production
   vercel env add DATABASE_URL production
   # Paste your connection string when prompted
   ```

### Option 2: Supabase (Free)

1. **Sign up**: https://supabase.com/dashboard/projects
   - Free tier available
   - No credit card required

2. **Create Project**:
   - Click "New Project"
   - Fill in project details
   - Wait for project to be created (~2 minutes)

3. **Get Connection String**:
   - Go to Settings → Database
   - Find "Connection string" section
   - Copy the URI format connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

4. **Add to Vercel**:
   ```bash
   vercel env rm DATABASE_URL production
   vercel env add DATABASE_URL production
   # Paste your connection string when prompted
   ```

### Option 3: Vercel Postgres (Integrated)

1. **Via Vercel Dashboard**:
   - Go to your project → Storage
   - Click "Create Database" → "Postgres"
   - Follow the setup wizard
   - DATABASE_URL will be automatically added

2. **Via CLI**:
   ```bash
   vercel storage create postgres
   ```

## After Setting Up Database

1. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed database (optional)**:
   ```bash
   npm run db:seed
   ```

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

5. **Test**:
   ```bash
   ./scripts/test-browser.sh
   ```

## Verify Database Connection

Check if DATABASE_URL is set correctly:

```bash
vercel env ls
```

You should see `DATABASE_URL` listed for production environment.

## Troubleshooting

### Connection String Format

Make sure your connection string follows this format:
```
postgresql://username:password@host:port/database?sslmode=require
```

### Common Issues

1. **"Connection refused"**: Check firewall settings in your database provider
2. **"SSL required"**: Add `?sslmode=require` to your connection string
3. **"Authentication failed"**: Verify username and password are correct
4. **"Database does not exist"**: Make sure the database name is correct

### Test Connection Locally

Before deploying, test the connection locally:

```bash
# Add to .env.local
DATABASE_URL="your-connection-string"

# Test connection
npx prisma db pull
```

## Next Steps

Once DATABASE_URL is set with a real connection string:

1. ✅ Run migrations
2. ✅ Seed database (optional)
3. ✅ Redeploy to Vercel
4. ✅ Test registration and login
5. ✅ Test all features

## Support

If you encounter issues:
- Check Vercel logs: `vercel logs`
- Check database provider logs
- Verify environment variables: `vercel env ls`

