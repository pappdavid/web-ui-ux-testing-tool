# Production Deployment Checklist

## ✅ Pre-Deployment

- [ ] PostgreSQL database created and accessible
- [ ] `DATABASE_URL` configured with SSL (`?sslmode=require`)
- [ ] `NEXTAUTH_SECRET` generated (32+ characters, use `node scripts/generate-secret.js`)
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Environment variables verified (`npm run verify:env`)
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Production build tested locally (`npm run build && npm run start`)

## 🚀 Deployment Steps

### For Vercel:

1. **Set up environment variables:**
   ```bash
   npm run setup:vercel
   ```

2. **Or manually:**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Verify deployment:**
   - Test registration at `/register`
   - Test login at `/login`
   - Verify dashboard access

### For Docker:

1. **Build:**
   ```bash
   DOCKER_BUILD=true docker build -t ui-ux-testing-tool .
   ```

2. **Run:**
   ```bash
   docker-compose up -d
   ```

## 🔒 Security Checklist

- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Database uses SSL connection
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured (in `next.config.js`)
- [ ] Database credentials are unique and strong
- [ ] `.env*` files in `.gitignore`

## 📊 Post-Deployment

- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test protected routes
- [ ] Verify database connections
- [ ] Check error logs
- [ ] Monitor performance

## 🛠️ Troubleshooting

**Database connection fails:**
- Verify `DATABASE_URL` format
- Check database firewall allows Vercel IPs
- Ensure SSL is enabled

**Authentication not working:**
- Verify `NEXTAUTH_URL` matches domain exactly
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies

**Build fails:**
- Run `npm run verify:env`
- Check TypeScript errors: `npm run lint`
- Review build logs

## 📚 Documentation

- [Production Setup Guide](./PRODUCTION_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Deploy Guide](./QUICK_DEPLOY.md)

