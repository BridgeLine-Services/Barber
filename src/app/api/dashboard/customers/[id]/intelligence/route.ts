export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-auth'
import { prisma } from '@/lib/prisma'
import { getCustomerIntelligence, getRebookingSuggestion } from '@/lib/customer-intelligence'

// GET /api/dashboard/customers/[id]/intelligence
// Returns customer behavioral history + rebooking suggestion
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getDemoSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId

  // Verify customer belongs to this business
  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId },
    select: { id: true },
  })
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const [intelligence, rebooking] = await Promise.all([
    getCustomerIntelligence(params.id, businessId),
    getRebookingSuggestion(params.id, businessId),
  ])

  return NextResponse.json({ intelligence, rebooking })
}
