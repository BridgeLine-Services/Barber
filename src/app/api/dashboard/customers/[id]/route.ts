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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getDemoSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId
  const existing = await prisma.customer.findFirst({ where: { id: params.id, businessId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data: { notes?: string; tags?: string[]; preferences?: object } = {}
    if (typeof body.notes === 'string') data.notes = body.notes.trim().slice(0, 5000)
    if (Array.isArray(body.tags)) {
      data.tags = [...new Set(body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').map((tag: string) => tag.trim()).filter(Boolean))].slice(0, 30)
    }
    if (body.preferences && typeof body.preferences === 'object' && !Array.isArray(body.preferences)) data.preferences = body.preferences
    if (!Object.keys(data).length) return NextResponse.json({ error: 'No valid fields supplied' }, { status: 400 })
    const updated = await prisma.customer.update({ where: { id: existing.id }, data })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
