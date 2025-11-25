'use client'

import { useState, useEffect } from 'react'

interface AgentSession {
  id: string
  status: string
  description: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

interface CloudAgenticRecorderProps {
  testId: string
  onCompileComplete?: () => void
}

export default function CloudAgenticRecorder({
  testId,
  onCompileComplete,
}: CloudAgenticRecorderProps) {
  const [description, setDescription] = useState('')
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [loading, setLoading] = useState(false)
  const [compiling, setCompiling] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pollingSessionId, setPollingSessionId] = useState<string | null>(null)

  // Fetch existing sessions
  useEffect(() => {
    fetchSessions()
  }, [testId])

  // Poll for session status updates
  useEffect(() => {
    if (!pollingSessionId) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agent-sessions/${pollingSessionId}`)
        if (response.ok) {
          const data = await response.json()
          const updatedSession = data.agentSession
          
          setSessions(prev =>
            prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
          )

          // Stop polling if completed or failed
          if (updatedSession.status === 'completed' || updatedSession.status === 'failed') {
            setPollingSessionId(null)
          }
        }
      } catch (error) {
        console.error('Error polling session:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [pollingSessionId])

  async function fetchSessions() {
    try {
      // For simplicity, we'll fetch the test which includes sessions
      // In a real app, you'd have a dedicated endpoint
      const response = await fetch(`/api/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        // Note: This assumes the test API returns agent sessions
        // You might need to adjust based on actual implementation
        setSessions([])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  async function startAgentSession() {
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please enter a scenario description' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/agent-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          description: description.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: 'Agent session created! Worker will process it shortly.' })
        setSessions([data.agentSession, ...sessions])
        setPollingSessionId(data.agentSession.id)
        setDescription('')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to create agent session' })
      }
    } catch (error) {
      console.error('Error creating agent session:', error)
      setMessage({ type: 'error', text: 'Failed to create agent session' })
    } finally {
      setLoading(false)
    }
  }

  async function compileTrace(sessionId: string) {
    setCompiling(sessionId)
    setMessage(null)

    try {
      const response = await fetch(`/api/agent-sessions/${sessionId}/compile`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({
          type: 'success',
          text: `Compiled ${data.result.stepsInserted} steps successfully!`,
        })
        
        if (onCompileComplete) {
          onCompileComplete()
        }
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to compile trace' })
      }
    } catch (error) {
      console.error('Error compiling trace:', error)
      setMessage({ type: 'error', text: 'Failed to compile trace' })
    } finally {
      setCompiling(null)
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xl">
          🤖
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Cloud Agentic Recorder</h3>
          <p className="text-sm text-gray-600">Let AI explore your app and generate test steps</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200 rounded-2xl p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Scenario Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none"
          rows={4}
          placeholder="Describe what the agent should do, e.g., 'Login with test@example.com and password123, then create a new post with title Test Post'"
        />
        <button
          onClick={startAgentSession}
          disabled={loading || !description.trim()}
          className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Start Cloud Agent Exploration
            </>
          )}
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Recent Sessions</h4>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-300 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    {session.description || 'No description'}
                  </p>
                  {session.errorMessage && (
                    <p className="text-sm text-red-600 mt-2 font-mono">
                      Error: {session.errorMessage}
                    </p>
                  )}
                </div>
                {session.status === 'completed' && (
                  <button
                    onClick={() => compileTrace(session.id)}
                    disabled={compiling === session.id}
                    className="ml-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {compiling === session.id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Compiling...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Compile to Steps
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

