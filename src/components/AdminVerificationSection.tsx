'use client'

import AdminVerificationResults from './AdminVerificationResults'

interface AdminCheck {
  id: string
  mode: string
  status: string
  endpointOrPath: string | null
  details: string | null
  expected?: any
  actual?: any
}

interface AdminVerificationSectionProps {
  checks: AdminCheck[]
}

export default function AdminVerificationSection({ checks }: AdminVerificationSectionProps) {
  return <AdminVerificationResults checks={checks} />
}
