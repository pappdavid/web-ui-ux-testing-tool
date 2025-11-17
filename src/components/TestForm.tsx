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

    try {
      const url = testId ? `/api/tests/${testId}` : '/api/tests'
      const method = testId ? 'PUT' : 'POST'

      // Clean up empty strings - convert to undefined for optional fields
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
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to save test'}`)
      }
    } catch (error) {
      console.error('Error saving test:', error)
      alert('Failed to save test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Test Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
          Target URL
        </label>
        <input
          type="url"
          id="targetUrl"
          required
          value={formData.targetUrl}
          onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label htmlFor="adminPanelUrl" className="block text-sm font-medium text-gray-700">
          Admin Panel URL (optional)
        </label>
        <input
          type="url"
          id="adminPanelUrl"
          value={formData.adminPanelUrl}
          onChange={(e) => setFormData({ ...formData, adminPanelUrl: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://admin.example.com"
        />
      </div>

      <div>
        <label htmlFor="deviceProfile" className="block text-sm font-medium text-gray-700">
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
        </select>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Verification Config</h3>

        <div className="mb-4">
          <label htmlFor="adminMode" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="api">API</option>
            <option value="ui">UI</option>
          </select>
        </div>

        {formData.adminConfig.mode !== 'none' && (
          <div>
            <label htmlFor="adminBaseUrl" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://api.example.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              TODO: Credentials should be encrypted. For now, store securely.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Test'}
        </button>
      </div>
    </form>
  )
}

