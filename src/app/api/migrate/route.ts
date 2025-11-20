import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

/**
 * Migration endpoint - should be protected in production
 * This allows Railway to run migrations after deployment
 */
export async function POST(request: Request) {
  // Simple auth check - in production, use proper authentication
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.MIGRATION_TOKEN || 'migration-secret-token-change-in-production'

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Run Prisma migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    })

    return NextResponse.json({
      message: 'Migrations completed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
