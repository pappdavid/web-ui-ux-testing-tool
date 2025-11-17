import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const testRun = await db.testRun.findFirst({
      where: {
        id: params.runId,
        test: {
          userId: session.user.id,
        },
      },
      include: {
        test: {
          include: {
            steps: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
        logs: {
          orderBy: {
            timestamp: 'asc',
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        adminChecks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      )
    }

    // Calculate duration
    const duration = testRun.finishedAt && testRun.startedAt
      ? new Date(testRun.finishedAt).getTime() - new Date(testRun.startedAt).getTime()
      : null

    const report = {
      testRun: {
        id: testRun.id,
        status: testRun.status,
        startedAt: testRun.startedAt,
        finishedAt: testRun.finishedAt,
        duration,
        deviceProfile: testRun.deviceProfile,
        browserType: testRun.browserType,
        uxMetrics: testRun.uxMetrics,
      },
      test: {
        id: testRun.test.id,
        name: testRun.test.name,
        targetUrl: testRun.test.targetUrl,
        steps: testRun.test.steps,
      },
      logs: testRun.logs,
      attachments: testRun.attachments,
      adminChecks: testRun.adminChecks,
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

