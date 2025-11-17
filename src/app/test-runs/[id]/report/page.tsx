import ReportView from '@/components/ReportView'

export default function TestRunReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Run Report</h1>
      <ReportViewWrapper params={params} />
    </div>
  )
}

async function ReportViewWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ReportView testRunId={id} />
}

