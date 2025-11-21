'use client'

import { useState, useEffect } from 'react'

interface TestStep {
  orderIndex: number
  type: string
  selector?: string
  value?: string
  assertionType?: string
  assertionExpected?: string
  meta?: Record<string, any>
  description?: string
}

interface StepBuilderProps {
  testId: string
  initialSteps?: TestStep[]
}

const STEP_TYPES = [
  { value: 'click', label: 'Click', icon: '👆' },
  { value: 'input', label: 'Input', icon: '⌨️' },
  { value: 'select', label: 'Select', icon: '📋' },
  { value: 'scroll', label: 'Scroll', icon: '📜' },
  { value: 'waitForSelector', label: 'Wait', icon: '⏳' },
  { value: 'screenshot', label: 'Screenshot', icon: '📸' },
  { value: 'extract', label: 'Extract', icon: '📤' },
  { value: 'assert', label: 'Assert', icon: '✓' },
  { value: 'dragAndDrop', label: 'Drag & Drop', icon: '🖱️' },
  { value: 'fileUpload', label: 'Upload', icon: '📁' },
]

export default function StepBuilder({ testId, initialSteps = [] }: StepBuilderProps) {
  const [steps, setSteps] = useState<TestStep[]>(initialSteps)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    setSteps(initialSteps)
  }, [initialSteps])

  function addStep() {
    setSteps([
      ...steps,
      {
        orderIndex: steps.length,
        type: 'click',
        selector: '',
        value: '',
      },
    ])
  }

  function updateStep(index: number, updates: Partial<TestStep>) {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], ...updates }
    setSteps(newSteps)
  }

  function removeStep(index: number) {
    if (confirm('Are you sure you want to remove this step?')) {
      const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        orderIndex: i,
      }))
      setSteps(newSteps)
    }
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return
    }

    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
    newSteps[index].orderIndex = index
    newSteps[targetIndex].orderIndex = targetIndex
    setSteps(newSteps)
  }

  async function saveSteps() {
    setSaving(true)
    setSaveMessage(null)
    try {
      const response = await fetch(`/api/tests/${testId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steps }),
      })

      if (response.ok) {
        setSaveMessage('Steps saved successfully!')
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const error = await response.json()
        setSaveMessage(`Error: ${error.error || 'Failed to save steps'}`)
      }
    } catch (error) {
      console.error('Error saving steps:', error)
      setSaveMessage('Failed to save steps')
    } finally {
      setSaving(false)
    }
  }

  function getStepTypeIcon(type: string) {
    return STEP_TYPES.find(t => t.value === type)?.icon || '📝'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Test Steps</h3>
          <p className="text-sm text-gray-600 mt-1">Define the sequence of actions for your test</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addStep}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Step
          </button>
          <button
            onClick={saveSteps}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Steps
              </>
            )}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-xl ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {saveMessage}
        </div>
      )}

      {steps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No steps yet</h3>
          <p className="text-gray-600 mb-6">Click "Add Step" to create your first test step</p>
          <button
            onClick={addStep}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Add Your First Step
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                      <span className="font-semibold text-gray-900">Step {index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-500">Order: {step.orderIndex + 1}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Move up"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Move down"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove step"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {(step.description || step.meta?.description) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-blue-800 mb-1">AI Description:</p>
                      <p className="text-sm text-blue-700">{step.description || step.meta?.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Step Type</label>
                  <select
                    value={step.type}
                    onChange={(e) => updateStep(index, { type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    {STEP_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(step.type === 'input' ||
                  step.type === 'select' ||
                  step.type === 'fileUpload' ||
                  step.type === 'scroll') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Value</label>
                    <input
                      type="text"
                      value={step.value || ''}
                      onChange={(e) => updateStep(index, { value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={
                        step.type === 'input'
                          ? 'Text to input'
                          : step.type === 'fileUpload'
                          ? 'File path'
                          : 'Value'
                      }
                    />
                  </div>
                )}

                {(step.type === 'click' ||
                  step.type === 'input' ||
                  step.type === 'select' ||
                  step.type === 'waitForSelector' ||
                  step.type === 'extract' ||
                  step.type === 'assert' ||
                  step.type === 'screenshot' ||
                  step.type === 'dragAndDrop') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Selector</label>
                    <input
                      type="text"
                      value={step.selector || ''}
                      onChange={(e) => updateStep(index, { selector: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                      placeholder="CSS selector (e.g., #button, .class, button[type='submit'])"
                    />
                  </div>
                )}

                {step.type === 'assert' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Assertion Type</label>
                      <select
                        value={step.assertionType || ''}
                        onChange={(e) => updateStep(index, { assertionType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      >
                        <option value="">Select...</option>
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="exists">Exists</option>
                        <option value="notExists">Not Exists</option>
                      </select>
                    </div>
                    {(step.assertionType === 'equals' || step.assertionType === 'contains') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Value</label>
                        <input
                          type="text"
                          value={step.assertionExpected || ''}
                          onChange={(e) =>
                            updateStep(index, { assertionExpected: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Expected value"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
