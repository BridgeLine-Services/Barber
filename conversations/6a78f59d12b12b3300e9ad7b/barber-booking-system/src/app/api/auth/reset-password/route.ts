export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const resetSchema = z.object({
  token: z.string().min(32, 'Invalid token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: parsed.data.token,
        passwordResetExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new one.' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        action: 'USER_PASSWORD_CHANGED',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
      },
    })

    return NextResponse.json({ success: true, message: 'Password reset successfully. Please log in.' })
  } catch (error: any) {
    if (error.code === 'P1001' || error.message?.includes('connect')) {
      return NextResponse.json({ error: 'Demo mode — connect a database to use password reset.' }, { status: 503 })
    }
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
