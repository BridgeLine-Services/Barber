export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getDemoSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId },
    include: {
      appointments: {
        include: { service: true, barber: true },
        orderBy: { startTime: 'desc' },
      },
    },
  })

  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(customer)
}
