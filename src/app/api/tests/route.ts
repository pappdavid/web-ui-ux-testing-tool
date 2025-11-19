import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { createTestSchema } from '@/lib/validations'
import { db } from '@/server/db'
import { stringifyJsonField, parseJsonField } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const tests = await db.test.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        runs: {
          take: 1,
          orderBy: { startedAt: 'desc' },
          select: {
            id: true,
            status: true,
            startedAt: true,
            finishedAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Parse JSON fields for response
    const testsWithParsedJson = tests.map(test => ({
      ...test,
      adminConfig: parseJsonField(test.adminConfig),
    }))

    return NextResponse.json({ tests: testsWithParsedJson })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const validated = createTestSchema.parse(body)

    const test = await db.test.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        targetUrl: validated.targetUrl,
        adminPanelUrl: validated.adminPanelUrl,
        deviceProfile: validated.deviceProfile,
        adminConfig: stringifyJsonField(validated.adminConfig || { mode: 'none' }), // JSON stored as string in SQLite
      },
    })

    // Parse JSON fields for response
    const testWithParsedJson = {
      ...test,
      adminConfig: parseJsonField(test.adminConfig),
    }

    return NextResponse.json({ test: testWithParsedJson }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

