import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'

/**
 * Admin endpoint to clean up tests stuck in RUNNING status
 * Finds tests that have been running for more than 15 minutes and marks them as failed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    // Check if user is admin (you can add admin check here)
    // For now, any authenticated user can run this

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

    // Find stuck test runs
    const stuckTestRuns = await db.testRun.findMany({
      where: {
        status: 'running',
        startedAt: {
          lt: fifteenMinutesAgo,
        },
      },
      include: {
        test: true,
      },
    })

    if (stuckTestRuns.length === 0) {
      return NextResponse.json({
        message: 'No stuck tests found',
        cleaned: 0,
      })
    }

    // Update stuck tests
    const updatePromises = stuckTestRuns.map(async (testRun) => {
      try {
        await db.testRun.update({
          where: { id: testRun.id },
          data: {
            status: 'failed',
            finishedAt: new Date(),
          },
        })

        await db.test.update({
          where: { id: testRun.testId },
          data: {
            status: 'failed',
          },
        })

        // Log the cleanup
        await db.testLog.create({
          data: {
            testRunId: testRun.id,
            level: 'warn',
            message: 'Test was stuck in RUNNING status and was automatically marked as failed',
            data: {
              startedAt: testRun.startedAt,
              cleanedAt: new Date(),
              reason: 'stuck_in_running_status',
            },
          },
        })

        return { id: testRun.id, success: true }
      } catch (error: any) {
        console.error(`Failed to clean up test run ${testRun.id}:`, error)
        return { id: testRun.id, success: false, error: error.message }
      }
    })

    const results = await Promise.all(updatePromises)
    const successful = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Cleaned up ${successful} stuck test(s)`,
      cleaned: successful,
      total: stuckTestRuns.length,
      results,
    })
  } catch (error: any) {
    console.error('Error cleaning up stuck tests:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

