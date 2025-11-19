# Railway Token Help

The provided token (`7af6d306-6acc-492d-a168-de512c6b4ac7`) appears to be invalid or not a user authentication token.

## Token Types

Railway has two types of tokens:

1. **User Token** - For CLI authentication (what we need)
2. **Project Token** - For project-specific API access

## Getting a Valid User Token

### Step 1: Go to Railway Dashboard
Visit: https://railway.app/account/tokens

### Step 2: Create New Token
1. Click "Create Token"
2. Give it a name (e.g., "CLI Access")
3. **Copy the token immediately** (you'll only see it once!)

### Step 3: Use the Token

**Option A: Set as environment variable**
```bash
export RAILWAY_TOKEN="your-new-token-here"
railway whoami  # Verify login
```

**Option B: Save to file**
```bash
mkdir -p ~/.railway
echo "your-new-token-here" > ~/.railway/token
railway whoami  # Verify login
```

**Option C: Use browserless login**
```bash
railway login --browserless
# Paste token when prompted
```

## Verify Token Works

After setting the token:
```bash
railway whoami
```

Should show your Railway username/email.

## If Token Still Doesn't Work

1. **Check token format**: User tokens are typically longer UUIDs
2. **Verify token is active**: Check https://railway.app/account/tokens
3. **Create a new token**: Old tokens may have been revoked
4. **Check Railway status**: Visit https://status.railway.app

## Alternative: Use Project Token

If you have a project token instead, you can:

1. **Link project directly:**
   ```bash
   railway link --project-token YOUR_PROJECT_TOKEN
   ```

2. **Set project token:**
   ```bash
   export RAILWAY_PROJECT_TOKEN="your-project-token"
   railway status
   ```

## Next Steps

Once you have a valid user token:

1. ✅ Login: `export RAILWAY_TOKEN="token"` or `railway login --browserless`
2. ✅ Link project: `railway link`
3. ✅ Add database: `railway add postgresql`
4. ✅ Set variables: `railway variables set KEY=value`
5. ✅ Deploy: `railway up`
