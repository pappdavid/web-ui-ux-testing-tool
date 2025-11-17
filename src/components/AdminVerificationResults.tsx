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
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <div key={check.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold text-gray-900">
                {check.mode.toUpperCase()} Verification
              </span>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                check.status
              )}`}
            >
              {check.status}
            </span>
          </div>

          {check.details && (
            <p className="text-sm text-gray-600 mb-2">{check.details}</p>
          )}

          {check.expected && check.actual && (
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Expected:</span>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                  {JSON.stringify(check.expected, null, 2)}
                </pre>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Actual:</span>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
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

