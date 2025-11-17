import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { generateTestSteps } from '@/server/services/aiTestGenerator'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { targetUrl, description } = body

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'targetUrl is required' },
        { status: 400 }
      )
    }

    // Generate suggested test steps
    const steps = await generateTestSteps(
      targetUrl,
      description || 'Basic UI test'
    )

    return NextResponse.json({
      steps,
      message: 'Test steps generated successfully',
    })
  } catch (error: any) {
    console.error('Error generating test steps:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

