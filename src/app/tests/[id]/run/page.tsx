'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TestRunView from '@/components/TestRunView'

export default function RunTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string
  const [testRunId, setTestRunId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startTestRun() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tests/${testId}/run`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setTestRunId(data.testRun.id)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start test run')
      }
    } catch (error: any) {
      console.error('Error starting test run:', error)
      setError(error.message || 'Failed to start test run')
    } finally {
      setLoading(false)
    }
  }

  if (!testRunId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Run Test</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
            </div>
          )}
          <div className="flex space-x-4">
            <button
              onClick={startTestRun}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Test Run'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TestRunView testRunId={testRunId} />
    </div>
  )
}

