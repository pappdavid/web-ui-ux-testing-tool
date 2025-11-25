# Agent Worker for RunPod

This agent worker runs on RunPod and processes agent sessions using Playwright + OpenAI tool calling.

## Architecture

The worker polls the Railway app for pending `AgentSession` records, explores the target web application using LLM-driven browser actions, and posts trace steps back to Railway.

## Setup

### Environment Variables

Create a `.env` file (or configure RunPod environment):

```bash
RAILWAY_API_BASE_URL=https://your-app.railway.app
RAILWAY_INTERNAL_API_TOKEN=<generate-with-openssl-rand-hex-32>
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Running Locally

```bash
# From project root
tsx src/agentWorker/index.ts
```

### Building Docker Image

```bash
# Build from agentWorker directory
cd src/agentWorker
docker build -t agent-worker .
```

### Running with Docker

```bash
docker run --rm \
  -e RAILWAY_API_BASE_URL=https://your-app.railway.app \
  -e RAILWAY_INTERNAL_API_TOKEN=your-token \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_MODEL=gpt-4o-mini \
  agent-worker
```

### Running a Specific Session

To process a single session instead of polling:

```bash
docker run --rm \
  -e AGENT_SESSION_ID=clxxxxxxxxxxxxx \
  -e RAILWAY_API_BASE_URL=... \
  -e RAILWAY_INTERNAL_API_TOKEN=... \
  -e OPENAI_API_KEY=... \
  agent-worker
```

## Deployment on RunPod

1. Build and push Docker image to Docker Hub or registry
2. Create RunPod GPU/CPU pod with the image
3. Configure environment variables in RunPod dashboard
4. Worker will automatically poll for pending sessions

## How It Works

1. Worker polls `GET /api/agent-sessions?status=pending`
2. For each pending session:
   - Updates status to "running"
   - Launches Playwright browser
   - Calls OpenAI with tool definitions
   - Executes browser actions based on LLM tool calls
   - Posts trace steps to Railway
   - Marks session as "completed" or "failed"
3. Sleeps for 10 seconds and repeats

## Available Tools

The LLM has access to these browser tools:

- `open_page(url)` - Navigate to URL
- `click(selector)` - Click element
- `type(selector, value)` - Type into input
- `get_dom()` - Get page structure
- `screenshot(name)` - Take screenshot
- `assert(selector, type, expected)` - Verify element
- `scroll(direction)` - Scroll page
- `complete_scenario()` - Mark as done

## Troubleshooting

### Worker not picking up sessions

- Check `RAILWAY_INTERNAL_API_TOKEN` matches Railway env var
- Verify `RAILWAY_API_BASE_URL` is correct
- Check Railway logs for auth errors

### OpenAI errors

- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API rate limits
- Try different `OPENAI_MODEL` (gpt-4o, gpt-4o-mini)

### Playwright errors

- Ensure Playwright browsers are installed
- Check RunPod has sufficient memory (2GB+ recommended)
- Verify `--no-sandbox` flag is used in headless mode

