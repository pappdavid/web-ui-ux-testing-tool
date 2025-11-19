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

function getMetricColor(value: number, type: 'ttfb' | 'dom' | 'load' | 'lcp'): string {
  // Performance thresholds (in ms)
  const thresholds = {
    ttfb: { good: 200, poor: 800 },
    dom: { good: 2000, poor: 4000 },
    load: { good: 3000, poor: 6000 },
    lcp: { good: 2500, poor: 4000 },
  }

  const threshold = thresholds[type]
  if (value <= threshold.good) return 'text-green-600'
  if (value <= threshold.poor) return 'text-yellow-600'
  return 'text-red-600'
}

export default function UXMetricsSection({ metrics }: UXMetricsSectionProps) {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No UX metrics available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        UX Performance Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {metrics.viewport && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">Viewport</div>
            <div className="text-xl font-bold text-gray-900">{metrics.viewport}</div>
          </div>
        )}

        {metrics.ttfb !== undefined && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">TTFB</div>
            <div className={`text-xl font-bold ${getMetricColor(metrics.ttfb, 'ttfb')}`}>
              {metrics.ttfb}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.ttfb <= 200 ? 'Excellent' : metrics.ttfb <= 800 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        )}

        {metrics.domContentLoaded !== undefined && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="text-xs text-gray-600 mb-1">DOM Ready</div>
            <div className={`text-xl font-bold ${getMetricColor(metrics.domContentLoaded, 'dom')}`}>
              {metrics.domContentLoaded}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.domContentLoaded <= 2000 ? 'Fast' : metrics.domContentLoaded <= 4000 ? 'Moderate' : 'Slow'}
            </div>
          </div>
        )}

        {metrics.loadEvent !== undefined && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="text-xs text-gray-600 mb-1">Load Event</div>
            <div className={`text-xl font-bold ${getMetricColor(metrics.loadEvent, 'load')}`}>
              {metrics.loadEvent}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.loadEvent <= 3000 ? 'Fast' : metrics.loadEvent <= 6000 ? 'Moderate' : 'Slow'}
            </div>
          </div>
        )}

        {metrics.lcp !== undefined && (
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
            <div className="text-xs text-gray-600 mb-1">LCP</div>
            <div className={`text-xl font-bold ${getMetricColor(metrics.lcp, 'lcp')}`}>
              {metrics.lcp}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.lcp <= 2500 ? 'Good' : metrics.lcp <= 4000 ? 'Needs Work' : 'Poor'}
            </div>
          </div>
        )}

        {metrics.accessibilityIssueCount !== undefined && (
          <div className={`rounded-xl p-4 border ${
            metrics.accessibilityIssueCount === 0
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
          }`}>
            <div className="text-xs text-gray-600 mb-1">A11y Issues</div>
            <div className={`text-xl font-bold ${
              metrics.accessibilityIssueCount === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.accessibilityIssueCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.accessibilityIssueCount === 0 ? 'Perfect' : 'Needs Attention'}
            </div>
          </div>
        )}
      </div>

      {metrics.notes && metrics.notes.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Notes
          </h4>
          <ul className="space-y-2">
            {metrics.notes.map((note, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="mr-2">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
