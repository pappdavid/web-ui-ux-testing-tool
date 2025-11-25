# Railway + RunPod Agentic Browser Implementation Summary

## Overview

Successfully implemented a cloud-based agentic browser system that uses Railway for test management and RunPod for AI-driven browser exploration with OpenAI + Playwright.

## Completed Components

### 1. Database Models (Prisma)

**AgentSession:**
- id, testId, status, description, errorMessage
- Tracks agent exploration sessions
- Status flow: pending → running → completed/failed

**AgentTraceStep:**
- Stores individual browser actions from agent
- Includes: actionType, selector, value, assertions, meta
- Ordered by orderIndex for replay

**TestStep Enhancement:**
- Added `source` field: "manual" | "ai" | "agent"
- Distinguishes origin of test steps

**Migration:** ✅ Successfully applied to database

### 2. Railway API Endpoints

**POST /api/agent-sessions**
- Create new agent session for a test
- User authentication required
- Verifies test ownership

**GET /api/agent-sessions?status=pending**
- Poll for pending sessions
- Internal API token authentication
- Used by RunPod worker

**GET /api/agent-sessions/[id]**
- Get session details with trace steps
- Dual auth: user session OR internal token

**PATCH /api/agent-sessions/[id]**
- Update session status
- Internal API token only
- Worker updates: running → completed/failed

**POST /api/agent-sessions/[id]/trace**
- Post trace steps from worker
- Internal API token only
- Batch upload of browser actions

**POST /api/agent-sessions/[id]/compile**
- Compile trace into TestSteps
- User authentication required
- Deletes old agent steps, inserts new ones

### 3. Authentication Middleware

**internalAuth.ts:**
- Validates RAILWAY_INTERNAL_API_TOKEN
- Protects worker-only endpoints
- Returns null on success, NextResponse on failure

**Dual authentication support:**
- User session for UI requests
- Internal token for worker requests

### 4. Trace Compiler

**compiler.ts:**
- Maps AgentTraceStep → TestStep
- Action type mapping:
  - navigate → waitForSelector (body)
  - click, input, screenshot, assert → direct mapping
  - get_dom, complete_scenario → skipped
- Sets source="agent" on compiled steps
- Deletes old agent-generated steps before inserting

### 5. RunPod Agent Worker

**railwayClient.ts:**
- HTTP client for Railway API
- Functions: fetchSession, updateSessionStatus, postTraceSteps
- Uses internal API token

**tools.ts:**
- OpenAI tool definitions for function calling
- Tools: open_page, click, type, get_dom, screenshot, assert, scroll, complete_scenario
- ToolHandlers class executes Playwright actions
- Posts trace steps after each action

**runAgentSession.ts:**
- Main agent loop
- Launches Playwright browser
- Calls OpenAI with tool definitions
- Executes LLM-requested tools
- Max 30 iterations or until complete_scenario
- Updates session status

**index.ts:**
- Worker entrypoint
- Polling mode: checks for pending sessions every 10s
- Single session mode: AGENT_SESSION_ID env var
- Environment validation

**Dockerfile:**
- Based on Node 18
- Installs Playwright dependencies
- Includes chromium browser
- CMD: tsx src/agentWorker/index.ts

### 6. Frontend UI

**CloudAgenticRecorder.tsx:**
- New component for agent session management
- Textarea for scenario description
- "Start Cloud Agent Exploration" button
- Session list with status badges
- "Compile to Steps" button for completed sessions
- Auto-polling for status updates (5s interval)

**Test Edit Page:**
- Integrated CloudAgenticRecorder component
- Positioned between Test Configuration and Step Builder
- Callbacks to refresh test data after compilation

**StepBuilder.tsx:**
- Enhanced to show `source` field
- Badges: 🤖 Agent (cyan) and ✨ AI (purple)
- Fully editable regardless of source

### 7. Documentation

**docs/AGENTIC_BROWSER_RUNPOD.md:**
- Complete architecture explanation
- Lifecycle walkthrough
- API reference
- Environment variables guide
- Deployment instructions (Railway + RunPod)
- Troubleshooting guide
- Example scenarios

**README.md:**
- Added feature description
- Quick start guide
- Link to full documentation

## Environment Variables

### Railway

```bash
RAILWAY_INTERNAL_API_TOKEN=<hex-token>
```

### RunPod Worker

```bash
RAILWAY_API_BASE_URL=https://your-app.railway.app
RAILWAY_INTERNAL_API_TOKEN=<same-as-railway>
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

## Testing Status

✅ **Build:** Successfully compiled without TypeScript errors
✅ **Migration:** Database schema updated
✅ **API Routes:** All endpoints created and typed correctly
✅ **Worker:** Complete implementation with OpenAI integration
✅ **UI:** Component integrated into test edit page

## Architecture Flow

1. **User** creates AgentSession via UI
2. **Railway** stores session with status="pending"
3. **RunPod Worker** polls Railway, finds pending session
4. **Worker** updates status to "running"
5. **Worker** launches Playwright + calls OpenAI with tools
6. **OpenAI** decides which tools to call (click, type, etc.)
7. **Worker** executes Playwright actions
8. **Worker** posts AgentTraceSteps to Railway
9. **Worker** repeats until LLM calls complete_scenario or max iterations
10. **Worker** marks session "completed"
11. **User** sees completion, clicks "Compile to Steps"
12. **Railway** compiler converts trace to TestSteps with source="agent"
13. **User** reviews/edits steps in StepBuilder
14. **User** runs test via normal Playwright engine

## Key Features

- **Agentic Exploration:** LLM decides what actions to take
- **Cloud Separation:** Railway manages data, RunPod runs heavy compute
- **Deterministic Replay:** Trace compiled to TestSteps
- **Full Editability:** Agent steps can be modified like manual steps
- **Visual Indicators:** Badge system shows step origin
- **Polling Architecture:** Worker continuously processes pending sessions
- **Error Handling:** Failed sessions tracked with error messages
- **Dual Mode:** Polling or single-session execution

## Next Steps for User

1. **Set RAILWAY_INTERNAL_API_TOKEN** in Railway dashboard
2. **Build and push Docker image** to Docker Hub/registry
3. **Deploy on RunPod** with environment variables
4. **Test locally** first with tsx src/agentWorker/index.ts
5. **Create a test scenario** and try the feature

## Files Created/Modified

### New Files
- `src/server/middleware/internalAuth.ts`
- `src/server/agent/compiler.ts`
- `src/app/api/agent-sessions/route.ts`
- `src/app/api/agent-sessions/[id]/route.ts`
- `src/app/api/agent-sessions/[id]/trace/route.ts`
- `src/app/api/agent-sessions/[id]/compile/route.ts`
- `src/agentWorker/index.ts`
- `src/agentWorker/runAgentSession.ts`
- `src/agentWorker/tools.ts`
- `src/agentWorker/railwayClient.ts`
- `src/agentWorker/Dockerfile`
- `src/agentWorker/README.md`
- `src/components/CloudAgenticRecorder.tsx`
- `docs/AGENTIC_BROWSER_RUNPOD.md`

### Modified Files
- `prisma/schema.prisma` (Added AgentSession, AgentTraceStep, TestStep.source)
- `src/app/tests/[id]/edit/page.tsx` (Integrated CloudAgenticRecorder)
- `src/components/StepBuilder.tsx` (Added source badges)
- `README.md` (Added feature documentation)

### Migrations
- `prisma/migrations/20251125201445_add_agent_models/migration.sql`

## Summary

The Railway + RunPod Cloud Agentic Browser is fully implemented and ready for deployment. The system provides an innovative way to generate test steps by having an AI agent explore web applications autonomously, creating deterministic test steps that can be executed repeatedly by the existing Playwright engine.

**Status: ✅ COMPLETE**

