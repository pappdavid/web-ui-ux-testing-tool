import TestForm from '@/components/TestForm'
import Link from 'next/link'

export default function NewTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Test</h1>
          <p className="text-gray-600">Set up a new UI/UX test to automate your testing workflow</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <TestForm />
        </div>
      </div>
    </div>
  )
}
