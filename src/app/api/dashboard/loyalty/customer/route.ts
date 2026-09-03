export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-auth'
import { prisma } from '@/lib/prisma'
import { getCustomerLoyalty } from '@/lib/loyalty'

// GET /api/dashboard/loyalty/customer?customerId=xxx
// Returns loyalty info for a specific customer
export async function GET(req: NextRequest) {
  const session = await getDemoSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId

  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })

  // Verify customer belongs to this business
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, businessId },
    select: { id: true },
  })
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  // Get the active reward program
  const program = await prisma.businessRewardProgram.findFirst({
    where: { businessId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  const programConfig = program ? {
    name: program.name,
    type: program.type as 'VISITS' | 'POINTS',
    tiers: (program.config as any[]) || [],
    pointsPerDollar: program.pointsPerDollar || undefined,
  } : undefined

  const loyalty = await getCustomerLoyalty(customerId, businessId, programConfig)

  return NextResponse.json(loyalty)
}
