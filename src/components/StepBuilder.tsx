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
}

interface StepBuilderProps {
  testId: string
  initialSteps?: TestStep[]
}

export default function StepBuilder({ testId, initialSteps = [] }: StepBuilderProps) {
  const [steps, setSteps] = useState<TestStep[]>(initialSteps)
  const [saving, setSaving] = useState(false)

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
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      orderIndex: i,
    }))
    setSteps(newSteps)
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
    try {
      const response = await fetch(`/api/tests/${testId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ steps }),
      })

      if (response.ok) {
        alert('Steps saved successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to save steps'}`)
      }
    } catch (error) {
      console.error('Error saving steps:', error)
      alert('Failed to save steps')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Test Steps</h3>
        <div className="space-x-2">
          <button
            onClick={addStep}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Step
          </button>
          <button
            onClick={saveSteps}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Steps'}
          </button>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No steps yet. Click "Add Step" to create your first test step.
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={step.type}
                    onChange={(e) => updateStep(index, { type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="click">Click</option>
                    <option value="input">Input</option>
                    <option value="select">Select</option>
                    <option value="scroll">Scroll</option>
                    <option value="waitForSelector">Wait For Selector</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="extract">Extract</option>
                    <option value="assert">Assert</option>
                    <option value="dragAndDrop">Drag and Drop</option>
                    <option value="fileUpload">File Upload</option>
                  </select>
                </div>

                {(step.type === 'input' ||
                  step.type === 'select' ||
                  step.type === 'fileUpload' ||
                  step.type === 'scroll') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value</label>
                    <input
                      type="text"
                      value={step.value || ''}
                      onChange={(e) => updateStep(index, { value: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    <label className="block text-sm font-medium text-gray-700">Selector</label>
                    <input
                      type="text"
                      value={step.selector || ''}
                      onChange={(e) => updateStep(index, { selector: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="CSS selector"
                    />
                  </div>
                )}

                {step.type === 'assert' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assertion Type
                      </label>
                      <select
                        value={step.assertionType || ''}
                        onChange={(e) => updateStep(index, { assertionType: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                        <label className="block text-sm font-medium text-gray-700">
                          Expected Value
                        </label>
                        <input
                          type="text"
                          value={step.assertionExpected || ''}
                          onChange={(e) =>
                            updateStep(index, { assertionExpected: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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

