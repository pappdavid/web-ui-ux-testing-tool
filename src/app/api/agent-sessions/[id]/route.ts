import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { requireInternalAuth, requireAuthOrInternal } from '@/server/middleware/internalAuth'
import { db } from '@/server/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  errorMessage: z.string().optional(),
})

/**
 * GET /api/agent-sessions/[id]
 * Get agent session details (user or internal)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check dual auth
    const isAuthorized = await requireAuthOrInternal(request, session)
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const agentSession = await db.agentSession.findUnique({
      where: { id: params.id },
      include: {
        test: {
          select: {
            id: true,
            targetUrl: true,
            adminConfig: true,
            deviceProfile: true,
            userId: true,
          },
        },
        traceSteps: {
          orderBy: {
            orderIndex: 'asc',
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

    // If user auth, verify ownership
    if (session?.user && agentSession.test.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ agentSession })
  } catch (error: any) {
    console.error('Error fetching agent session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/agent-sessions/[id]
 * Update agent session status (internal only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require internal auth
    const authResult = requireInternalAuth(request)
    if (authResult) return authResult

    const body = await request.json()
    const validated = updateStatusSchema.parse(body)

    const agentSession = await db.agentSession.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        errorMessage: validated.errorMessage,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      agentSession,
      message: 'Agent session updated successfully',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating agent session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

