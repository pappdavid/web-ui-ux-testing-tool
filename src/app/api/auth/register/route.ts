import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { db } from '@/server/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          message: 'Database connection string is not configured. Please check your environment variables.',
        },
        { status: 503 }
      )
    }

    // Check if user already exists
    let existingUser
    try {
      existingUser = await db.user.findUnique({
        where: { email: validated.email },
      })
    } catch (dbError: any) {
      console.error('Database query error:', dbError)
      return NextResponse.json(
        { 
          error: 'Database query failed',
          message: 'Unable to check if user exists. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 503 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', message: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      )
    }

    // Hash password
    let passwordHash
    try {
      passwordHash = await bcrypt.hash(validated.password, 10)
    } catch (hashError: any) {
      console.error('Password hashing error:', hashError)
      return NextResponse.json(
        { error: 'Password hashing failed', message: 'Unable to process password. Please try again.' },
        { status: 500 }
      )
    }

    // Create user
    let user
    try {
      user = await db.user.create({
        data: {
          email: validated.email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      })
    } catch (createError: any) {
      console.error('User creation error:', createError)
      
      // Handle Prisma unique constraint errors
      if (createError.code === 'P2002') {
        return NextResponse.json(
          { error: 'User already exists', message: 'An account with this email already exists.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          error: 'User creation failed',
          message: 'Unable to create user account. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? createError.message : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { user, message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Please check your input and try again.',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    // Don't disconnect - let Prisma manage connection pooling
    // await db.$disconnect().catch(() => {})
  }
}

