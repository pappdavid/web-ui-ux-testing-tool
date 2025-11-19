import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'
import { parseJsonField } from '@/lib/utils'

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

    // Parse JSON fields for response
    const testRunWithParsedJson = {
      ...testRun,
      uxMetrics: parseJsonField(testRun.uxMetrics),
      test: {
        ...testRun.test,
        adminConfig: parseJsonField(testRun.test.adminConfig),
        steps: testRun.test.steps.map(step => ({
          ...step,
          meta: parseJsonField(step.meta),
        })),
      },
      adminChecks: testRun.adminChecks.map(check => ({
        ...check,
        expected: parseJsonField(check.expected),
        actual: parseJsonField(check.actual),
      })),
    }

    return NextResponse.json({ testRun: testRunWithParsedJson })
  } catch (error) {
    console.error('Error fetching test run:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

