import { NextRequest, NextResponse } from 'next/server'

/**
 * Internal API authentication middleware
 * Validates the internal API token for RunPod worker requests
 * Returns null if authenticated, or NextResponse error if not
 */
export function requireInternalAuth(request: NextRequest): null | NextResponse {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.RAILWAY_INTERNAL_API_TOKEN

  if (!expectedToken) {
    console.error('[InternalAuth] RAILWAY_INTERNAL_API_TOKEN not configured')
    return NextResponse.json(
      { error: 'Internal API not configured' },
      { status: 500 }
    )
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  if (token !== expectedToken) {
    return NextResponse.json(
      { error: 'Invalid internal API token' },
      { status: 401 }
    )
  }

  return null
}

/**
 * Dual authentication: accepts either user session OR internal token
 */
export async function requireAuthOrInternal(
  request: NextRequest,
  session: any
): Promise<boolean> {
  // First try internal token
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const expectedToken = process.env.RAILWAY_INTERNAL_API_TOKEN
    const token = authHeader.substring(7)
    if (expectedToken && token === expectedToken) {
      return true
    }
  }

  // Fall back to user session
  return !!session?.user
}

