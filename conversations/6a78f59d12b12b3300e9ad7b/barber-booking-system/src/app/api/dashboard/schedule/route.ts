import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const barberId = searchParams.get('barberId')

  // If BARBER role, force their barberId
  const role = (session.user as any)?.role
  const sessionBarberId = (session.user as any)?.barberId
  const targetBarberId = role === 'BARBER' ? sessionBarberId : barberId

  if (!targetBarberId) return NextResponse.json({ error: 'barberId required' }, { status: 400 })

  const schedules = await prisma.schedule.findMany({
    where: { barberId: targetBarberId },
    orderBy: { dayOfWeek: 'asc' },
  })
  return NextResponse.json(schedules)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  const sessionBarberId = (session.user as any)?.barberId
  const businessId = (session.user as any)?.businessId
  const { searchParams } = new URL(req.url)
  const urlBarberId = searchParams.get('barberId')
  const targetBarberId = role === 'BARBER' ? sessionBarberId : urlBarberId

  if (!targetBarberId) return NextResponse.json({ error: 'barberId required' }, { status: 400 })

  // Verify barber belongs to this business
  const barber = await prisma.barber.findFirst({ where: { id: targetBarberId, businessId } })
  if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

  const body = await req.json()
  const { schedules } = body as { schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isOff: boolean; breaks: any }> }

  // Delete existing and recreate
  await prisma.schedule.deleteMany({ where: { barberId: targetBarberId } })

  if (schedules && schedules.length > 0) {
    await prisma.schedule.createMany({
      data: schedules.map(s => ({
        barberId: targetBarberId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isOff: s.isOff,
        breaks: s.breaks || [],
      })),
    })
  }

  const updated = await prisma.schedule.findMany({
    where: { barberId: targetBarberId },
    orderBy: { dayOfWeek: 'asc' },
  })
  return NextResponse.json(updated)
}
