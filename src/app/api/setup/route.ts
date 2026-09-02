export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const setupSchema = z.object({
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8, 'Password must be at least 8 characters'),
  ownerName: z.string().min(2).max(100),
})

/**
 * GET /api/setup
 * Returns whether initial setup has been completed (i.e., any user exists).
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      needsSetup: userCount === 0,
      hasUsers: userCount > 0,
    })
  } catch (error: any) {
    return NextResponse.json({
      needsSetup: true,
      hasUsers: false,
      dbError: 'Database not connected. Create a Postgres database in Vercel Storage first.',
    }, { status: 503 })
  }
}

/**
 * POST /api/setup
 * Creates the initial OWNER account. Only works if no users exist yet.
 * The owner will create their shop from the dashboard after logging in.
 * This endpoint does NOT create a Business record — that happens via
 * /api/dashboard/create-shop after the owner logs in.
 */
export async function POST(req: NextRequest) {
  // Rate limit setup attempts to prevent brute-force
  const rateLimitResult = checkRateLimit(req, 'setup', { windowMs: 60_000, maxRequests: 3 })
  if (rateLimitResult) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: rateLimitResult.status }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    const parsed = setupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const d = parsed.data
    const passwordHash = await bcrypt.hash(d.ownerPassword, 10)

    // Serialize the empty-database check and insert so concurrent setup
    // requests cannot create multiple initial owners.
    const owner = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.count()
      if (existing > 0) throw new Error('SETUP_ALREADY_COMPLETED')
      return tx.user.create({
        data: {
          email: d.ownerEmail,
          name: d.ownerName,
          passwordHash,
          role: 'OWNER',
          businessId: null,
        },
      })
    }, { isolationLevel: 'Serializable' })

    return NextResponse.json({
      success: true,
      owner: { id: owner.id, email: owner.email, name: owner.name },
      message: 'Owner account created! Log in to start building your shop.',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Setup error:', error)

    // Handle Prisma connection errors specifically
    if (error.message?.includes('database') || error.message?.includes('connect') || error.message?.includes('P1001')) {
      return NextResponse.json(
        { error: 'Database not connected. Create a Postgres database in Vercel Storage first, then redeploy.' },
        { status: 503 }
      )
    }

    // Handle duplicate email
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Setup failed. Please try again.' },
      { status: 500 }
    )
  }
}
