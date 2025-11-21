'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface TestFormData {
  name: string
  targetUrl: string
  adminPanelUrl: string
  deviceProfile: 'desktop' | 'mobile' | 'tablet'
  adminConfig: {
    mode: 'api' | 'ui' | 'none'
    baseUrl?: string
    credentials?: Record<string, any>
  }
}

interface TestFormProps {
  initialData?: Partial<TestFormData>
  testId?: string
}

interface AIGeneratedStep {
  orderIndex: number
  type: string
  selector?: string
  value?: string
  assertionType?: string
  assertionExpected?: string
  description?: string
  meta?: Record<string, any>
}

export default function TestForm({ initialData, testId }: TestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiLoading, setAILoading] = useState(false)
  const [aiSuccess, setAISuccess] = useState(false)
  const [aiDescription, setAIDescription] = useState('')
  const [showAIModal, setShowAIModal] = useState(false)
  const [generatedSteps, setGeneratedSteps] = useState<AIGeneratedStep[]>([])
  const [formData, setFormData] = useState<TestFormData>({
    name: initialData?.name || '',
    targetUrl: initialData?.targetUrl || '',
    adminPanelUrl: initialData?.adminPanelUrl || '',
    deviceProfile: initialData?.deviceProfile || 'desktop',
    adminConfig: initialData?.adminConfig || {
      mode: 'none',
      baseUrl: '',
      credentials: {},
    },
  })

  async function handleAIGenerate() {
    if (!formData.targetUrl) {
      setError('Please enter a Target URL first')
      return
    }

    setAILoading(true)
    setError(null)
    setAISuccess(false)

    try {
      const response = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: formData.targetUrl,
          description: aiDescription || 'Generate comprehensive UI test steps',
          provider: 'auto',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedSteps(data.steps || [])
        setAISuccess(true)
        
        // Auto-close modal after 1.5 seconds
        setTimeout(() => {
          setShowAIModal(false)
          setAISuccess(false)
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate test steps')
      }
    } catch (error: any) {
      console.error('Error generating test steps:', error)
      setError(error.message || 'Failed to generate test steps')
    } finally {
      setAILoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = testId ? `/api/tests/${testId}` : '/api/tests'
      const method = testId ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        adminPanelUrl: formData.adminPanelUrl.trim() || undefined,
        adminConfig: {
          ...formData.adminConfig,
          baseUrl: formData.adminConfig.baseUrl?.trim() || undefined,
        },
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        const createdTestId = data.test?.id || testId

        // If we have generated steps and this is a new test, save them automatically
        if (generatedSteps.length > 0 && !testId) {
          try {
            const stepsResponse = await fetch(`/api/tests/${createdTestId}/steps`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                steps: generatedSteps.map((step, index) => ({
                  orderIndex: index,
                  type: step.type,
                  selector: step.selector || undefined,
                  value: step.value || undefined,
                  assertionType: step.assertionType || undefined,
                  assertionExpected: step.assertionExpected || undefined,
                  meta: step.description ? { ...step.meta, description: step.description } : step.meta || undefined,
                })),
              }),
            })

            if (!stepsResponse.ok) {
              console.error('Failed to save AI-generated steps')
            }
          } catch (stepError) {
            console.error('Error saving AI-generated steps:', stepError)
          }
        }

        router.push(`/tests/${createdTestId}/edit`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save test')
      }
    } catch (error: any) {
      console.error('Error saving test:', error)
      setError(error.message || 'Failed to save test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-3xl p-8 max-w-md w-full mx-4 transform animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">AI Test Generator</h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {aiSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Test Steps Generated!</h4>
                <p className="text-gray-600">Generated {generatedSteps.length} test steps</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Test Description
                  </label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAIDescription(e.target.value)}
                    placeholder="Describe what you want to test... (e.g., 'Test login flow with email and password')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                    rows={4}
                    disabled={aiLoading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 The more detailed, the better the AI can generate relevant steps
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAIModal(false)}
                    disabled={aiLoading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !formData.targetUrl}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {aiLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Steps
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* AI Generation Banner */}
        <div className={`rounded-3xl p-6 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ${
          generatedSteps.length > 0 
            ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600' 
            : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {generatedSteps.length > 0 ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold">✅ AI Steps Generated Successfully!</h3>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-xl font-bold">✨ AI-Powered Test Generation</h3>
                  </>
                )}
              </div>
              {generatedSteps.length > 0 ? (
                <>
                  <p className="text-white/90 text-sm mb-2">
                    {generatedSteps.length} test steps are ready to be saved with your test
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-white/30 backdrop-blur-sm rounded-lg px-3 py-1.5 font-semibold">
                      📝 {generatedSteps.length} Steps
                    </span>
                    <span className="text-xs bg-white/30 backdrop-blur-sm rounded-lg px-3 py-1.5 font-semibold">
                      🤖 AI Generated
                    </span>
                    <span className="text-xs bg-white/30 backdrop-blur-sm rounded-lg px-3 py-1.5 font-semibold">
                      💾 Auto-save on create
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-white/90 text-sm">
                  Let AI generate comprehensive test steps for your URL using OpenAI
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              disabled={!formData.targetUrl}
              className={`ml-4 px-6 py-3 font-bold rounded-xl shadow-xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 ${
                generatedSteps.length > 0
                  ? 'bg-white text-green-600 hover:scale-105'
                  : 'bg-white text-purple-600 hover:scale-110'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {generatedSteps.length > 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                )}
              </svg>
              {generatedSteps.length > 0 ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Test Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="My UI Test"
          />
        </div>

        <div>
          <label htmlFor="deviceProfile" className="block text-sm font-semibold text-gray-700 mb-2">
            Device Profile
          </label>
          <select
            id="deviceProfile"
            value={formData.deviceProfile}
            onChange={(e) =>
              setFormData({
                ...formData,
                deviceProfile: e.target.value as 'desktop' | 'mobile' | 'tablet',
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="desktop">🖥️ Desktop</option>
            <option value="mobile">📱 Mobile</option>
            <option value="tablet">📱 Tablet</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="targetUrl" className="block text-sm font-semibold text-gray-700 mb-2">
          Target URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="url"
            id="targetUrl"
            required
            value={formData.targetUrl}
            onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="adminPanelUrl" className="block text-sm font-semibold text-gray-700 mb-2">
          Admin Panel URL <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <input
          type="url"
          id="adminPanelUrl"
          value={formData.adminPanelUrl}
          onChange={(e) => setFormData({ ...formData, adminPanelUrl: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="https://admin.example.com"
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Admin Verification Config
        </h3>

        <div className="mb-4">
          <label htmlFor="adminMode" className="block text-sm font-semibold text-gray-700 mb-2">
            Verification Mode
          </label>
          <select
            id="adminMode"
            value={formData.adminConfig.mode}
            onChange={(e) =>
              setFormData({
                ...formData,
                adminConfig: {
                  ...formData.adminConfig,
                  mode: e.target.value as 'api' | 'ui' | 'none',
                },
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="none">None</option>
            <option value="api">API Verification</option>
            <option value="ui">UI Verification</option>
          </select>
        </div>

        {formData.adminConfig.mode !== 'none' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label htmlFor="adminBaseUrl" className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Base URL
            </label>
            <input
              type="url"
              id="adminBaseUrl"
              value={formData.adminConfig.baseUrl || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  adminConfig: {
                    ...formData.adminConfig,
                    baseUrl: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              placeholder="https://api.example.com"
            />
            <p className="mt-2 text-xs text-gray-600">
              ⚠️ Credentials should be encrypted. For now, store securely.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
        >
          {loading ? (
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
              Save Test
            </>
          )}
        </button>
      </div>
    </form>
    </>
  )
}
