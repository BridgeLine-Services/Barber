export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentBusinessId } from '@/lib/business'
import { getDemoSession } from '@/lib/demo-auth'
import { z } from 'zod'

const createClosureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isAllDay: z.boolean().default(true),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] }
).refine(
  (data) => data.isAllDay || (!!data.startTime && !!data.endTime),
  { message: 'Start and end times are required for partial-day closures', path: ['startTime'] }
)

/**
 * GET /api/dashboard/closures
 * List all business closures (owner/barber only)
 */
export async function GET() {
  const session = await getDemoSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const businessId = await getCurrentBusinessId()

    const closures = await prisma.businessClosure.findMany({
      where: { businessId },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ closures })
  } catch (error: any) {
    // Database error
    if (error.message?.includes('No business found') || error.code === 'P1001') {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to fetch closures' }, { status: 500 })
  }
}

/**
 * POST /api/dashboard/closures
 * Create a new business closure (owner only)
 */
export async function POST(req: NextRequest) {
  const session = await getDemoSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if ((session.user as any).role !== 'OWNER') {
    return NextResponse.json({ error: 'Only owners can manage closures' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = createClosureSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const businessId = await getCurrentBusinessId()

    const closure = await prisma.businessClosure.create({
      data: {
        businessId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        isAllDay: parsed.data.isAllDay,
        startTime: parsed.data.startTime || null,
        endTime: parsed.data.endTime || null,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        businessId,
        userId: (session.user as any).id,
        action: 'SETTINGS_UPDATED',
        entityType: 'BusinessClosure',
        entityId: closure.id,
        newValues: parsed.data as any,
        ipAddress: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
      },
    })

    return NextResponse.json({ closure }, { status: 201 })
  } catch (error: any) {
    if (error.message?.includes('No business found') || error.code === 'P1001') {
      return NextResponse.json({ error: 'Database connection error. Please try again.' }, { status: 503 })
    }
    console.error('Error creating closure:', error)
    return NextResponse.json({ error: 'Failed to create closure' }, { status: 500 })
  }
}
