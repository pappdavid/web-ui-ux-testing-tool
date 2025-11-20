import { NextResponse } from 'next/server'
import { db } from '@/server/db'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'web-ui-ux-testing-tool',
    checks: {
      database: 'unknown' as 'ok' | 'error' | 'unknown',
      databaseError: null as string | null,
    },
  }

  // Check database connection
  if (!process.env.DATABASE_URL) {
    health.checks.database = 'error'
    health.checks.databaseError = 'DATABASE_URL not configured'
    health.status = 'degraded'
  } else {
    try {
      // Simple query to verify database is working
      await db.$queryRaw`SELECT 1`
      health.checks.database = 'ok'
    } catch (error: any) {
      health.checks.database = 'error'
      health.checks.databaseError = error.message
      health.status = 'degraded'
      console.error('Database health check failed:', error)
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
