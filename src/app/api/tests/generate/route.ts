import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/middleware/auth'
import { generateTestStepsWithAI } from '@/server/services/aiTestGenerator'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { targetUrl, description, provider, apiKey } = body

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'targetUrl is required' },
        { status: 400 }
      )
    }

    // Generate suggested test steps using AI (falls back to mock if no API keys)
    const steps = await generateTestStepsWithAI(
      targetUrl,
      description || 'Basic UI test',
      provider || 'auto',
      apiKey
    )

    return NextResponse.json({
      steps,
      message: 'Test steps generated successfully',
      provider: provider || (process.env.OPENAI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'mock'),
    })
  } catch (error: any) {
    console.error('Error generating test steps:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

