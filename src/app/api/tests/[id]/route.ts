import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { createTestSchema } from '@/lib/validations'
import { db } from '@/server/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

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

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    // Verify test belongs to user
    const existingTest = await db.test.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = createTestSchema.parse(body)

    const test = await db.test.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        targetUrl: validated.targetUrl,
        adminPanelUrl: validated.adminPanelUrl,
        deviceProfile: validated.deviceProfile,
        adminConfig: (validated.adminConfig || { mode: 'none' }) as any, // JSON field
      },
    })

    return NextResponse.json({ test })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

