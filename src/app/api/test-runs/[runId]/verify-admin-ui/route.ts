import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { db } from '@/server/db'
import { verifyAdminUI } from '@/server/adminVerification/uiVerifier'

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
      adminPanelUrl,
      loginSelector,
      credentials,
      navigationPath,
      extractionSelectors,
      expectedData,
      relatedStepId,
    } = body

    if (!adminPanelUrl || !extractionSelectors) {
      return NextResponse.json(
        { error: 'adminPanelUrl and extractionSelectors are required' },
        { status: 400 }
      )
    }

    await verifyAdminUI(params.runId, {
      adminPanelUrl,
      loginSelector,
      credentials: credentials || {},
      navigationPath,
      extractionSelectors,
      expectedData,
    }, relatedStepId)

    return NextResponse.json({
      message: 'UI verification completed',
    })
  } catch (error: any) {
    console.error('Error in UI verification:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

