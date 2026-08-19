export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveBusiness } from '@/lib/tenant'

/**
 * GET /api/barbers
 * Public endpoint: returns all active barbers for the resolved business.
 * No demo fallback in production — if no business exists, returns empty.
 */
export async function GET() {
  const business = await resolveBusiness().catch(() => null)

  if (!business) {
    return NextResponse.json({ barbers: [], error: 'No business configured' }, { status: 404 })
  }

  const barbers = await prisma.barber.findMany({
    where: {
      businessId: business.id,
      isActive: true,
    },
    include: {
      services: {
        where: { isActive: true },
        include: { service: true },
        orderBy: { sortOrder: 'asc' },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ barbers })
}
