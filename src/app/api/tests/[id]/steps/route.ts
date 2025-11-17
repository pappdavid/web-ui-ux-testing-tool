import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { updateTestStepsSchema } from '@/lib/validations'
import { db } from '@/server/db'

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
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = updateTestStepsSchema.parse(body)

    // Delete existing steps
    await db.testStep.deleteMany({
      where: { testId: params.id },
    })

    // Create new steps
    const steps = await db.testStep.createMany({
      data: validated.steps.map((step) => ({
        testId: params.id,
        orderIndex: step.orderIndex,
        type: step.type,
        selector: step.selector,
        value: step.value,
        assertionType: step.assertionType,
        assertionExpected: step.assertionExpected,
        meta: (step.meta || {}) as any, // JSON field
      })),
    })

    return NextResponse.json({ 
      message: 'Steps updated successfully',
      count: steps.count,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating steps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

