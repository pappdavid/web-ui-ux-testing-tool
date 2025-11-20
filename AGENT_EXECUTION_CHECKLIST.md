# Agent Execution Checklist

## Quick Start Guide

### Step 1: Verify Railway Access ✅
```bash
railway whoami
railway status
```

### Step 2: Check Deployment ✅
```bash
railway logs --tail 50
```

### Step 3: Verify Environment Variables ✅
```bash
railway variables | grep -E "DATABASE_URL|NEXTAUTH"
```

### Step 4: Test Health Endpoint ✅
```bash
curl https://your-app.railway.app/api/health
```

### Step 5: Test Registration ✅
- Open browser: `https://your-app.railway.app/register`
- Register test user
- Verify success

### Step 6: Test Login ✅
- Open browser: `https://your-app.railway.app/login`
- Login with test user
- Verify success

### Step 7: Test Full Flow ✅
- Create test
- Add steps
- Run test
- Verify results

---

## Critical Issues to Check

- [ ] Build completed successfully
- [ ] Service is running
- [ ] DATABASE_URL is set
- [ ] NEXTAUTH_SECRET is set
- [ ] NEXTAUTH_URL matches deployed URL
- [ ] Database migrations ran
- [ ] Health endpoint returns "ok"
- [ ] Registration works
- [ ] Login works
- [ ] Test creation works
- [ ] Test execution works

---

## If Something Fails

1. **Check Logs**: `railway logs --tail 100`
2. **Check Health**: `curl https://your-app.railway.app/api/health`
3. **Check Variables**: `railway variables`
4. **Check Database**: `railway run npx prisma db pull`
5. **Review Error Messages**: Check browser console and Railway logs

---

**Ready to Execute**: Follow `NEXT_AGENT_TASKS.md` for detailed steps
