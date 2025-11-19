'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Test {
  id: string
  name: string
  targetUrl: string
  status: string
  deviceProfile: string
  createdAt: string
  updatedAt: string
  runs: Array<{
    id: string
    status: string
    startedAt: string
    finishedAt: string | null
  }>
}

export default function TestList() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  async function fetchTests() {
    try {
      const response = await fetch('/api/tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'passed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'running':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'passed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'running':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Tests</h2>
          <p className="text-gray-600 mt-1">Manage and monitor your UI/UX test suites</p>
        </div>
        <Link
          href="/tests/new"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests yet</h3>
          <p className="text-gray-600 mb-6">Create your first test to start automating your UI/UX testing</p>
          <Link
            href="/tests/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Create Your First Test
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/tests/${test.id}/edit`}
                    className="flex-1 group-hover:text-blue-600 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{test.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{test.targetUrl}</p>
                  </Link>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      test.status
                    )}`}
                  >
                    {getStatusIcon(test.status)}
                    {test.status}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {test.deviceProfile}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  {test.runs && test.runs.length > 0 ? (
                    <span>Last run: {formatDate(test.runs[0].startedAt)}</span>
                  ) : (
                    <span>Never run</span>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/tests/${test.id}/run`}
                    className="flex-1 text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                  >
                    Run
                  </Link>
                  <Link
                    href={`/tests/${test.id}/edit`}
                    className="flex-1 text-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
