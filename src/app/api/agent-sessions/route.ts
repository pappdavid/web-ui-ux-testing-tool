import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { requireInternalAuth } from '@/server/middleware/internalAuth'
import { db } from '@/server/db'
import { z } from 'zod'

const createAgentSessionSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
  description: z.string().optional(),
})

/**
 * POST /api/agent-sessions
 * Create a new agent session for a test (user-facing)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const validated = createAgentSessionSchema.parse(body)

    // Verify test belongs to user
    const test = await db.test.findFirst({
      where: {
        id: validated.testId,
        userId: session.user.id,
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Create agent session
    const agentSession = await db.agentSession.create({
      data: {
        testId: validated.testId,
        description: validated.description,
        status: 'pending',
      },
    })

    return NextResponse.json({
      agentSession,
      message: 'Agent session created successfully',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating agent session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agent-sessions?status=pending
 * Get pending agent sessions for worker to poll (internal only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require internal auth
    const authResult = requireInternalAuth(request)
    if (authResult) return authResult

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const sessions = await db.agentSession.findMany({
      where: {
        status,
      },
      include: {
        test: {
          select: {
            id: true,
            targetUrl: true,
            adminConfig: true,
            deviceProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    })

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error('Error fetching agent sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

