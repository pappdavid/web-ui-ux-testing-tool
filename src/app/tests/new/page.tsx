import TestForm from '@/components/TestForm'

export default function NewTestPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Test</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <TestForm />
      </div>
    </div>
  )
}

