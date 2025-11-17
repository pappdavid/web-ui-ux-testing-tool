'use client'

interface TestStep {
  id: string
  orderIndex: number
  type: string
  selector?: string | null
  value?: string | null
}

interface StepsTimelineProps {
  steps: TestStep[]
  logs?: Array<{
    id: string
    timestamp: string
    level: string
    message: string
    data?: any
  }>
}

export default function StepsTimeline({ steps, logs = [] }: StepsTimelineProps) {
  // Create a map of step statuses from logs
  const stepStatuses = new Map<number, 'success' | 'error' | 'pending'>()

  logs.forEach((log) => {
    if (log.data?.stepId) {
      const step = steps.find((s) => s.id === log.data.stepId)
      if (step) {
        if (log.level === 'error') {
          stepStatuses.set(step.orderIndex, 'error')
        } else if (log.message.includes('completed successfully')) {
          stepStatuses.set(step.orderIndex, 'success')
        }
      }
    }
  })

  function getStepStatus(step: TestStep): 'success' | 'error' | 'pending' {
    return stepStatuses.get(step.orderIndex) || 'pending'
  }

  function getStatusIcon(status: 'success' | 'error' | 'pending') {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  function getStatusColor(status: 'success' | 'error' | 'pending') {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step)
        return (
          <div
            key={step.id}
            className={`border-l-4 rounded p-4 ${getStatusColor(status)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <span className="text-2xl">{getStatusIcon(status)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Step {step.orderIndex + 1}: {step.type}
                  </h4>
                  <span className="text-sm text-gray-500 capitalize">{status}</span>
                </div>
                {step.selector && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Selector:</span> {step.selector}
                  </p>
                )}
                {step.value && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Value:</span> {step.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

