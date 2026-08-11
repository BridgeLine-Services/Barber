import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveBusinessId } from '@/lib/business'
import { createAppointmentSafely, getAvailableSlots } from '@/lib/availability'
import { sendBookingConfirmation } from '@/lib/notifications'
import { startOfDay, endOfDay } from 'date-fns'

function parseStartTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  let hours = 0
  let minutes = 0

  const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10)
    minutes = parseInt(ampmMatch[2], 10)
    const period = ampmMatch[3].toUpperCase()
    if (period === 'PM' && hours < 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
  } else {
    const parts = timeStr.split(':')
    hours = parseInt(parts[0], 10) || 0
    minutes = parseInt(parts[1], 10) || 0
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { barberId: reqBarberId, serviceId, date, time, customer } = body

    if (!serviceId || !date || !time || !customer) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      )
    }

    const businessId = await resolveBusinessId(req)
    const startTime = parseStartTime(date, time)

    let targetBarberId = reqBarberId

    // If barberId is 'any', find a barber who is available at startTime
    if (!targetBarberId || targetBarberId === 'any') {
      const activeBarbers = await prisma.barber.findMany({
        where: { businessId, isActive: true },
        include: { services: true },
        orderBy: { order: 'asc' },
      })

      const dateObj = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())

      for (const barber of activeBarbers) {
        // Check if barber offers service
        if (barber.services.length > 0 && !barber.services.some((s) => s.serviceId === serviceId)) {
          continue
        }
        const slots = await getAvailableSlots({
          businessId,
          barberId: barber.id,
          serviceId,
          date: dateObj,
        })
        const matchingSlot = slots.find((s) => s.time === time && s.available)
        if (matchingSlot) {
          targetBarberId = barber.id
          break
        }
      }

      if (!targetBarberId || targetBarberId === 'any') {
        // Fallback to first active barber offering service
        const firstMatching = activeBarbers.find(
          (b) => b.services.length === 0 || b.services.some((s) => s.serviceId === serviceId)
        )
        if (firstMatching) {
          targetBarberId = firstMatching.id
        } else if (activeBarbers.length > 0) {
          targetBarberId = activeBarbers[0].id
        } else {
          return NextResponse.json(
            { success: false, error: 'No active barbers available for this service' },
            { status: 400 }
          )
        }
      }
    }

    const result = await createAppointmentSafely({
      businessId,
      barberId: targetBarberId,
      serviceId,
      startTime,
      customerData: customer,
    })

    if (!result.success || !result.appointment) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to book appointment' },
        { status: 409 }
      )
    }

    // Fetch full appointment with all relations for response & notification
    const fullAppointment = await prisma.appointment.findUnique({
      where: { id: result.appointment.id },
      include: {
        customer: true,
        barber: true,
        service: true,
        business: true,
      },
    })

    if (fullAppointment) {
      // Send confirmation email asynchronously (ignore errors so booking completes)
      sendBookingConfirmation(fullAppointment).catch((err) =>
        console.error('Failed to send booking confirmation email:', err)
      )
    }

    return NextResponse.json({
      success: true,
      appointment: fullAppointment || result.appointment,
    })
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const barberId = searchParams.get('barberId')
    const dateStr = searchParams.get('date')
    const status = searchParams.get('status')
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')

    const businessId = await resolveBusinessId(req)

    const where: any = { businessId }

    if (barberId && barberId !== 'all') {
      where.barberId = barberId
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number)
      const dayObj = new Date(y, m - 1, d)
      where.startTime = {
        gte: startOfDay(dayObj),
        lte: endOfDay(dayObj),
      }
    } else if (fromStr || toStr) {
      where.startTime = {}
      if (fromStr) where.startTime.gte = new Date(fromStr)
      if (toStr) where.startTime.lte = new Date(toStr)
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json({ appointments })
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
