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

export default function TestForm({ initialData, testId }: TestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        router.push(`/tests/${data.test?.id || testId}/edit`)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

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
  )
}
