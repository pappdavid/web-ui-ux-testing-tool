'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TestForm from '@/components/TestForm'
import StepBuilder from '@/components/StepBuilder'

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
    return <div className="text-center py-8">Loading test...</div>
  }

  if (!test) {
    return <div className="text-center py-8">Test not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Test: {test.name}</h1>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Configuration</h2>
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

        <div className="bg-white shadow rounded-lg p-6">
          <StepBuilder
            testId={testId}
            initialSteps={test.steps.map((step) => ({
              orderIndex: step.orderIndex,
              type: step.type,
              selector: step.selector || undefined,
              value: step.value || undefined,
              assertionType: step.assertionType || undefined,
              assertionExpected: step.assertionExpected || undefined,
              meta: step.meta,
            }))}
          />
        </div>
      </div>
    </div>
  )
}

