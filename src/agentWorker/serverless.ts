#!/usr/bin/env node
/**
 * RunPod Serverless Worker
 * HTTP server that processes agent sessions on-demand
 */

import express from 'express'
import { runAgentSession } from './runAgentSession'

const app = express()
app.use(express.json())

// Health check endpoint (required by RunPod)
const healthApp = express()
healthApp.get('/ping', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// Main processing endpoint
app.post('/run', async (req, res) => {
  try {
    const { input } = req.body
    
    if (!input || !input.agentSessionId) {
      return res.status(400).json({
        error: 'Missing agentSessionId',
        message: 'Request body must include: { "input": { "agentSessionId": "..." } }'
      })
    }

    const { agentSessionId } = input

    console.log(`[Serverless] Processing session: ${agentSessionId}`)

    // Process the session
    await runAgentSession(agentSessionId)

    console.log(`[Serverless] Completed session: ${agentSessionId}`)

    res.status(200).json({
      success: true,
      agentSessionId,
      message: 'Session processed successfully'
    })

  } catch (error: any) {
    console.error('[Serverless] Error processing session:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process session'
    })
  }
})

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'ready',
    worker: 'agent-worker-serverless',
    version: '1.0.0'
  })
})

// Start servers
const PORT = parseInt(process.env.PORT || '8000', 10)
const PORT_HEALTH = parseInt(process.env.PORT_HEALTH || '8001', 10)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Serverless] Main server listening on port ${PORT}`)
})

healthApp.listen(PORT_HEALTH, '0.0.0.0', () => {
  console.log(`[Serverless] Health server listening on port ${PORT_HEALTH}`)
})

console.log('='.repeat(60))
console.log('Agent Worker (Serverless Mode)')
console.log('='.repeat(60))
console.log(`Main endpoint: http://0.0.0.0:${PORT}/run`)
console.log(`Health check: http://0.0.0.0:${PORT_HEALTH}/ping`)
console.log('Waiting for requests...')

