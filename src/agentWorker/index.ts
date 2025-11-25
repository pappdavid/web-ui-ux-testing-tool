#!/usr/bin/env node
/**
 * Agent Worker Entrypoint
 * Runs on RunPod to process agent sessions
 */

import { runAgentSession } from './runAgentSession'
import { fetchPendingSessions } from './railwayClient'

const POLLING_INTERVAL_MS = 10000 // 10 seconds
const AGENT_SESSION_ID = process.env.AGENT_SESSION_ID

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Run a specific session (Mode B)
 */
async function runSingleSession() {
  if (!AGENT_SESSION_ID) {
    console.error('[AgentWorker] AGENT_SESSION_ID environment variable not set')
    process.exit(1)
  }

  console.log(`[AgentWorker] Running single session: ${AGENT_SESSION_ID}`)

  try {
    await runAgentSession(AGENT_SESSION_ID)
    console.log('[AgentWorker] Session completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('[AgentWorker] Session failed:', error)
    process.exit(1)
  }
}

/**
 * Poll for pending sessions (Mode A)
 */
async function pollSessions() {
  console.log('[AgentWorker] Starting polling mode...')
  console.log(`[AgentWorker] Polling interval: ${POLLING_INTERVAL_MS}ms`)

  while (true) {
    try {
      console.log('[AgentWorker] Checking for pending sessions...')
      const sessions = await fetchPendingSessions()

      if (sessions.length === 0) {
        console.log('[AgentWorker] No pending sessions found')
      } else {
        console.log(`[AgentWorker] Found ${sessions.length} pending session(s)`)

        // Process sessions sequentially
        for (const session of sessions) {
          console.log(`[AgentWorker] Processing session: ${session.id}`)
          try {
            await runAgentSession(session.id)
          } catch (error) {
            console.error(`[AgentWorker] Error processing session ${session.id}:`, error)
            // Continue to next session
          }
        }
      }
    } catch (error) {
      console.error('[AgentWorker] Error in polling loop:', error)
    }

    // Wait before next poll
    console.log(`[AgentWorker] Sleeping for ${POLLING_INTERVAL_MS}ms...`)
    await sleep(POLLING_INTERVAL_MS)
  }
}

/**
 * Main entrypoint
 */
async function main() {
  console.log('='.repeat(60))
  console.log('Agent Worker Starting')
  console.log('='.repeat(60))

  // Validate configuration
  if (!process.env.RAILWAY_API_BASE_URL) {
    console.error('[AgentWorker] RAILWAY_API_BASE_URL not configured')
    process.exit(1)
  }

  if (!process.env.RAILWAY_INTERNAL_API_TOKEN) {
    console.error('[AgentWorker] RAILWAY_INTERNAL_API_TOKEN not configured')
    process.exit(1)
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[AgentWorker] OPENAI_API_KEY not configured')
    process.exit(1)
  }

  console.log(`[AgentWorker] Railway API: ${process.env.RAILWAY_API_BASE_URL}`)
  console.log(`[AgentWorker] OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`)

  // Choose mode based on AGENT_SESSION_ID
  if (AGENT_SESSION_ID) {
    await runSingleSession()
  } else {
    await pollSessions()
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('[AgentWorker] Unhandled rejection:', error)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('[AgentWorker] Received SIGINT, shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('[AgentWorker] Received SIGTERM, shutting down...')
  process.exit(0)
})

// Run
main().catch((error) => {
  console.error('[AgentWorker] Fatal error:', error)
  process.exit(1)
})

