export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const forgotSchema = z.object({
  email: z.string().email('Valid email required'),
})

/**
 * POST /api/auth/forgot-password
 * Generate a password reset token and return it (demo mode — no email server).
 * In production, this would send an email with a reset link.
 */
export async function POST(req: NextRequest) {
  // Stricter rate limit for password reset
  const rateLimitResult = checkRateLimit(req, 'password-reset', RATE_LIMITS.PASSWORD_RESET)
  if (rateLimitResult) {
    return NextResponse.json(
      { error: rateLimitResult.body.error },
      { status: rateLimitResult.status }
    )
  }

  try {
    const body = await req.json()
    const parsed = forgotSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Find user — don't reveal whether email exists
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    })

    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    })

    // In production, send email with link: /reset-password?token=XXX
    // For now, return the token (demo mode)
    return NextResponse.json({
      success: true,
      message: 'Reset link generated.',
      // Demo only — in production this goes via email
      resetUrl: `/reset-password?token=${token}`,
    })
  } catch (error: any) {
    if (error.code === 'P1001' || error.message?.includes('connect')) {
      return NextResponse.json({ error: 'Demo mode — connect a database to use password reset.' }, { status: 503 })
    }
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
