'use client'

import { useEffect, useState } from 'react'
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
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'running':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  function formatDuration(duration: number | null) {
    if (duration === null) return 'N/A'
    return `${(duration / 1000).toFixed(2)}s`
  }

  if (loading) {
    return <div className="text-center py-8">Loading report...</div>
  }

  if (!report) {
    return <div className="text-center py-8">Report not found</div>
  }

  const screenshots = report.attachments.filter((a) => a.type === 'screenshot')

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-600">Test Name</span>
            <p className="text-lg font-semibold text-gray-900">{report.test.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Status</span>
            <p className={`text-lg font-semibold ${getStatusColor(report.testRun.status)}`}>
              {report.testRun.status}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Duration</span>
            <p className="text-lg font-semibold text-gray-900">
              {formatDuration(report.testRun.duration)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Device</span>
            <p className="text-lg font-semibold text-gray-900">
              {report.testRun.deviceProfile}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <span className="text-sm text-gray-600">Target URL</span>
          <p className="text-sm text-gray-900 mt-1">{report.test.targetUrl}</p>
        </div>
      </div>

      {/* UX Metrics */}
      <UXMetricsSection metrics={report.testRun.uxMetrics} />

      {/* Steps Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Steps</h3>
        <StepsTimeline steps={report.test.steps} logs={report.logs} />
      </div>

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Screenshots</h3>
          <ScreenshotGallery screenshots={screenshots} />
        </div>
      )}

      {/* Admin Verification */}
      {report.adminChecks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Verification</h3>
          <AdminVerificationSection checks={report.adminChecks} />
        </div>
      )}

      {/* Logs */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Logs</h3>
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-1">
            {report.logs.map((log) => (
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
                  {new Date(log.timestamp).toLocaleString()}
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

