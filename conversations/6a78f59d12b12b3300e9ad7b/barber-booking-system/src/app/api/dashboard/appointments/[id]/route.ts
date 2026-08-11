export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveBusinessId } from '@/lib/business'
import { addMinutes } from 'date-fns'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = await resolveBusinessId()

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId,
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = await resolveBusinessId()

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId,
      },
      include: {
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const body = await req.json()
    const { status, startTime: newStartTimeIso, cancellationReason } = body

    const updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (cancellationReason !== undefined) {
      updateData.cancellationReason = cancellationReason
    }

    if (newStartTimeIso) {
      const newStart = new Date(newStartTimeIso)
      if (isNaN(newStart.getTime())) {
        return NextResponse.json({ error: 'Invalid start time' }, { status: 400 })
      }

      const duration = appointment.service?.duration || 30
      const newEnd = addMinutes(newStart, duration)

      // Check for conflicting appointments
      const conflict = await prisma.appointment.findFirst({
        where: {
          businessId,
          barberId: appointment.barberId,
          id: { not: appointment.id },
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      })

      if (conflict) {
        return NextResponse.json({ error: 'Selected time slot conflicts with another appointment' }, { status: 400 })
      }

      updateData.startTime = newStart
      updateData.endTime = newEnd
      if (!status) {
        updateData.status = 'RESCHEDULED'
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
