# Test Login Credentials

## Default Test User (from seed script)

**Email:** `test@example.com`  
**Password:** `password123`

## How to Set Up Test User

### Option 1: Using Seed Script (Recommended)

1. **Set up DATABASE_URL** in Vercel:
   ```bash
   vercel env add DATABASE_URL production
   # Enter your PostgreSQL connection string when prompted
   ```

2. **Run database migrations**:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

3. **Seed the database** (creates test user):
   ```bash
   npm run db:seed
   ```

### Option 2: Using Create Test User Script

```bash
# Create default test user
tsx scripts/create-test-user.ts

# Or create custom user
tsx scripts/create-test-user.ts your-email@example.com your-password
```

### Option 3: Register via UI

1. Go to your deployed app: https://web-ui-ux-testing-tool-8ty8rkb00-davids-projects-3d9eb396.vercel.app
2. Click "Register"
3. Create a new account

## Testing Login

1. Navigate to: https://web-ui-ux-testing-tool-8ty8rkb00-davids-projects-3d9eb396.vercel.app/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"

## Current Deployment Status

✅ **Deployment URL:** https://web-ui-ux-testing-tool-8ty8rkb00-davids-projects-3d9eb396.vercel.app  
✅ **Status:** Ready  
⚠️ **Note:** Database connection required for login to work

