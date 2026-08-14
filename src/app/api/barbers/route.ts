export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { demoBarbers } from '@/lib/demo-data'

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      // No business in DB — return demo data for template mode
      return NextResponse.json({ barbers: demoBarbers, demo: true })
    }

    const barbers = await prisma.barber.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      include: {
        services: true,
      },
      orderBy: { order: 'asc' },
    })

    if (barbers.length === 0) {
      return NextResponse.json({ barbers: demoBarbers, demo: true })
    }

    return NextResponse.json({ barbers })
  } catch (error: any) {
    console.error('Error fetching barbers:', error)
    // Database not connected — return demo data for template mode
    return NextResponse.json({ barbers: demoBarbers, demo: true })
  }
}
