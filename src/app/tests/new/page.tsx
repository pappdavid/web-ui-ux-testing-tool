import TestForm from '@/components/TestForm'
import Link from 'next/link'

export default function NewTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Create New Test
              </h1>
              <p className="text-lg text-gray-600 mt-1">Set up a new UI/UX test with AI-powered generation</p>
            </div>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-3xl p-8 border border-purple-100 animate-fade-in-delay-1">
          <TestForm />
        </div>
      </div>
    </div>
  )
}
