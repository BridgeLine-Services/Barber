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
 * Generate a password reset token. In development, returns the reset URL.
 * In production, sends an email with the reset link via SMTP.
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

    // Send reset email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: parseInt(process.env.SMTP_PORT || '587') === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        })
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@barbershop.com',
          to: user.email,
          subject: 'Password Reset Request',
          text: `Reset your password: ${baseUrl}/reset-password?token=${token}\n\nThis link expires in 1 hour.`,
          html: `<p>Reset your password: <a href="${baseUrl}/reset-password?token=${token}">Click here</a></p><p>This link expires in 1 hour.</p>`,
        })
      } catch (emailErr) {
        console.error('Failed to send reset email:', emailErr)
        // Don't reveal failure to user — security best practice
      }
    }

    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
      ...(isDev && { resetUrl: `/reset-password?token=${token}` }),
    })
  } catch (error: any) {
    if (error.code === 'P1001' || error.message?.includes('connect')) {
      return NextResponse.json({ error: 'Demo mode — connect a database to use password reset.' }, { status: 503 })
    }
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
