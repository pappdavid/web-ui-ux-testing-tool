# Deployment Guide

This guide covers deploying the UI/UX Testing Tool to various platforms.

## Prerequisites

- Database: PostgreSQL (managed service recommended)
- Storage: For screenshots/attachments (S3, Vercel Blob, or local filesystem)
- Environment variables configured

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest deployment option for Next.js applications.

#### Steps:

1. **Install Vercel CLI** (optional, can also use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or use the Vercel dashboard: https://vercel.com

3. **Configure Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel deployment URL
   - `STORAGE_PATH` - Set to `/tmp` for serverless (or use S3)
   - `PLAYWRIGHT_BROWSERS_PATH` - Set to `0` (Vercel handles this)

4. **Database Setup**:
   - Use a managed PostgreSQL service (Vercel Postgres, Supabase, Neon, etc.)
   - Run migrations: `npx prisma migrate deploy` (or use Vercel's build command)

5. **Storage Configuration**:
   - For serverless: Use S3, Vercel Blob, or Supabase Storage
   - Update storage paths in code to use cloud storage

#### Vercel Build Settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install && npm run test:install`
- **Output Directory**: `.next`

#### Limitations:

- Playwright browsers work on Vercel, but may have size limits
- File storage should use cloud storage (not local filesystem)
- Consider using Vercel's serverless functions for test execution

### Option 2: Railway

Railway provides easy deployment with PostgreSQL included.

#### Steps:

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```

5. **Set Environment Variables**:
   ```bash
   railway variables set NEXTAUTH_SECRET="your-secret"
   railway variables set NEXTAUTH_URL="https://your-app.railway.app"
   railway variables set STORAGE_PATH="./storage"
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

7. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Option 3: Render

Render provides full-stack deployment with PostgreSQL.

#### Steps:

1. **Create New Web Service** on Render dashboard
2. **Connect Repository** (GitHub/GitLab)
3. **Configure**:
   - **Build Command**: `npm install && npm run test:install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add PostgreSQL Database**:
   - Create new PostgreSQL database
   - Connection string will be provided

5. **Set Environment Variables**:
   - `DATABASE_URL` - From PostgreSQL service
   - `NEXTAUTH_SECRET` - Generate secret
   - `NEXTAUTH_URL` - Your Render URL
   - `STORAGE_PATH` - `/opt/render/project/src/storage`

6. **Run Migrations**:
   Add to build command or run manually:
   ```bash
   npx prisma migrate deploy
   ```

### Option 4: Self-Hosted (Docker)

For full control, deploy using Docker.

#### Dockerfile:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/playwright ./node_modules/playwright

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/testing_tool
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - STORAGE_PATH=/app/storage
    volumes:
      - ./storage:/app/storage
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testing_tool
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Deploy:

```bash
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Test database connection
- [ ] Verify authentication works
- [ ] Test creating and running a test
- [ ] Verify file storage works (screenshots)
- [ ] Check logs for errors
- [ ] Set up monitoring/alerting
- [ ] Configure backups for database
- [ ] Set up CI/CD for automatic deployments

## Environment Variables Reference

```env
# Required
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Optional
STORAGE_PATH="./storage"  # Use cloud storage in production
PLAYWRIGHT_BROWSERS_PATH="0"  # Let platform handle
ENCRYPTION_KEY="your-encryption-key"  # For credential encryption
```

## Production Considerations

1. **Database**: Use managed PostgreSQL (Vercel Postgres, Supabase, Neon, etc.)
2. **Storage**: Use S3, Vercel Blob, or Supabase Storage instead of local filesystem
3. **Secrets**: Use platform secret management (Vercel, Railway, etc.)
4. **Monitoring**: Set up error tracking (Sentry, etc.)
5. **Backups**: Configure automated database backups
6. **Scaling**: Consider queue system for test execution (Bull, etc.)
7. **Security**: Enable HTTPS, set secure cookies, review CORS settings

## Troubleshooting

### Build Fails

- Check Node.js version (18+ required)
- Verify all dependencies install correctly
- Check Playwright browser installation

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check database is accessible from deployment platform
- Ensure migrations have run

### Test Execution Fails

- Verify Playwright browsers are installed
- Check storage path is writable
- Review logs for specific errors

### File Storage Issues

- Use cloud storage (S3, etc.) instead of local filesystem
- Update code to use storage service SDK
- Verify storage credentials

