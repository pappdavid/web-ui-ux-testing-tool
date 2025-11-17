import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return session
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

