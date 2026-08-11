export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId

  const barbers = await prisma.barber.findMany({
    where: { businessId },
    include: {
      services: { include: { service: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(barbers)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any)?.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const businessId = (session.user as any)?.businessId

  const body = await req.json()
  const { name, specialty, bio, photo, email, password, serviceIds } = body

  // Create barber
  const barber = await prisma.barber.create({
    data: {
      businessId,
      name,
      specialty: specialty || null,
      bio: bio || null,
      photo: photo || null,
      services: serviceIds?.length
        ? { create: serviceIds.map((id: string) => ({ serviceId: id })) }
        : undefined,
    },
  })

  // Create user account if email and password provided
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'BARBER',
        businessId,
        barberId: barber.id,
      },
    })
  }

  return NextResponse.json(barber)
}
