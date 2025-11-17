'use client'

import { useState, useEffect } from 'react'
import ScreenshotGallery from './ScreenshotGallery'
import AdminVerificationResults from './AdminVerificationResults'

interface TestRun {
  id: string
  status: string
  startedAt: string
  finishedAt: string | null
  deviceProfile: string
  browserType: string
  uxMetrics: any
  test: {
    id: string
    name: string
    targetUrl: string
    steps: Array<{
      id: string
      orderIndex: number
      type: string
    }>
  }
  attachments: Array<{
    id: string
    type: string
    pathOrUrl: string
  }>
  adminChecks: Array<{
    id: string
    mode: string
    status: string
    details: string | null
  }>
}

interface TestRunViewProps {
  testRunId: string
}

export default function TestRunView({ testRunId }: TestRunViewProps) {
  const [testRun, setTestRun] = useState<TestRun | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    fetchTestRun()
    fetchLogs()

    // Poll if test is still running
    if (testRun?.status === 'running') {
      setPolling(true)
      const interval = setInterval(() => {
        fetchTestRun()
        fetchLogs()
      }, 2000)

      return () => {
        clearInterval(interval)
        setPolling(false)
      }
    }
  }, [testRunId, testRun?.status])

  async function fetchTestRun() {
    try {
      const response = await fetch(`/api/test-runs/${testRunId}`)
      if (response.ok) {
        const data = await response.json()
        setTestRun(data.testRun)
        if (data.testRun.status !== 'running') {
          setPolling(false)
        }
      }
    } catch (error) {
      console.error('Error fetching test run:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLogs() {
    try {
      const response = await fetch(`/api/test-runs/${testRunId}/logs`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function formatDuration(startedAt: string, finishedAt: string | null) {
    if (!finishedAt) return 'Running...'
    const duration =
      new Date(finishedAt).getTime() - new Date(startedAt).getTime()
    return `${(duration / 1000).toFixed(2)}s`
  }

  if (loading) {
    return <div className="text-center py-8">Loading test run...</div>
  }

  if (!testRun) {
    return <div className="text-center py-8">Test run not found</div>
  }

  const screenshots = testRun.attachments.filter((a) => a.type === 'screenshot')

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{testRun.test.name}</h2>
            <p className="text-gray-600 mt-1">{testRun.test.targetUrl}</p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
                testRun.status
              )}`}
            >
              {testRun.status}
              {polling && ' (polling...)'}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Duration: {formatDuration(testRun.startedAt, testRun.finishedAt)}
            </p>
          </div>
        </div>

        {testRun.uxMetrics && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">UX Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {testRun.uxMetrics.ttfb && (
                <div>
                  <span className="text-gray-600">TTFB:</span>{' '}
                  <span className="font-medium">{testRun.uxMetrics.ttfb}ms</span>
                </div>
              )}
              {testRun.uxMetrics.domContentLoaded && (
                <div>
                  <span className="text-gray-600">DOM Ready:</span>{' '}
                  <span className="font-medium">
                    {testRun.uxMetrics.domContentLoaded}ms
                  </span>
                </div>
              )}
              {testRun.uxMetrics.loadEvent && (
                <div>
                  <span className="text-gray-600">Load:</span>{' '}
                  <span className="font-medium">{testRun.uxMetrics.loadEvent}ms</span>
                </div>
              )}
              {testRun.uxMetrics.accessibilityIssueCount !== undefined && (
                <div>
                  <span className="text-gray-600">A11y Issues:</span>{' '}
                  <span className="font-medium">
                    {testRun.uxMetrics.accessibilityIssueCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {screenshots.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Screenshots</h3>
          <ScreenshotGallery screenshots={screenshots} />
        </div>
      )}

      {testRun.adminChecks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Verification</h3>
          <AdminVerificationResults checks={testRun.adminChecks} />
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs</h3>
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`text-sm p-2 rounded ${
                  log.level === 'error'
                    ? 'bg-red-50 text-red-800'
                    : log.level === 'warn'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                <span className="font-mono text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>{' '}
                <span className="font-semibold">[{log.level.toUpperCase()}]</span>{' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

