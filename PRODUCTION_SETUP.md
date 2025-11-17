# Production Setup Guide

This guide will help you set up the UI/UX Testing Tool for production deployment.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, Vercel Postgres, or self-hosted)
- Vercel account (for deployment) or Docker (for self-hosting)

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Clone and install dependencies
npm install

# 2. Run production setup script
npm run setup:production

# Follow the prompts to configure:
# - Database connection string
# - NextAuth secret (generate with: openssl rand -base64 32)
# - Production URL
```

### Option 2: Manual Setup

#### Step 1: Environment Variables

Create `.env.production.local`:

```bash
cp .env.production.example .env.production.local
```

Edit `.env.production.local` with your production values:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"
STORAGE_PATH="./storage"
PLAYWRIGHT_BROWSERS_PATH="./.playwright"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### Step 2: Database Setup

1. **Create a PostgreSQL database:**
   - [Neon](https://neon.tech) - Free tier available
   - [Supabase](https://supabase.com) - Free tier available
   - [Vercel Postgres](https://vercel.com/storage/postgres) - Integrated with Vercel
   - Self-hosted PostgreSQL

2. **Get connection string** and add to `DATABASE_URL`

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed initial data (optional):**
   ```bash
   npm run db:seed
   ```

#### Step 3: Verify Configuration

```bash
npm run verify:env
```

#### Step 4: Build and Test

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

Visit `http://localhost:3000` and test registration/login.

## Vercel Deployment

### Automated Setup

```bash
npm run setup:vercel
```

This will:
- Link your project to Vercel
- Guide you through setting environment variables
- Pull environment variables locally
- Run database migrations
- Test the build

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login and link project:**
   ```bash
   vercel login
   vercel link
   ```

3. **Set environment variables:**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Run migrations after deployment:**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## Docker Deployment

1. **Build Docker image:**
   ```bash
   DOCKER_BUILD=true docker build -t ui-ux-testing-tool .
   ```

2. **Run with docker-compose:**
   ```bash
   docker-compose up -d
   ```

3. **Set environment variables in docker-compose.yml or use .env file**

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random string (32+ characters)
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] Database credentials are strong and unique
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Environment variables are set in Vercel (not committed to git)
- [ ] `.env*` files are in `.gitignore`
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Database backups are configured
- [ ] Rate limiting is considered (if needed)

## Post-Deployment

1. **Verify deployment:**
   - Test registration: Create a new account
   - Test login: Log in with credentials
   - Test dashboard: Access protected routes

2. **Monitor:**
   - Check Vercel deployment logs
   - Monitor database connections
   - Set up error tracking (optional)

3. **Optional Enhancements:**
   - Set up custom domain in Vercel
   - Configure email service for notifications
   - Set up monitoring/analytics
   - Configure CDN for static assets

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel IPs
- Ensure SSL is enabled (`?sslmode=require`)
- Check database firewall settings

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set correctly
- Clear browser cookies and try again
- Check server logs for errors

### Build Failures

- Run `npm run verify:env` to check environment variables
- Ensure all dependencies are installed
- Check for TypeScript errors: `npm run lint`
- Review build logs in Vercel dashboard

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check application logs
4. Review database connection status

