# Railway + RunPod Cloud Agentic Browser

This document explains the cloud-based agentic browser architecture that uses Railway for test management and RunPod for AI-driven browser exploration.

## Architecture Overview

### Components

**Railway (Test Manager):**
- Hosts the Next.js application
- Manages PostgreSQL database
- Provides REST API endpoints
- Stores AgentSession and AgentTraceStep records
- Compiles traces into executable TestSteps

**RunPod (Agent Worker):**
- Runs containerized agent worker
- Polls Railway for pending AgentSessions
- Uses Playwright to control browsers
- Leverages OpenAI tool calling for intelligent exploration
- Posts trace steps back to Railway

### Data Models

**AgentSession:**
- Represents a single exploration session
- Links to a Test
- Tracks status: pending → running → completed/failed
- Stores user's scenario description
- Contains multiple AgentTraceSteps

**AgentTraceStep:**
- Individual action performed by the agent
- Includes: actionType, selector, value, assertions
- Ordered by orderIndex
- Can be compiled into deterministic TestSteps

**TestStep:**
- Standard test step executed by Playwright engine
- Has `source` field: "manual", "ai", or "agent"
- Agent-generated steps are marked with source="agent"

## Complete Lifecycle

### 1. User Creates Agent Session

```typescript
// User goes to test edit page
// Enters scenario description
// Clicks "Start Cloud Agent Exploration"

POST /api/agent-sessions
{
  "testId": "clxxxxx",
  "description": "Login with test@example.com and create a new post"
}

// Response:
{
  "agentSession": {
    "id": "clyyyyy",
    "status": "pending",
    ...
  }
}
```

### 2. RunPod Worker Picks Up Session

```typescript
// Worker polls Railway every 10 seconds
GET /api/agent-sessions?status=pending
Authorization: Bearer <RAILWAY_INTERNAL_API_TOKEN>

// Gets pending session, updates status
PATCH /api/agent-sessions/clyyyyy
{
  "status": "running"
}
```

### 3. Agent Explores Application

Worker:
1. Launches Playwright browser
2. Calls OpenAI with tool definitions
3. LLM decides which tools to call
4. Worker executes Playwright actions
5. Posts trace steps to Railway

Available tools:
- `open_page(url)` - Navigate
- `click(selector)` - Click element
- `type(selector, value)` - Fill input
- `get_dom()` - Inspect page structure
- `screenshot(name)` - Capture state
- `assert(selector, type, expected)` - Verify element
- `scroll(direction)` - Scroll page
- `complete_scenario()` - Mark done

```typescript
// After each action
POST /api/agent-sessions/clyyyyy/trace
{
  "steps": [
    {
      "orderIndex": 0,
      "actionType": "navigate",
      "value": "https://example.com"
    },
    {
      "orderIndex": 1,
      "actionType": "click",
      "selector": "button#login"
    }
  ]
}
```

### 4. Worker Completes Session

```typescript
PATCH /api/agent-sessions/clyyyyy
{
  "status": "completed"
}

// Or if error:
{
  "status": "failed",
  "errorMessage": "..."
}
```

### 5. User Compiles Trace to Steps

```typescript
// User clicks "Compile to Steps" button
POST /api/agent-sessions/clyyyyy/compile

// Compiler:
// 1. Loads AgentTraceSteps
// 2. Maps actionTypes to TestStep types
// 3. Deletes old agent-generated steps
// 4. Inserts new TestSteps with source="agent"

// Response:
{
  "result": {
    "testId": "clxxxxx",
    "stepsInserted": 15,
    "stepsSkipped": 2,
    "skippedTypes": ["get_dom", "complete_scenario"]
  }
}
```

### 6. User Runs Test

TestSteps are now available in the test. User can:
- Review/edit steps in StepBuilder
- Run test via normal Playwright engine
- Steps with source="agent" show 🤖 Agent badge

## Environment Variables

### Railway App

Add these to your Railway project:

```bash
# Internal API token for worker authentication
RAILWAY_INTERNAL_API_TOKEN=<generate-with-openssl-rand-hex-32>
```

Generate token:
```bash
openssl rand -hex 32
```

### RunPod Worker

Configure in RunPod pod environment:

```bash
# Railway API
RAILWAY_API_BASE_URL=https://your-app.railway.app
RAILWAY_INTERNAL_API_TOKEN=<same-as-railway>

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Playwright
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

## Deployment

### Railway Deployment

1. Push code to GitHub
2. Railway auto-deploys on push
3. Set `RAILWAY_INTERNAL_API_TOKEN` in Railway dashboard
4. Database migrations run automatically

### RunPod Deployment

#### Option 1: Docker Hub

```bash
# Build and push
cd src/agentWorker
docker build -t your-username/agent-worker:latest .
docker push your-username/agent-worker:latest

# Deploy on RunPod
# - Create new pod
# - Use your Docker image
# - Set environment variables
# - Choose CPU or GPU (CPU is sufficient)
```

#### Option 2: Local Testing

```bash
# Install dependencies
npm install

# Set environment variables
export RAILWAY_API_BASE_URL=http://localhost:3000
export RAILWAY_INTERNAL_API_TOKEN=your-token
export OPENAI_API_KEY=sk-...

# Run worker
tsx src/agentWorker/index.ts
```

#### Option 3: Single Session Mode

Process one specific session:

```bash
docker run --rm \
  -e AGENT_SESSION_ID=clyyyyy \
  -e RAILWAY_API_BASE_URL=... \
  -e RAILWAY_INTERNAL_API_TOKEN=... \
  -e OPENAI_API_KEY=... \
  your-username/agent-worker:latest
```

## API Reference

### Create Agent Session

```http
POST /api/agent-sessions
Authorization: Cookie (user session)
Content-Type: application/json

{
  "testId": "string",
  "description": "string (optional)"
}
```

### Get Pending Sessions (Internal)

```http
GET /api/agent-sessions?status=pending&limit=10
Authorization: Bearer <RAILWAY_INTERNAL_API_TOKEN>
```

### Get Session Details

```http
GET /api/agent-sessions/:id
Authorization: Cookie (user) OR Bearer (internal)
```

### Update Session Status (Internal)

```http
PATCH /api/agent-sessions/:id
Authorization: Bearer <RAILWAY_INTERNAL_API_TOKEN>
Content-Type: application/json

{
  "status": "running" | "completed" | "failed",
  "errorMessage": "string (optional)"
}
```

### Post Trace Steps (Internal)

```http
POST /api/agent-sessions/:id/trace
Authorization: Bearer <RAILWAY_INTERNAL_API_TOKEN>
Content-Type: application/json

{
  "steps": [
    {
      "orderIndex": 0,
      "actionType": "navigate" | "click" | "input" | "screenshot" | "assert" | ...,
      "selector": "string (optional)",
      "value": "string (optional)",
      "assertionType": "equals" | "contains" | "exists" | "notExists" (optional),
      "assertionExpected": "string (optional)",
      "meta": {} (optional)
    }
  ]
}
```

### Compile Trace (User)

```http
POST /api/agent-sessions/:id/compile
Authorization: Cookie (user session)
```

## Action Type Mapping

| Agent ActionType | TestStep Type | Notes |
|-----------------|---------------|-------|
| navigate | waitForSelector | Converted to wait for body |
| click | click | Direct mapping |
| input, type | input | Direct mapping |
| screenshot | screenshot | Direct mapping |
| assert | assert | Direct mapping |
| scroll | scroll | Direct mapping |
| select | select | Direct mapping |
| get_dom | (skipped) | Internal tool only |
| complete_scenario | (skipped) | Signal only |

## Troubleshooting

### Worker Not Picking Up Sessions

**Check Railway logs:**
```bash
railway logs
```

Look for auth errors in agent session endpoints.

**Verify token:**
- Ensure `RAILWAY_INTERNAL_API_TOKEN` matches on both Railway and RunPod
- Token must be exactly the same (no extra spaces)

**Check API URL:**
- Use full URL with https://
- Don't include trailing slash

### OpenAI Errors

**Rate limits:**
- Use gpt-4o-mini for lower costs
- Add delay between tool calls
- Monitor OpenAI dashboard

**Invalid JSON:**
- Check OpenAI response in worker logs
- Model sometimes returns markdown - handled by worker
- Increase temperature if too deterministic

### Playwright Errors

**Browser crashes:**
- Ensure RunPod has 2GB+ memory
- Use `--no-sandbox` flag (already included)
- Check RunPod logs for OOM errors

**Selectors not found:**
- Agent uses `get_dom()` to inspect page
- Selectors are LLM-generated, may need retries
- Review trace steps to debug

### Compilation Errors

**Session not completed:**
- Only completed sessions can be compiled
- Check session status in UI
- Review errorMessage if failed

**No steps to compile:**
- Worker may have failed silently
- Check worker logs on RunPod
- Verify OpenAI API key is valid

## Example Scenarios

### Simple Login Flow

```
"Login to the application using email test@example.com and password password123"
```

Agent will:
1. Navigate to target URL
2. Find email/username input
3. Type email
4. Find password input
5. Type password
6. Find and click login button
7. Take screenshot of result
8. Assert successful login (e.g., dashboard visible)

### Create Content

```
"After logging in with test@example.com/password123, create a new blog post with title 'Test Post' and content 'This is a test'"
```

Agent will:
1. Perform login steps
2. Find "Create Post" or similar button
3. Click to open create form
4. Fill in title field
5. Fill in content field
6. Submit form
7. Verify post created
8. Take screenshots at key points

### Complex Multi-Page Flow

```
"Register a new account, verify the welcome email message is shown, complete the profile setup with name 'Test User', and navigate to the dashboard"
```

Agent will:
1. Navigate to registration
2. Fill registration form
3. Submit and wait for confirmation
4. Assert welcome message
5. Navigate to profile
6. Fill profile information
7. Save profile
8. Navigate to dashboard
9. Assert dashboard loaded

## Future Improvements

1. **Video Recording** - Capture full session as video
2. **Advanced Assertions** - Visual regression, accessibility checks
3. **Multi-Agent** - Parallel session processing
4. **Cost Tracking** - Monitor OpenAI API costs per session
5. **Custom Tools** - Allow defining domain-specific tools
6. **Open-Source LLM** - Use Llama or similar on RunPod GPU
7. **Session Replay** - Re-run trace without LLM for debugging
8. **Interactive Mode** - Human-in-the-loop for complex scenarios

## Support

For issues or questions:
- Check Railway logs: `railway logs`
- Check RunPod logs in dashboard
- Review trace steps in database
- Verify all environment variables are set correctly

## Related Documentation

- [Main README](../README.md)
- [Agent Worker README](../src/agentWorker/README.md)
- [Database Schema](../prisma/schema.prisma)

