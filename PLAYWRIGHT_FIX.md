# Playwright Browser Fix for Railway

## Problem

Playwright browsers were being installed in the build stage but not available in the production image, causing test execution to fail with "Browser launch failed" errors.

## Solution Implemented

### Changes Made

1. **Added browser installation in runner stage** (Production image)
   - Installs Chromium browser in the final production image
   - Ensures browsers are available at runtime
   - Uses `--with-deps` flag to install all required dependencies

2. **Improved browser installation in deps stage** (Build stage)
   - Added `--with-deps` flag for better dependency handling
   - Added fallback in case `--with-deps` fails

### Code Changes

**In runner stage** (after line 101):
```dockerfile
# Install Playwright browsers in production image
# This ensures browsers are available at runtime
# Install to a shared location accessible by nextjs user
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright
RUN npx playwright install chromium --with-deps || npx playwright install chromium
RUN chown -R nextjs:nodejs /app/.playwright || true
```

**In deps stage** (line 42):
```dockerfile
# Use --with-deps flag to ensure all dependencies are installed
RUN npx playwright install chromium --with-deps || npx playwright install chromium
```

### Key Improvements

1. **Shared Browser Location**: Uses `PLAYWRIGHT_BROWSERS_PATH=/app/.playwright` to install browsers in a shared location
2. **User Permissions**: Ensures nextjs user can access browsers with `chown`
3. **Fallback**: Uses `||` operator for compatibility if `--with-deps` fails

## Why This Works

1. **Browsers in Production**: Installing browsers in the runner stage ensures they're available when the container runs
2. **System Dependencies**: The `--with-deps` flag ensures all required system libraries are installed
3. **Fallback**: The `||` operator provides a fallback if `--with-deps` fails (for compatibility)

## Next Steps

1. **Commit and push changes**:
   ```bash
   git add Dockerfile
   git commit -m "Fix: Install Playwright browsers in production image"
   git push
   ```

2. **Railway will automatically rebuild** with the new Dockerfile

3. **Verify after deployment**:
   - Test execution should now work
   - Browsers should be available at runtime

## Expected Results

After deployment:
- ✅ Browser launch should succeed
- ✅ Test execution should work
- ✅ Screenshots should be captured
- ✅ All test steps should execute

## Testing

After Railway redeploys, run:
```bash
export TEST_URL=https://web-ui-ux-testing-tool-production.up.railway.app
npx tsx scripts/test-all-features-webinform.ts
```

The test should now:
- ✅ Launch browser successfully
- ✅ Navigate to webinform.hu
- ✅ Execute all test steps
- ✅ Capture screenshots
- ✅ Complete successfully

---

**Status**: ✅ **FIX IMPLEMENTED**  
**Next**: Railway will rebuild automatically on next push

