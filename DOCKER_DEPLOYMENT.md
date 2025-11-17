# Docker Deployment Guide

## Recommended: Railway (Easiest)

Railway is the best choice for Docker deployment because:
- ✅ Native Docker support
- ✅ Built-in PostgreSQL database
- ✅ Free tier ($5 credit/month)
- ✅ Automatic HTTPS
- ✅ Simple GitHub integration
- ✅ Perfect for Playwright (no size limits)

### Quick Start with Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```
   Select "Empty Project" and choose your GitHub repo

4. **Add PostgreSQL Database**:
   ```bash
   railway add postgresql
   ```

5. **Set Environment Variables**:
   ```bash
   # Generate secret
   openssl rand -base64 32
   
   # Set variables
   railway variables set NEXTAUTH_SECRET="your-generated-secret"
   railway variables set NEXTAUTH_URL="https://your-app.railway.app"
   railway variables set STORAGE_PATH="/app/storage"
   ```

6. **Deploy**:
   Railway will automatically detect your Dockerfile and deploy:
   ```bash
   railway up
   ```
   Or push to GitHub - Railway will auto-deploy

7. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

8. **Seed Database (optional)**:
   ```bash
   railway run npm run db:seed
   ```

### Railway Configuration

Create `railway.json` (optional):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Alternative: Fly.io

### Quick Start with Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create App**:
   ```bash
   fly launch
   ```
   This will detect your Dockerfile

4. **Add PostgreSQL**:
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

5. **Set Secrets**:
   ```bash
   fly secrets set NEXTAUTH_SECRET="your-secret"
   fly secrets set NEXTAUTH_URL="https://your-app.fly.dev"
   fly secrets set STORAGE_PATH="/app/storage"
   ```

6. **Deploy**:
   ```bash
   fly deploy
   ```

7. **Run Migrations**:
   ```bash
   fly ssh console -C "npx prisma migrate deploy"
   ```

---

## Alternative: Render

### Quick Start with Render

1. **Create Account**: https://render.com

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select "Docker" as the environment
   - Build command: (auto-detected from Dockerfile)
   - Start command: `node server.js`

3. **Add PostgreSQL Database**:
   - Create new PostgreSQL database
   - Copy connection string

4. **Set Environment Variables**:
   - `DATABASE_URL` - From PostgreSQL service
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Render URL
   - `STORAGE_PATH` - `/opt/render/project/src/storage`

5. **Deploy**:
   - Render will build and deploy automatically

6. **Run Migrations**:
   Add to build command or run via SSH:
   ```bash
   npx prisma migrate deploy
   ```

---

## Self-Hosted (VPS)

### Using DigitalOcean Droplet

1. **Create Droplet**:
   - Ubuntu 22.04 LTS
   - Minimum 2GB RAM (4GB recommended for Playwright)

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Install Docker Compose**:
   ```bash
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

4. **Clone Repository**:
   ```bash
   git clone <your-repo>
   cd WebApp_Tester_2000
   ```

5. **Set Environment Variables**:
   Create `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:your-password@postgres:5432/testing_tool
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-domain.com
   STORAGE_PATH=/app/storage
   ```

6. **Deploy**:
   ```bash
   docker-compose up -d
   ```

7. **Run Migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

8. **Set Up Nginx** (for HTTPS):
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Comparison Table

| Platform | Ease | Free Tier | PostgreSQL | Docker | Best For |
|----------|------|-----------|------------|--------|----------|
| **Railway** | ⭐⭐⭐⭐⭐ | ✅ $5/mo | ✅ Built-in | ✅ Native | **Recommended** |
| **Fly.io** | ⭐⭐⭐⭐ | ✅ 3 VMs | ✅ Add-on | ✅ Native | Performance |
| **Render** | ⭐⭐⭐⭐ | ✅ Limited | ✅ Built-in | ✅ Supported | Free tier |
| **DigitalOcean** | ⭐⭐⭐ | ❌ | ✅ Managed | ✅ Supported | Production |
| **Self-Hosted** | ⭐⭐ | ✅ (VPS cost) | ✅ Self-managed | ✅ Full control | Full control |

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Test registration/login
- [ ] Test creating a test
- [ ] Test running a test (Playwright should work!)
- [ ] Verify screenshots are saved
- [ ] Set up monitoring/logging
- [ ] Configure backups for database
- [ ] Set up custom domain (optional)

---

## Troubleshooting

### Playwright Not Working
- ✅ Docker deployment should work perfectly
- ✅ Browsers are included in Docker image
- ✅ No size limits like Vercel serverless

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from app
- Ensure SSL is configured if needed

### Storage Issues
- Use persistent volumes for storage
- Consider S3/cloud storage for production
- Check disk space on VPS deployments

---

## Cost Estimates

- **Railway**: Free tier ($5 credit), then ~$5-20/month
- **Fly.io**: Free tier (3 VMs), then ~$5-15/month
- **Render**: Free tier (spins down), then ~$7-25/month
- **DigitalOcean**: ~$6-12/month (droplet + database)
- **Self-Hosted**: ~$5-10/month (VPS only)

---

## Recommendation

**Start with Railway** - It's the easiest and most suitable for this application:
- Native Docker support
- Built-in PostgreSQL
- Free tier to get started
- Perfect for Playwright (no size limits)
- Simple deployment process

If you need more control or better performance later, migrate to Fly.io or self-hosted.

