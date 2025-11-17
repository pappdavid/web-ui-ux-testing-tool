# Database Connection Guide

## Current Status

✅ **DATABASE_URL placeholder added to Vercel**  
⚠️ **Needs real PostgreSQL connection string**

## Quick Setup (3 Options)

### Option 1: Neon via Vercel (Easiest - Currently Open)

**You're currently on the Neon checkout page!**

1. ✅ Accept the Terms & Conditions (check the box if needed)
2. ✅ Click "Accept and Create" button
3. ✅ Follow the Neon setup wizard
4. ✅ DATABASE_URL will be **automatically added** to your Vercel project
5. ✅ Run migrations: `npx prisma migrate deploy`
6. ✅ Redeploy: `vercel --prod`

**That's it!** Neon will handle everything automatically.

---

### Option 2: Supabase via Vercel

1. Go to: https://vercel.com/davids-projects-3d9eb396/web-ui-ux-testing-tool/stores
2. Click "Supabase" → "Create"
3. Follow the setup wizard
4. DATABASE_URL will be automatically added

---

### Option 3: Manual Setup (Neon/Supabase Standalone)

If you prefer to set up manually:

#### Neon (Free):
1. Go to: https://console.neon.tech/signup
2. Sign up (free, no credit card)
3. Create a new project
4. Copy the connection string
5. Run:
   ```bash
   vercel env rm DATABASE_URL production
   vercel env add DATABASE_URL production
   # Paste your connection string
   ```

#### Supabase (Free):
1. Go to: https://supabase.com/dashboard/projects
2. Sign up and create a project
3. Go to Settings → Database
4. Copy the connection string (URI format)
5. Run:
   ```bash
   vercel env rm DATABASE_URL production
   vercel env add DATABASE_URL production
   # Paste your connection string
   ```

---

## After Database is Connected

Once DATABASE_URL is set with a real connection string:

### 1. Pull Environment Variables
```bash
vercel env pull .env.local
```

### 2. Run Database Migrations
```bash
npx prisma migrate deploy
```

### 3. Seed Database (Optional)
```bash
npm run db:seed
```

### 4. Redeploy to Vercel
```bash
vercel --prod
```

### 5. Test Everything
```bash
./scripts/test-browser.sh
```

---

## Verify Database Connection

Check if DATABASE_URL is set correctly:

```bash
vercel env ls | grep DATABASE_URL
```

You should see:
```
DATABASE_URL    Encrypted    Production   [timestamp]
```

---

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

Before deploying, test the connection:

```bash
# Add to .env.local
DATABASE_URL="your-connection-string"

# Test connection
npx prisma db pull
```

---

## Next Steps After Connection

1. ✅ Database connected
2. ✅ Migrations run
3. ✅ Application redeployed
4. ✅ Test registration: https://web-ui-ux-testing-tool.vercel.app/register
5. ✅ Test login: https://web-ui-ux-testing-tool.vercel.app/login
6. ✅ Test all features: `./scripts/test-browser.sh`

---

## Support

If you encounter issues:
- Check Vercel logs: `vercel logs`
- Check database provider logs
- Verify environment variables: `vercel env ls`

