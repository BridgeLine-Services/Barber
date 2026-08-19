export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { resolveBusinessId } from '@/lib/tenant'

// POST /api/public/portal/lookup — customer looks up their appointments by email or phone
export async function POST(req: NextRequest) {
  const rateLimitResult = checkRateLimit(req, 'portal-lookup', RATE_LIMITS.PORTAL_LOOKUP)
  if (rateLimitResult) {
    return NextResponse.json(
      { error: rateLimitResult.body.error },
      { status: rateLimitResult.status }
    )
  }

  try {
    const body = await req.json()
    const { email, phone } = body

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
    }

    // Resolve businessId server-side — never trust client-provided businessId
    const businessId = await resolveBusinessId()

    const where: any = { businessId }
    if (email) {
      where.email = email.toLowerCase().trim()
    } else if (phone) {
      where.phone = phone.trim()
    }

    const customer = await prisma.customer.findFirst({
      where,
      include: {
        appointments: {
          include: {
            barber: { select: { name: true, photo: true } },
            service: { select: { name: true, price: true, duration: true } },
          },
          orderBy: { startTime: 'desc' },
          take: 50,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'No customer found with that email or phone number.' }, { status: 404 })
    }

    const now = new Date()
    const upcoming = customer.appointments
      .filter(a => new Date(a.startTime) >= now && a.status !== 'CANCELLED' && a.status !== 'NO_SHOW')
      .map(a => ({
        ...a,
        startTime: a.startTime.toISOString(),
        endTime: a.endTime.toISOString(),
      }))

    const past = customer.appointments
      .filter(a => new Date(a.startTime) < now || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW')
      .map(a => ({
        ...a,
        startTime: a.startTime.toISOString(),
        endTime: a.endTime.toISOString(),
      }))

    // Loyalty info
    const rewardProgram = await prisma.businessRewardProgram.findFirst({
      where: { businessId, isActive: true },
    })

    const completedCount = customer.appointments.filter(a => a.status === 'COMPLETED').length

    return NextResponse.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        smsConsent: customer.smsConsent,
      },
      upcoming,
      past,
      loyalty: rewardProgram
        ? { programName: rewardProgram.name, type: rewardProgram.type, visits: completedCount }
        : null,
    })
  } catch (error) {
    console.error('Portal lookup error:', error)
    return NextResponse.json({ error: 'Failed to look up appointments' }, { status: 500 })
  }
}
