'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
        return 'bg-green-50 text-green-700 border-green-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'running':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'passed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'running':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      default:
        return null
    }
  }

  function formatDuration(startedAt: string, finishedAt: string | null) {
    if (!finishedAt) return 'Running...'
    const duration =
      new Date(finishedAt).getTime() - new Date(startedAt).getTime()
    const seconds = (duration / 1000).toFixed(2)
    return `${seconds}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!testRun) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Test run not found</h2>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const screenshots = testRun.attachments.filter((a) => a.type === 'screenshot')
  const videos = testRun.attachments.filter((a) => a.type === 'video')

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{testRun.test.name}</h2>
            <p className="text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {testRun.test.targetUrl}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-3 mb-2">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                  testRun.status
                )}`}
              >
                {getStatusIcon(testRun.status)}
                {testRun.status.toUpperCase()}
                {polling && (
                  <span className="text-xs opacity-75">(updating...)</span>
                )}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Duration: <span className="font-medium">{formatDuration(testRun.startedAt, testRun.finishedAt)}</span></p>
              <p>Device: <span className="font-medium">{testRun.deviceProfile}</span></p>
              <p>Browser: <span className="font-medium">{testRun.browserType}</span></p>
            </div>
          </div>
        </div>

        {/* UX Metrics */}
        {testRun.uxMetrics && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              UX Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {testRun.uxMetrics.ttfb && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">TTFB</div>
                  <div className="text-2xl font-bold text-gray-900">{testRun.uxMetrics.ttfb}ms</div>
                </div>
              )}
              {testRun.uxMetrics.domContentLoaded && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">DOM Ready</div>
                  <div className="text-2xl font-bold text-gray-900">{testRun.uxMetrics.domContentLoaded}ms</div>
                </div>
              )}
              {testRun.uxMetrics.loadEvent && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Load Event</div>
                  <div className="text-2xl font-bold text-gray-900">{testRun.uxMetrics.loadEvent}ms</div>
                </div>
              )}
              {testRun.uxMetrics.accessibilityIssueCount !== undefined && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">A11y Issues</div>
                  <div className={`text-2xl font-bold ${testRun.uxMetrics.accessibilityIssueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {testRun.uxMetrics.accessibilityIssueCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Recording
          </h3>
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <video controls className="w-full" src={video.pathOrUrl}>
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Screenshots
          </h3>
          <ScreenshotGallery screenshots={screenshots} />
        </div>
      )}

      {/* Admin Verification */}
      {testRun.adminChecks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Verification
          </h3>
          <AdminVerificationResults checks={testRun.adminChecks} />
        </div>
      )}

      {/* Logs */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Execution Logs
        </h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No logs available</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border-l-4 ${
                  log.level === 'error'
                    ? 'bg-red-50 text-red-800 border-red-500'
                    : log.level === 'warn'
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-500'
                    : 'bg-gray-50 text-gray-800 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded ${
                        log.level === 'error' ? 'bg-red-200 text-red-900' :
                        log.level === 'warn' ? 'bg-yellow-200 text-yellow-900' :
                        'bg-gray-200 text-gray-900'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Link */}
      <div className="text-center">
        <Link
          href={`/test-runs/${testRunId}/report`}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Full Report
        </Link>
      </div>
    </div>
  )
}
