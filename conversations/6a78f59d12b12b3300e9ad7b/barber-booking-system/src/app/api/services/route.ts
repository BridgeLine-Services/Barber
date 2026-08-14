export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { demoServices } from '@/lib/demo-data'

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      // No business in DB — return demo data for template mode
      return NextResponse.json({ services: demoServices, demo: true })
    }

    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    })

    if (services.length === 0) {
      return NextResponse.json({ services: demoServices, demo: true })
    }

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error('Error fetching services:', error)
    // Database not connected — return demo data for template mode
    return NextResponse.json({ services: demoServices, demo: true })
  }
}
