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

const STEP_TYPE_ICONS: Record<string, string> = {
  click: '👆',
  input: '⌨️',
  select: '📋',
  scroll: '📜',
  waitForSelector: '⏳',
  screenshot: '📸',
  extract: '📤',
  assert: '✓',
  dragAndDrop: '🖱️',
  fileUpload: '📁',
}

export default function StepsTimeline({ steps, logs = [] }: StepsTimelineProps) {
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
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )
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

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No steps to display</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative flex items-start">
              {/* Status indicator */}
              <div className="relative z-10 mr-4">
                {getStatusIcon(status)}
              </div>
              
              {/* Step content */}
              <div className={`flex-1 border-2 rounded-xl p-5 ${getStatusColor(status)} transition-all hover:shadow-md`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{STEP_TYPE_ICONS[step.type] || '📝'}</span>
                    <h4 className="font-bold text-gray-900">
                      Step {step.orderIndex + 1}: {step.type}
                    </h4>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    status === 'success' ? 'bg-green-200 text-green-800' :
                    status === 'error' ? 'bg-red-200 text-red-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 mt-3">
                  {step.selector && (
                    <div className="flex items-start">
                      <span className="text-xs font-semibold text-gray-600 mr-2 min-w-[60px]">Selector:</span>
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono break-all">
                        {step.selector}
                      </code>
                    </div>
                  )}
                  {step.value && (
                    <div className="flex items-start">
                      <span className="text-xs font-semibold text-gray-600 mr-2 min-w-[60px]">Value:</span>
                      <span className="text-xs bg-white px-2 py-1 rounded border border-gray-300 break-all">
                        {step.value}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
