import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveBusinessId } from '@/lib/business'
import { addMinutes } from 'date-fns'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await resolveBusinessId(req)
    const { id } = params

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        customer: true,
        barber: true,
        service: true,
        business: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ appointment })
  } catch (error: any) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await resolveBusinessId(req)
    const { id } = params
    const body = await req.json()
    const { status, startTime, cancellationReason } = body

    // 1. Fetch existing appointment
    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        service: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    let newStartTime = existing.startTime
    let newEndTime = existing.endTime

    // 2. If rescheduling (startTime provided and different)
    if (startTime && new Date(startTime).getTime() !== existing.startTime.getTime()) {
      newStartTime = new Date(startTime)
      const duration = existing.service.duration
      newEndTime = addMinutes(newStartTime, duration)

      // Re-check availability for this barber slot
      const conflicting = await prisma.appointment.findFirst({
        where: {
          businessId,
          barberId: existing.barberId,
          id: { not: existing.id },
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { lt: newEndTime },
          endTime: { gt: newStartTime },
        },
      })

      if (conflicting) {
        return NextResponse.json(
          { error: 'The selected time slot is no longer available.' },
          { status: 409 }
        )
      }

      // Check blocked times
      const blocked = await prisma.blockedTime.findFirst({
        where: {
          businessId,
          OR: [{ barberId: existing.barberId }, { barberId: null }],
          startTime: { lt: newEndTime },
          endTime: { gt: newStartTime },
        },
      })

      if (blocked) {
        return NextResponse.json(
          { error: 'This time slot is blocked.' },
          { status: 409 }
        )
      }
    }

    // 3. Update appointment
    const updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (startTime) {
      updateData.startTime = newStartTime
      updateData.endTime = newEndTime
      if (status === undefined) {
        updateData.status = 'RESCHEDULED'
      }
    }

    if (cancellationReason !== undefined) {
      updateData.cancellationReason = cancellationReason
    }

    const updated = await prisma.appointment.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        customer: true,
        barber: true,
        service: true,
        business: true,
      },
    })

    return NextResponse.json({ appointment: updated })
  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
