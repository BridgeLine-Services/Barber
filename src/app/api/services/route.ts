export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveBusiness } from '@/lib/tenant'

/**
 * GET /api/services
 * Public endpoint: returns all active services for the resolved business.
 * No demo fallback in production.
 */
export async function GET() {
  const business = await resolveBusiness().catch(() => null)

  if (!business) {
    return NextResponse.json({ services: [], error: 'No business configured' }, { status: 404 })
  }

  const services = await prisma.service.findMany({
    where: {
      businessId: business.id,
      isActive: true,
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ services })
}
