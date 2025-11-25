/**
 * Railway API Client for Agent Worker
 * Communicates with Railway app endpoints
 */

const RAILWAY_API_BASE_URL = process.env.RAILWAY_API_BASE_URL || 'http://localhost:3000'
const RAILWAY_INTERNAL_API_TOKEN = process.env.RAILWAY_INTERNAL_API_TOKEN || ''

interface AgentSession {
  id: string
  testId: string
  status: string
  description?: string
  errorMessage?: string
  test: {
    id: string
    targetUrl: string
    adminConfig?: any
    deviceProfile: string
  }
  traceSteps: any[]
}

interface TraceStep {
  orderIndex: number
  actionType: string
  selector?: string
  value?: string
  assertionType?: 'equals' | 'contains' | 'exists' | 'notExists'
  assertionExpected?: string
  meta?: Record<string, any>
}

/**
 * Fetch pending agent sessions
 */
export async function fetchPendingSessions(): Promise<AgentSession[]> {
  try {
    const response = await fetch(
      `${RAILWAY_API_BASE_URL}/api/agent-sessions?status=pending&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${RAILWAY_INTERNAL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch pending sessions: ${response.statusText}`)
    }

    const data = await response.json()
    return data.sessions || []
  } catch (error) {
    console.error('[RailwayClient] Error fetching pending sessions:', error)
    return []
  }
}

/**
 * Fetch specific agent session by ID
 */
export async function fetchSession(sessionId: string): Promise<AgentSession | null> {
  try {
    const response = await fetch(
      `${RAILWAY_API_BASE_URL}/api/agent-sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${RAILWAY_INTERNAL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch session: ${response.statusText}`)
    }

    const data = await response.json()
    return data.agentSession
  } catch (error) {
    console.error(`[RailwayClient] Error fetching session ${sessionId}:`, error)
    return null
  }
}

/**
 * Update agent session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  errorMessage?: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${RAILWAY_API_BASE_URL}/api/agent-sessions/${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${RAILWAY_INTERNAL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, errorMessage }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update session status: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error(`[RailwayClient] Error updating session ${sessionId} status:`, error)
    return false
  }
}

/**
 * Post trace steps to agent session
 */
export async function postTraceSteps(
  sessionId: string,
  steps: TraceStep[]
): Promise<boolean> {
  try {
    const response = await fetch(
      `${RAILWAY_API_BASE_URL}/api/agent-sessions/${sessionId}/trace`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAILWAY_INTERNAL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steps }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to post trace steps: ${response.statusText} - ${errorText}`)
    }

    return true
  } catch (error) {
    console.error(`[RailwayClient] Error posting trace steps to session ${sessionId}:`, error)
    return false
  }
}

