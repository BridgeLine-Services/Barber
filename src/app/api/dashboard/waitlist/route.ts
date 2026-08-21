export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentBusinessId } from '@/lib/business'
import { getDemoSession } from '@/lib/demo-auth'

/**
 * GET /api/dashboard/waitlist
 * List all waitlist entries (owner/barber)
 */
export async function GET(req: NextRequest) {
  const session = await getDemoSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const businessId = await getCurrentBusinessId()
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status')

    const where: any = { businessId }
    if (status) where.status = status.toUpperCase()

    const entries = await prisma.waitlistEntry.findMany({
      where,
      include: {
        barber: { select: { name: true } },
        service: { select: { name: true, duration: true, price: true } },
        customer: { select: { firstName: true, lastName: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ entries })
  } catch (error: any) {
    if (error.message?.includes('No business found') || error.code === 'P1001') {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
  }
}

/**
 * PATCH /api/dashboard/waitlist
 * Update a waitlist entry status (e.g. mark as NOTIFIED or BOOKED)
 */
export async function PATCH(req: NextRequest) {
  const session = await getDemoSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    const businessId = await getCurrentBusinessId()

    const entry = await prisma.waitlistEntry.findUnique({ where: { id } })
    if (!entry || entry.businessId !== businessId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const updated = await prisma.waitlistEntry.update({
      where: { id },
      data: {
        status,
        notifiedAt: status === 'NOTIFIED' ? new Date() : entry.notifiedAt,
      },
    })

    return NextResponse.json({ entry: updated })
  } catch (error: any) {
    if (error.code === 'P1001' || error.message?.includes('No business found')) {
      return NextResponse.json({ error: 'Database connection error' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}
