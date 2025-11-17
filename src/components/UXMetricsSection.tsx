'use client'

interface UXMetrics {
  viewport?: string
  ttfb?: number
  domContentLoaded?: number
  loadEvent?: number
  lcp?: number
  accessibilityIssueCount?: number
  notes?: string[]
}

interface UXMetricsSectionProps {
  metrics: UXMetrics | null
}

export default function UXMetricsSection({ metrics }: UXMetricsSectionProps) {
  if (!metrics) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-gray-500">
        No UX metrics available
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">UX Metrics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {metrics.viewport && (
          <div>
            <span className="text-sm text-gray-600">Viewport</span>
            <p className="text-lg font-semibold text-gray-900">{metrics.viewport}</p>
          </div>
        )}

        {metrics.ttfb !== undefined && (
          <div>
            <span className="text-sm text-gray-600">TTFB</span>
            <p className="text-lg font-semibold text-gray-900">{metrics.ttfb}ms</p>
          </div>
        )}

        {metrics.domContentLoaded !== undefined && (
          <div>
            <span className="text-sm text-gray-600">DOM Ready</span>
            <p className="text-lg font-semibold text-gray-900">
              {metrics.domContentLoaded}ms
            </p>
          </div>
        )}

        {metrics.loadEvent !== undefined && (
          <div>
            <span className="text-sm text-gray-600">Load Event</span>
            <p className="text-lg font-semibold text-gray-900">{metrics.loadEvent}ms</p>
          </div>
        )}

        {metrics.lcp !== undefined && (
          <div>
            <span className="text-sm text-gray-600">LCP (approx)</span>
            <p className="text-lg font-semibold text-gray-900">{metrics.lcp}ms</p>
          </div>
        )}

        {metrics.accessibilityIssueCount !== undefined && (
          <div>
            <span className="text-sm text-gray-600">A11y Issues</span>
            <p
              className={`text-lg font-semibold ${
                metrics.accessibilityIssueCount > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {metrics.accessibilityIssueCount}
            </p>
          </div>
        )}
      </div>

      {metrics.notes && metrics.notes.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {metrics.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

