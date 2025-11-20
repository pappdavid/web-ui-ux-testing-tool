# Next Agent Tasks - Railway CLI & Browser Testing

## Prerequisites
- ✅ Railway CLI access (`railway` command available)
- ✅ Browser access for testing
- ✅ Railway project connected
- ✅ GitHub repository access

---

## Phase 1: Verify Deployment & Database Setup 🔍

### Task 1.1: Verify Railway Deployment Status
**Priority**: Critical  
**Estimated Time**: 5 minutes

```bash
# Check Railway project status
railway status

# View recent deployments
railway logs --tail 50

# Check if service is running
railway service
```

**Success Criteria**:
- [ ] Service is deployed and running
- [ ] No critical errors in logs
- [ ] Build completed successfully

**Next Action**: If deployment failed, check logs and fix issues

---

### Task 1.2: Verify Environment Variables
**Priority**: Critical  
**Estimated Time**: 5 minutes

```bash
# List all environment variables
railway variables

# Verify required variables exist
railway variables | grep -E "DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL"
```

**Required Variables**:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random secret for authentication
- [ ] `NEXTAUTH_URL` - Your Railway app URL (e.g., `https://web-ui-ux-testing-tool-production.up.railway.app`)
- [ ] `STORAGE_PATH` - Optional, defaults to `./storage`

**If Missing**:
```bash
# Set DATABASE_URL (if not auto-set by Railway PostgreSQL)
railway variables set DATABASE_URL="postgresql://..."

# Generate and set NEXTAUTH_SECRET
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Set NEXTAUTH_URL
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
```

**Success Criteria**:
- [ ] All required variables are set
- [ ] DATABASE_URL is valid PostgreSQL connection string
- [ ] NEXTAUTH_SECRET is set and secure

---

### Task 1.3: Verify Database Connection
**Priority**: Critical  
**Estimated Time**: 10 minutes

```bash
# Test database connection
railway run npx prisma db pull

# Check database schema
railway run npx prisma db push --skip-generate

# Run migrations
railway run npx prisma migrate deploy
```

**Browser Test**:
1. Navigate to: `https://your-app.railway.app/api/health`
2. Check response:
   ```json
   {
     "status": "ok",
     "checks": {
       "database": "ok"
     }
   }
   ```

**Success Criteria**:
- [ ] Database connection successful
- [ ] Migrations applied successfully
- [ ] Health endpoint returns `"database": "ok"`

**If Failed**:
- Check DATABASE_URL format
- Verify PostgreSQL service is running in Railway
- Check Railway logs for database errors

---

## Phase 2: Test Authentication Fixes 🔐

### Task 2.1: Test Registration Flow
**Priority**: Critical  
**Estimated Time**: 10 minutes

**Browser Steps**:
1. Navigate to: `https://your-app.railway.app/register`
2. Fill in registration form:
   - Email: `test@example.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
3. Click "Create Account"
4. Verify success:
   - [ ] User is redirected to dashboard
   - [ ] No error messages displayed
   - [ ] User can see dashboard content

**CLI Verification**:
```bash
# Check Railway logs for registration
railway logs | grep -i "registration\|user created"

# Verify user was created in database
railway run npx prisma studio
# Or query directly:
railway run npx prisma db execute --stdin <<< "SELECT * FROM \"User\" LIMIT 5;"
```

**Success Criteria**:
- [ ] Registration form submits successfully
- [ ] User is created in database
- [ ] User is automatically logged in
- [ ] Redirected to dashboard

**If Failed**:
- Check Railway logs for errors
- Verify DATABASE_URL is correct
- Check error message in browser console
- Test health endpoint

---

### Task 2.2: Test Login Flow
**Priority**: Critical  
**Estimated Time**: 10 minutes

**Browser Steps**:
1. Logout if logged in (or use incognito window)
2. Navigate to: `https://your-app.railway.app/login`
3. Fill in login form:
   - Email: `test@example.com`
   - Password: `test123456`
4. Click "Sign In"
5. Verify success:
   - [ ] User is redirected to dashboard
   - [ ] No error messages displayed
   - [ ] User session is active

**CLI Verification**:
```bash
# Check Railway logs for login
railway logs | grep -i "login\|authentication\|signin"
```

**Success Criteria**:
- [ ] Login form submits successfully
- [ ] User is authenticated
- [ ] Session is created
- [ ] Redirected to dashboard

**If Failed**:
- Check Railway logs
- Verify user exists in database
- Check password hashing
- Test with different credentials

---

### Task 2.3: Test Error Handling
**Priority**: High  
**Estimated Time**: 5 minutes

**Browser Tests**:

1. **Invalid Credentials**:
   - Try login with wrong password
   - [ ] Error message displayed: "Invalid email or password"

2. **Duplicate Registration**:
   - Try registering same email twice
   - [ ] Error message displayed: "User already exists"

3. **Weak Password**:
   - Try password < 8 characters
   - [ ] Error message displayed: "Password must be at least 8 characters"

4. **Database Error Simulation**:
   - Temporarily break DATABASE_URL
   - [ ] Error message displayed: "Database not configured"

**Success Criteria**:
- [ ] All error scenarios show appropriate messages
- [ ] Error messages are user-friendly
- [ ] No technical errors exposed to users

---

## Phase 3: End-to-End Feature Testing 🧪

### Task 3.1: Test Test Creation Flow
**Priority**: High  
**Estimated Time**: 15 minutes

**Browser Steps**:
1. Login to application
2. Navigate to: `/tests/new`
3. Fill in test form:
   - Name: "My First Test"
   - Target URL: "https://example.com"
   - Device Profile: "Desktop"
4. Click "Save Test"
5. Verify:
   - [ ] Test is created successfully
   - [ ] Redirected to test edit page
   - [ ] Test appears in dashboard

**CLI Verification**:
```bash
# Check test was created
railway run npx prisma db execute --stdin <<< "SELECT id, name, \"targetUrl\" FROM \"Test\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

**Success Criteria**:
- [ ] Test creation works end-to-end
- [ ] Test saved to database
- [ ] UI updates correctly

---

### Task 3.2: Test Step Builder
**Priority**: High  
**Estimated Time**: 15 minutes

**Browser Steps**:
1. Navigate to test edit page (`/tests/[id]/edit`)
2. Add test steps:
   - Step 1: Wait for selector `body`
   - Step 2: Screenshot
   - Step 3: Click button `button`
3. Click "Save Steps"
4. Verify:
   - [ ] Steps are saved
   - [ ] Steps appear in correct order
   - [ ] Can reorder steps
   - [ ] Can delete steps

**Success Criteria**:
- [ ] Step builder works correctly
- [ ] Steps persist to database
- [ ] UI updates reflect changes

---

### Task 3.3: Test Test Execution
**Priority**: High  
**Estimated Time**: 20 minutes

**Browser Steps**:
1. Navigate to test run page (`/tests/[id]/run`)
2. Click "Start Test Run"
3. Monitor test execution:
   - [ ] Test run status updates in real-time
   - [ ] Logs appear as test runs
   - [ ] Screenshots are captured
   - [ ] UX metrics are collected
4. Wait for completion
5. Verify results:
   - [ ] Test run completes (passed/failed)
   - [ ] Screenshots are displayed
   - [ ] UX metrics are shown
   - [ ] Video recording is available (if enabled)
   - [ ] Logs are displayed

**CLI Verification**:
```bash
# Check test run was created
railway logs | grep -i "test run\|execution"

# Check storage directory for screenshots/videos
railway run ls -la storage/
```

**Success Criteria**:
- [ ] Test execution works end-to-end
- [ ] All features work (screenshots, metrics, video)
- [ ] Results are displayed correctly

---

### Task 3.4: Test Visual Regression
**Priority**: Medium  
**Estimated Time**: 15 minutes

**Browser Steps**:
1. Create a test with screenshot step
2. Run test first time (creates baseline)
3. Run test second time (compares with baseline)
4. Verify:
   - [ ] Baseline is created
   - [ ] Comparison works
   - [ ] Diff images are generated (if differences found)
   - [ ] Visual regression results are logged

**CLI Verification**:
```bash
# Check baseline storage
railway run ls -la storage/baselines/

# Check diff storage
railway run ls -la storage/diffs/
```

**Success Criteria**:
- [ ] Visual regression comparison works
- [ ] Baselines are saved
- [ ] Diffs are generated when needed

---

### Task 3.5: Test AI Test Generation
**Priority**: Medium  
**Estimated Time**: 10 minutes

**Browser Steps**:
1. Navigate to test creation page
2. Use AI generation (if UI available) or test API directly:
   ```bash
   curl -X POST https://your-app.railway.app/api/tests/generate \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{
       "targetUrl": "https://example.com",
       "description": "Test login flow"
     }'
   ```
3. Verify:
   - [ ] AI generates test steps
   - [ ] Steps are relevant to description
   - [ ] Steps can be imported/used

**Success Criteria**:
- [ ] AI generation works (or falls back to mock)
- [ ] Generated steps are valid
- [ ] Steps can be used in tests

---

## Phase 4: Performance & Monitoring 📊

### Task 4.1: Monitor Application Performance
**Priority**: Medium  
**Estimated Time**: 10 minutes

**CLI Commands**:
```bash
# Monitor Railway metrics
railway metrics

# Check memory usage
railway run free -h

# Check disk usage
railway run df -h

# Monitor logs in real-time
railway logs --tail 100 --follow
```

**Browser Tests**:
1. Check page load times
2. Monitor API response times
3. Check for memory leaks (long-running tests)

**Success Criteria**:
- [ ] Application performs well
- [ ] No memory leaks
- [ ] Response times are acceptable

---

### Task 4.2: Test Health Check Endpoint
**Priority**: Medium  
**Estimated Time**: 5 minutes

**Browser Test**:
1. Navigate to: `https://your-app.railway.app/api/health`
2. Verify response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-20T...",
     "service": "web-ui-ux-testing-tool",
     "checks": {
       "database": "ok",
       "databaseError": null
     }
   }
   ```

**CLI Test**:
```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Test with Railway CLI
railway run curl http://localhost:3000/api/health
```

**Success Criteria**:
- [ ] Health endpoint returns correct status
- [ ] Database check works
- [ ] Status codes are correct (200 for ok, 503 for degraded)

---

## Phase 5: Security & Edge Cases 🔒

### Task 5.1: Test Security Middleware
**Priority**: High  
**Estimated Time**: 10 minutes

**Browser Tests**:
1. **Protected Routes**:
   - [ ] `/dashboard` redirects to `/login` when not authenticated
   - [ ] `/tests/new` redirects to `/login` when not authenticated
   - [ ] `/tests/[id]/edit` redirects to `/login` when not authenticated

2. **Session Management**:
   - [ ] Session persists across page refreshes
   - [ ] Session expires appropriately
   - [ ] Logout works correctly

**Success Criteria**:
- [ ] All protected routes are secured
- [ ] Redirects work correctly
- [ ] Sessions are managed properly

---

### Task 5.2: Test Error Scenarios
**Priority**: Medium  
**Estimated Time**: 15 minutes

**Test Scenarios**:

1. **Database Unavailable**:
   ```bash
   # Temporarily break DATABASE_URL
   railway variables set DATABASE_URL="postgresql://invalid"
   ```
   - [ ] Application handles gracefully
   - [ ] Error messages are user-friendly
   - [ ] Health endpoint shows degraded status

2. **Invalid API Requests**:
   - [ ] Missing required fields
   - [ ] Invalid data types
   - [ ] Malformed JSON
   - [ ] All return appropriate error codes

3. **Concurrent Test Runs**:
   - [ ] Multiple tests can run simultaneously
   - [ ] No resource conflicts
   - [ ] Results are isolated

**Success Criteria**:
- [ ] All error scenarios handled gracefully
- [ ] No crashes or unhandled errors
- [ ] Error messages are helpful

---

## Phase 6: Documentation & Cleanup 📝

### Task 6.1: Update Documentation
**Priority**: Low  
**Estimated Time**: 15 minutes

**Tasks**:
- [ ] Update README with deployment status
- [ ] Document environment variables
- [ ] Add troubleshooting guide
- [ ] Update API documentation

---

### Task 6.2: Clean Up Test Data
**Priority**: Low  
**Estimated Time**: 5 minutes

**CLI Commands**:
```bash
# Clean up old test runs (optional)
railway run npx prisma db execute --stdin <<< "DELETE FROM \"TestRun\" WHERE \"finishedAt\" < NOW() - INTERVAL '7 days';"

# Clean up old attachments (optional)
railway run find storage/ -type f -mtime +7 -delete
```

---

## Phase 7: Future Enhancements 🚀

### Task 7.1: Implement Additional Features
**Priority**: Low  
**Estimated Time**: Variable

**Potential Features**:
- [ ] Email notifications for test failures
- [ ] Scheduled test runs
- [ ] Test result export (PDF/CSV)
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] API rate limiting
- [ ] Test templates/library

---

## Quick Reference Commands

### Railway CLI
```bash
# View project status
railway status

# View logs
railway logs --tail 100

# Set environment variable
railway variables set KEY="value"

# Run command in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# Connect to database
railway connect postgres
```

### Database Commands
```bash
# Run migrations
railway run npx prisma migrate deploy

# Open Prisma Studio
railway run npx prisma studio

# Check database connection
railway run npx prisma db pull

# Execute SQL query
railway run npx prisma db execute --stdin <<< "SELECT * FROM \"User\";"
```

### Testing Commands
```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Test registration API
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Test login API (via NextAuth)
curl -X POST https://your-app.railway.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## Success Metrics

### Critical (Must Pass)
- ✅ Application deploys successfully
- ✅ Database connection works
- ✅ Registration flow works
- ✅ Login flow works
- ✅ Test creation works
- ✅ Test execution works

### Important (Should Pass)
- ✅ Health check endpoint works
- ✅ Error handling works correctly
- ✅ Security middleware works
- ✅ Visual regression works
- ✅ Video recording works

### Nice to Have
- ✅ AI generation works
- ✅ Performance is acceptable
- ✅ Monitoring is set up

---

## Troubleshooting Guide

### If Deployment Fails
1. Check Railway logs: `railway logs`
2. Verify build succeeded
3. Check environment variables
4. Verify Dockerfile is correct

### If Database Connection Fails
1. Verify DATABASE_URL is set: `railway variables`
2. Test connection: `railway run npx prisma db pull`
3. Check PostgreSQL service is running in Railway
4. Verify connection string format

### If Authentication Fails
1. Check Railway logs for errors
2. Verify NEXTAUTH_SECRET is set
3. Verify NEXTAUTH_URL matches deployed URL
4. Test health endpoint
5. Check database has User table

### If Tests Fail
1. Check Railway logs
2. Verify Playwright browsers are installed
3. Check storage directory permissions
4. Verify test steps are valid

---

**Last Updated**: After fixes applied  
**Status**: Ready for agent execution  
**Next Step**: Start with Phase 1, Task 1.1
