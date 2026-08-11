import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      return NextResponse.json({ barbers: [] })
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

    return NextResponse.json({ barbers })
  } catch (error: any) {
    console.error('Error fetching barbers:', error)
    return NextResponse.json({ error: 'Failed to fetch barbers' }, { status: 500 })
  }
}
