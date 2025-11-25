# 🧪 Test Deployed Railway Application

## Quick Start

### Option 1: Interactive Script (Easiest)
```bash
bash scripts/test-railway-app.sh
```

This script will:
- Try to get your Railway URL automatically
- Prompt you if URL not found
- Run all tests

### Option 2: With Environment Variable
```bash
TEST_URL=https://your-app.up.railway.app npm run test:deployed
```

### Option 3: Get URL from Railway CLI
```bash
railway login
railway link 60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3
railway domain
# Then use the URL:
TEST_URL=https://your-url.up.railway.app npm run test:deployed
```

## Tests Included

The test suite covers:

### ✅ Authentication
- Registration
- Login
- Dashboard access

### ✅ UI Tests
- Navigation
- View tests list
- Create test
- Form validation

### ✅ API Tests
- API health check
- Get tests endpoint
- Create test endpoint

## Test Output

The script will show:
- ✅ Passed tests
- ❌ Failed tests
- Detailed error messages
- Summary statistics

## Example Output

```
🚀 Testing Deployed Railway Application
==================================================
Base URL: https://your-app.up.railway.app
Test Email: test-1234567890@example.com

🏥 Testing API Health...
✅ API Health Check

📝 Testing Registration...
✅ Registration

🔐 Testing Login...
✅ Login

📊 Testing Dashboard Access...
✅ Dashboard Access

📊 Test Summary
==================================================
✅ API Health Check
✅ Registration
✅ Login
✅ Dashboard Access
✅ Navigation
✅ View Tests
✅ Create Test
✅ API: Get Tests
✅ API: Create Test

Total: 9 | Passed: 9 | Failed: 0

🎉 All tests passed!
```

## Troubleshooting

### "BASE_URL not set"
Set the `TEST_URL` environment variable:
```bash
export TEST_URL=https://your-app.up.railway.app
npm run test:deployed
```

### "Playwright browsers not installed"
```bash
npm run test:install
```

### Tests failing
- Check if app is accessible: Visit URL in browser
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Check if database migrations ran: `railway run npx prisma migrate deploy`

### Authentication failing
- Verify `NEXTAUTH_URL` is set correctly
- Check `NEXTAUTH_SECRET` is set
- Ensure database is connected

## Manual Testing Checklist

If automated tests fail, test manually:

- [ ] App URL is accessible
- [ ] Can register a new user
- [ ] Can login with test credentials (`test@example.com` / `password123`)
- [ ] Dashboard loads
- [ ] Can view tests list
- [ ] Can create a new test
- [ ] Can fill test form
- [ ] Form validation works
- [ ] Navigation works

## Continuous Testing

To test after each deployment:

```bash
# In CI/CD pipeline
export TEST_URL=$RAILWAY_URL
npm run test:deployed
```

---

**Project ID**: `60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3`  
**Railway Dashboard**: https://railway.app/project/60e90ea3-b2b6-4e29-b29a-839fbf2e5cb3

