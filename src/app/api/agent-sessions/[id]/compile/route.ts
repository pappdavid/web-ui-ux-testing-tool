import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'
import { compileAgentSessionToTestSteps } from '@/server/agent/compiler'

/**
 * POST /api/agent-sessions/[id]/compile
 * Compile agent trace into TestSteps (user-facing)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    // Load agent session to verify ownership
    const agentSession = await db.agentSession.findUnique({
      where: { id: params.id },
      include: {
        test: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!agentSession) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      )
    }

    // Verify user owns the test
    if (agentSession.test.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Compile trace to steps
    const result = await compileAgentSessionToTestSteps(params.id)

    return NextResponse.json({
      message: 'Agent trace compiled successfully',
      result,
    })
  } catch (error: any) {
    console.error('Error compiling agent trace:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

