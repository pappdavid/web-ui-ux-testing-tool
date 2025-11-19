'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import UXMetricsSection from './UXMetricsSection'
import StepsTimeline from './StepsTimeline'
import AdminVerificationSection from './AdminVerificationSection'
import ScreenshotGallery from './ScreenshotGallery'

interface Report {
  testRun: {
    id: string
    status: string
    startedAt: string
    finishedAt: string | null
    duration: number | null
    deviceProfile: string
    browserType: string
    uxMetrics: any
  }
  test: {
    id: string
    name: string
    targetUrl: string
    steps: Array<{
      id: string
      orderIndex: number
      type: string
      selector: string | null
      value: string | null
    }>
  }
  logs: Array<{
    id: string
    timestamp: string
    level: string
    message: string
    data?: any
  }>
  attachments: Array<{
    id: string
    type: string
    pathOrUrl: string
  }>
  adminChecks: Array<{
    id: string
    mode: string
    status: string
    endpointOrPath: string | null
    details: string | null
    expected?: any
    actual?: any
  }>
}

interface ReportViewProps {
  testRunId: string
}

export default function ReportView({ testRunId }: ReportViewProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [testRunId])

  async function fetchReport() {
    try {
      const response = await fetch(`/api/test-runs/${testRunId}/report`)
      if (response.ok) {
        const data = await response.json()
        setReport(data.report)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'passed':
        return '✓'
      case 'failed':
        return '✗'
      case 'running':
        return '⟳'
      default:
        return '○'
    }
  }

  function formatDuration(duration: number | null) {
    if (duration === null) return 'N/A'
    return `${(duration / 1000).toFixed(2)}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Report not found</h2>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const screenshots = report.attachments.filter((a) => a.type === 'screenshot')
  const videos = report.attachments.filter((a) => a.type === 'video')

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Test Report</h2>
          <span className={`px-4 py-2 rounded-xl font-semibold border ${getStatusColor(report.testRun.status)}`}>
            {getStatusIcon(report.testRun.status)} {report.testRun.status.toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Test Name</div>
            <div className="text-lg font-bold text-gray-900 truncate">{report.test.name}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Duration</div>
            <div className="text-lg font-bold text-gray-900">{formatDuration(report.testRun.duration)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Device</div>
            <div className="text-lg font-bold text-gray-900 capitalize">{report.testRun.deviceProfile}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Browser</div>
            <div className="text-lg font-bold text-gray-900 capitalize">{report.testRun.browserType}</div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Target URL</div>
          <p className="text-sm text-gray-900 font-mono break-all">{report.test.targetUrl}</p>
        </div>
      </div>

      {/* UX Metrics */}
      <UXMetricsSection metrics={report.testRun.uxMetrics} />

      {/* Videos */}
      {videos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Recordings
          </h3>
          <div className="grid gap-4">
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

      {/* Steps Timeline */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Test Steps Execution
        </h3>
        <StepsTimeline steps={report.test.steps} logs={report.logs} />
      </div>

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Screenshots
          </h3>
          <ScreenshotGallery screenshots={screenshots} />
        </div>
      )}

      {/* Admin Verification */}
      {report.adminChecks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Verification
          </h3>
          <AdminVerificationSection checks={report.adminChecks} />
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
          {report.logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No logs available</p>
          ) : (
            report.logs.map((log) => (
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
                        {new Date(log.timestamp).toLocaleString()}
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
    </div>
  )
}
