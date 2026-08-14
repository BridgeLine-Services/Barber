export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveBusinessId } from '@/lib/business'
import { createAppointmentSafely, getAvailableSlots } from '@/lib/availability'
import { sendBookingConfirmation } from '@/lib/notifications'
import { createBookingSchema } from '@/lib/validation'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

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
  // Rate limit booking creation
  const rateLimitResult = checkRateLimit(req, 'public-booking', RATE_LIMITS.BOOKING)
  if (rateLimitResult) {
    return NextResponse.json(
      { success: false, error: rateLimitResult.body.error },
      { status: rateLimitResult.status }
    )
  }

  try {
    const body = await req.json()

    // Validate input with Zod schema
    const parseResult = createBookingSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid booking data',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { barberId: reqBarberId, serviceId, date, time, customer } = parseResult.data

    const businessId = await resolveBusinessId(req)
    const startTime = parseStartTime(date, time)

    // Cannot book in the past
    if (startTime < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Cannot book an appointment in the past' },
        { status: 400 }
      )
    }

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

    // Fetch full appointment with relations for notification
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

    // Return MINIMIZED response — do not expose internal IDs, customer PII beyond what's needed
    // The customerAccessToken is returned so the customer can manage their appointment
    return NextResponse.json({
      success: true,
      confirmationNumber: result.appointment.confirmationNumber,
      customerAccessToken: result.appointment.customerAccessToken,
      appointment: {
        confirmationNumber: result.appointment.confirmationNumber,
        startTime: result.appointment.startTime,
        endTime: result.appointment.endTime,
        status: result.appointment.status,
        service: {
          name: result.appointment.service?.name,
          duration: result.appointment.service?.duration,
          price: result.appointment.service?.price,
        },
        barber: {
          name: result.appointment.barber?.name,
        },
      },
    })
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred while creating your appointment.' },
      { status: 500 }
    )
  }
}
