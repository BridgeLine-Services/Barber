export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancelByTokenSchema } from '@/lib/validation'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { isTerminalStatus } from '@/lib/validation'

/**
 * POST /api/public/appointments/[token]/cancel
 * Cancel an appointment using the customer's secure access token.
 * No login required — the token IS the authorization.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  // Rate limit
  const rateLimitResult = checkRateLimit(req, 'public-cancel', RATE_LIMITS.CUSTOMER_ACTION)
  if (rateLimitResult) {
    return NextResponse.json(
      { error: rateLimitResult.body.error },
      { status: rateLimitResult.status }
    )
  }

  try {
    const { token } = params

    if (!token || token.length < 32) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Parse body (optional reason)
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Empty body is fine
    }

    const parseResult = cancelByTokenSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { customerAccessToken: token },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if already cancelled or terminal
    if (isTerminalStatus(appointment.status)) {
      return NextResponse.json(
        { error: `Appointment is already ${appointment.status.toLowerCase()}` },
        { status: 409 }
      )
    }

    // Cancel the appointment
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: parseResult.data.reason || 'Cancelled by customer',
      },
    })

    return NextResponse.json({
      success: true,
      status: updated.status,
      confirmationNumber: updated.confirmationNumber,
    })
  } catch (error: any) {
    console.error('Error cancelling appointment by token:', error)
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
  }
}
