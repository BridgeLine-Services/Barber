export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(100),
})

/**
 * POST /api/auth/register
 * Creates an OWNER account with no business linked yet.
 * After registration, the owner logs in and gets redirected to
 * /dashboard/onboarding to create their shop.
 */
export async function POST(req: NextRequest) {
  // Rate limit
  const rateLimitResult = checkRateLimit(req, 'register', { windowMs: 60_000, maxRequests: 3 })
  if (rateLimitResult) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: rateLimitResult.status }
    )
  }

  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Create owner with no business — they'll set up their shop via onboarding
    const owner = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'OWNER',
      },
    })

    return NextResponse.json({
      success: true,
      user: { id: owner.id, email: owner.email, name: owner.name },
      message: 'Account created. You can now sign in.',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.message?.includes('database') || error.message?.includes('connect') || error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database not connected. Set DATABASE_URL in your Vercel environment variables.' },
        { status: 503 }
      )
    }

    // Prisma unique constraint fallback
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed', detail: error.message },
      { status: 500 }
    )
  }
}
