'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import TestForm from '@/components/TestForm'
import StepBuilder from '@/components/StepBuilder'
import CloudAgenticRecorder from '@/components/CloudAgenticRecorder'

interface Test {
  id: string
  name: string
  targetUrl: string
  adminPanelUrl: string | null
  deviceProfile: string
  adminConfig: any
  steps: Array<{
    id: string
    orderIndex: number
    type: string
    selector: string | null
    value: string | null
    assertionType: string | null
    assertionExpected: string | null
    source: string
    meta: any
  }>
}

export default function EditTestPage() {
  const params = useParams()
  const testId = params.id as string
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTest()
  }, [testId])

  async function fetchTest() {
    try {
      const response = await fetch(`/api/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
      }
    } catch (error) {
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-fade-in">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-all font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Edit Test
              </h1>
              <p className="text-lg text-gray-600 mt-1">{test.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-3xl p-8 border border-purple-100 animate-fade-in-delay-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Test Configuration
            </h2>
            <TestForm
              testId={testId}
              initialData={{
                name: test.name,
                targetUrl: test.targetUrl,
                adminPanelUrl: test.adminPanelUrl || '',
                deviceProfile: test.deviceProfile as 'desktop' | 'mobile' | 'tablet',
                adminConfig: test.adminConfig || { mode: 'none' },
              }}
            />
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-3xl p-8 border border-cyan-100 animate-fade-in-delay-2">
            <CloudAgenticRecorder
              testId={testId}
              onCompileComplete={fetchTest}
            />
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-3xl p-8 border border-purple-100 animate-fade-in-delay-3">
            <StepBuilder
              testId={testId}
              initialSteps={test.steps.map((step) => ({
                orderIndex: step.orderIndex,
                type: step.type,
                selector: step.selector || undefined,
                value: step.value || undefined,
                assertionType: step.assertionType || undefined,
                assertionExpected: step.assertionExpected || undefined,
                source: step.source,
                meta: step.meta,
                description: step.meta?.description || undefined,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
