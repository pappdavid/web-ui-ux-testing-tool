'use client'

interface AdminCheck {
  id: string
  mode: string
  status: string
  details: string | null
  expected?: any
  actual?: any
}

interface AdminVerificationResultsProps {
  checks: AdminCheck[]
}

export default function AdminVerificationResults({ checks }: AdminVerificationResultsProps) {
  function getStatusColor(status: string) {
    switch (status) {
      case 'passed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'error':
        return 'bg-orange-50 text-orange-700 border-orange-200'
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
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  if (checks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No admin verification checks performed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <div
          key={check.id}
          className={`border-2 rounded-xl p-6 ${getStatusColor(check.status)} transition-all hover:shadow-md`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(check.status)}
              <div>
                <span className="font-bold text-lg">
                  {check.mode.toUpperCase()} Verification
                </span>
                <p className="text-sm opacity-75 mt-1">
                  {check.mode === 'api' ? 'API Endpoint Check' : 'UI Element Verification'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(check.status)}`}>
              {check.status.toUpperCase()}
            </span>
          </div>

          {check.details && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">{check.details}</p>
            </div>
          )}

          {check.expected && check.actual && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-700">Expected</span>
                </div>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40 border border-gray-200">
                  {JSON.stringify(check.expected, null, 2)}
                </pre>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-semibold text-gray-700">Actual</span>
                </div>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40 border border-gray-200">
                  {JSON.stringify(check.actual, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
