import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'
import { verifyAdminApi } from '@/server/adminVerification/apiVerifier'

export async function POST(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    // Verify test run belongs to user
    const testRun = await db.testRun.findFirst({
      where: {
        id: params.runId,
        test: {
          userId: session.user.id,
        },
      },
      include: {
        test: true,
      },
    })

    if (!testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      baseUrl,
      authMethod = 'bearer',
      credentials,
      endpoint,
      method = 'GET',
      expectedData,
      relatedStepId,
    } = body

    if (!baseUrl || !endpoint) {
      return NextResponse.json(
        { error: 'baseUrl and endpoint are required' },
        { status: 400 }
      )
    }

    await verifyAdminApi(params.runId, {
      baseUrl,
      authMethod,
      credentials: credentials || {},
      endpoint,
      method,
      expectedData,
    }, relatedStepId)

    return NextResponse.json({
      message: 'API verification completed',
    })
  } catch (error: any) {
    console.error('Error in API verification:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

