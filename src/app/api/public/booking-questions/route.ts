import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveBusiness } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const business = await resolveBusiness().catch(() => null)
  if (!business) return NextResponse.json({ questions: [] })
  const questions = await prisma.bookingQuestion.findMany({
    where: { businessId: business.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, label: true, key: true, type: true, required: true, helpText: true, options: true },
  })
  return NextResponse.json({ questions })
}
