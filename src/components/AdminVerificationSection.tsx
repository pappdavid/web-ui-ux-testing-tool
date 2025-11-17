'use client'

interface AdminCheck {
  id: string
  mode: string
  status: string
  endpointOrPath: string | null
  details: string | null
  expected?: any
  actual?: any
}

interface AdminVerificationSectionProps {
  checks: AdminCheck[]
}

export default function AdminVerificationSection({ checks }: AdminVerificationSectionProps) {
  function getStatusColor(status: string) {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (checks.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
        No admin verification checks performed
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <div
          key={check.id}
          className={`border-2 rounded-lg p-4 ${getStatusColor(check.status)}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">
                {check.mode.toUpperCase()} Verification
              </h4>
              {check.endpointOrPath && (
                <p className="text-sm mt-1 opacity-75">{check.endpointOrPath}</p>
              )}
            </div>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white">
              {check.status}
            </span>
          </div>

          {check.details && (
            <p className="text-sm mt-2 opacity-90">{check.details}</p>
          )}

          {check.expected && check.actual && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-50 rounded p-3">
                <h5 className="font-semibold text-sm mb-2">Expected</h5>
                <pre className="text-xs overflow-auto max-h-48">
                  {JSON.stringify(check.expected, null, 2)}
                </pre>
              </div>
              <div className="bg-white bg-opacity-50 rounded p-3">
                <h5 className="font-semibold text-sm mb-2">Actual</h5>
                <pre className="text-xs overflow-auto max-h-48">
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

