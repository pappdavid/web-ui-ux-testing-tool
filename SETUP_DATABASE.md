# Database Setup Instructions

## Quick Setup (Choose One)

### Option 1: Neon (Recommended - Fastest)
1. Go to https://console.neon.tech/signup
2. Sign up (free, no credit card)
3. Click "Create a project"
4. Name it: `web-ui-ux-testing-tool`
5. Copy the connection string
6. Run: `./scripts/auto-setup-test.sh` and paste the connection string

### Option 2: Supabase
1. Go to https://supabase.com/dashboard/projects
2. Sign up and create a project
3. Go to Settings → Database
4. Copy the connection string (URI format)
5. Run: `./scripts/auto-setup-test.sh` and paste the connection string

### Option 3: Vercel Postgres
1. Go to https://vercel.com/dashboard
2. Select your project
3. Storage → Create Database → Postgres
4. Copy DATABASE_URL from environment variables
5. Run: `vercel env pull .env.local`
6. Run: `./scripts/auto-setup-test.sh`

## After Setup

The script will automatically:
- ✅ Set up database schema
- ✅ Seed test data
- ✅ Start the server
- ✅ Test registration
- ✅ Test login
- ✅ Show results

## Test Credentials

After setup, you can use:
- **Email:** test@example.com
- **Password:** password123

Or register a new account through the UI.

