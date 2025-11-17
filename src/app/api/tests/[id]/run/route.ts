import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'
import { runTest } from '@/server/services/testRunner'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    // Verify test belongs to user
    const test = await db.test.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        steps: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    if (test.steps.length === 0) {
      return NextResponse.json(
        { error: 'Test has no steps' },
        { status: 400 }
      )
    }

    // Create test run
    const testRun = await db.testRun.create({
      data: {
        testId: params.id,
        status: 'running',
        deviceProfile: test.deviceProfile,
        browserType: 'chromium',
      },
    })

    // Update test status
    await db.test.update({
      where: { id: params.id },
      data: {
        status: 'running',
      },
    })

    // Start test execution (synchronous for now)
    // In production, this should be queued
    runTest(testRun.id).catch((error) => {
      console.error('Test execution error:', error)
    })

    return NextResponse.json({
      testRun: {
        id: testRun.id,
        status: testRun.status,
        startedAt: testRun.startedAt,
      },
    })
  } catch (error) {
    console.error('Error starting test run:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

