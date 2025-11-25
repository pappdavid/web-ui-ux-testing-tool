import { NextRequest, NextResponse } from 'next/server'
import { requireInternalAuth } from '@/server/middleware/internalAuth'
import { db } from '@/server/db'
import { z } from 'zod'

const traceStepSchema = z.object({
  orderIndex: z.number().int().min(0),
  actionType: z.string().min(1),
  selector: z.string().optional(),
  value: z.string().optional(),
  assertionType: z.enum(['equals', 'contains', 'exists', 'notExists']).optional(),
  assertionExpected: z.string().optional(),
  meta: z.record(z.any()).optional(),
})

const postTraceSchema = z.object({
  steps: z.array(traceStepSchema),
})

/**
 * POST /api/agent-sessions/[id]/trace
 * Add trace steps to an agent session (internal only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require internal auth
    const authResult = requireInternalAuth(request)
    if (authResult) return authResult

    const body = await request.json()
    const validated = postTraceSchema.parse(body)

    // Verify session exists
    const session = await db.agentSession.findUnique({
      where: { id: params.id },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      )
    }

    // Create trace steps
    const traceSteps = await db.agentTraceStep.createMany({
      data: validated.steps.map((step) => ({
        agentSessionId: params.id,
        orderIndex: step.orderIndex,
        actionType: step.actionType,
        selector: step.selector,
        value: step.value,
        assertionType: step.assertionType,
        assertionExpected: step.assertionExpected,
        meta: step.meta || {},
      })),
    })

    return NextResponse.json({
      message: 'Trace steps added successfully',
      count: traceSteps.count,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding trace steps:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

