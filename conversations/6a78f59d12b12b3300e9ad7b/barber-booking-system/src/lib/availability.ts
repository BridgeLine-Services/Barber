import { prisma } from '@/lib/prisma'
import { generateConfirmationNumber } from '@/lib/utils'
import { addMinutes, isBefore, isAfter, setHours, setMinutes, parseISO } from 'date-fns'

// ============================================================================
// Availability Engine
// The server — NOT the browser — determines whether a slot is available.
// Double-booking protection uses a database transaction with a unique check.
// ============================================================================

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/**
 * Generate available time slots for a given barber + service on a specific date.
 *
 * Algorithm:
 * 1. Load the barber's recurring schedule for that day of week
 * 2. Load any blocked times for that barber on that date
 * 3. Load all existing appointments for that barber on that date
 * 4. Walk the working hours in service-duration increments
 * 5. For each candidate slot, check:
 *    - Does it overlap with any existing appointment?
 *    - Does it fall within a break?
 *    - Does it overlap with a blocked time?
 * 6. Return the list of available start times
 */
export async function getAvailableSlots(params: {
  businessId: string
  barberId: string
  serviceId: string
  date: Date // the calendar day to check
}): Promise<{ time: string; available: boolean }[]> {
  const { businessId, barberId, serviceId, date } = params

  // Parallel: service info, barber schedule, appointments, blocked times
  const [service, schedule, appointments, blockedTimes] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, businessId, isActive: true } }),
    prisma.schedule.findUnique({ where: { barberId_dayOfWeek: { barberId, dayOfWeek: date.getDay() } } }),
    prisma.appointment.findMany({
      where: {
        businessId,
        barberId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startTime: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0),
        },
      },
    }),
    prisma.blockedTime.findMany({
      where: {
        businessId,
        OR: [
          { barberId },
          { barberId: null }, // shop-wide blocks
        ],
        startTime: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0),
        },
      },
    }),
  ])

  if (!service || !service.isActive) return []
  if (!schedule || schedule.isOff) return []

  const duration = service.duration // minutes

  // Parse working hours
  const [startH, startM] = schedule.startTime.split(':').map(Number)
  const [endH, endM] = schedule.endTime.split(':').map(Number)

  const dayStart = new Date(date)
  dayStart.setHours(startH, startM, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(endH, endM, 0, 0)

  // Parse breaks
  const breaks: Array<{ start: Date; end: Date }> = []
  if (schedule.breaks && Array.isArray(schedule.breaks)) {
    for (const brk of schedule.breaks as any[]) {
      if (brk && typeof brk === 'object' && 'start' in brk && 'end' in brk) {
        const [bh, bm] = String(brk.start).split(':').map(Number)
        const [eh, em] = String(brk.end).split(':').map(Number)
        breaks.push({
          start: new Date(new Date(date).setHours(bh, bm, 0, 0)),
          end: new Date(new Date(date).setHours(eh, em, 0, 0)),
        })
      }
    }
  }

  // Parse blocked times into date ranges
  const blockedRanges = blockedTimes.map((bt) => ({
    start: bt.startTime,
    end: bt.endTime,
  }))

  // Sort appointments by start time
  const sortedAppointments = appointments.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  // Don't show past times (if checking today)
  const now = new Date()

  // Walk the day in duration-minute increments
  const slots: { time: string; available: boolean }[] = []
  const slotInterval = 15 // 15-minute granularity for slot start times

  let cursor = new Date(dayStart)
  while (cursor < dayEnd) {
    const slotStart = new Date(cursor)
    const slotEnd = addMinutes(slotStart, duration)

    // Skip if slot end exceeds working hours
    if (slotEnd > dayEnd) break

    // Skip if in the past
    if (slotStart < now) {
      cursor = addMinutes(cursor, slotInterval)
      continue
    }

    let available = true

    // Check overlap with existing appointments
    for (const appt of sortedAppointments) {
      if (
        slotStart < appt.endTime &&
        slotEnd > appt.startTime
      ) {
        available = false
        break
      }
    }

    // Check overlap with breaks
    if (available) {
      for (const brk of breaks) {
        if (slotStart < brk.end && slotEnd > brk.start) {
          available = false
          break
        }
      }
    }

    // Check overlap with blocked times
    if (available) {
      for (const block of blockedRanges) {
        if (slotStart < block.end && slotEnd > block.start) {
          available = false
          break
        }
      }
    }

    // Check if end time is after last appointment (edge case at day end)
    if (available && slotEnd > dayEnd) {
      available = false
    }

    slots.push({
      time: formatSlotTime(slotStart),
      available,
    })

    cursor = addMinutes(cursor, slotInterval)
  }

  return slots
}

function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Create an appointment with double-booking protection.
 *
 * Uses a Prisma transaction with a re-check of slot availability inside the
 * transaction. If another customer booked the same slot between the availability
 * check and this call, the transaction will throw and we return an error.
 */
export async function createAppointmentSafely(params: {
  businessId: string
  barberId: string
  serviceId: string
  startTime: Date
  customerData: {
    firstName: string
    lastName: string
    phone: string
    email: string
    notes?: string
    smsConsent?: boolean
  }
}): Promise<{ success: boolean; appointment?: any; error?: string }> {
  const { businessId, barberId, serviceId, startTime, customerData } = params

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the service to get duration
      const service = await tx.service.findFirst({
        where: { id: serviceId, businessId, isActive: true },
      })
      if (!service) throw new Error('Service not found or inactive')

      // 2. Compute end time
      const endTime = addMinutes(startTime, service.duration)

      // 3. RE-CHECK availability inside the transaction (double-booking guard)
      const conflicting = await tx.appointment.findFirst({
        where: {
          businessId,
          barberId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      })
      if (conflicting) throw new Error('SLOT_TAKEN')

      // 4. Check barber schedule is active for this day
      const dayOfWeek = startTime.getDay()
      const schedule = await tx.schedule.findUnique({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
      })
      if (!schedule || schedule.isOff) throw new Error('BARBER_OFF')

      // 5. Check blocked times
      const blocked = await tx.blockedTime.findFirst({
        where: {
          businessId,
          OR: [{ barberId }, { barberId: null }],
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      })
      if (blocked) throw new Error('BLOCKED')

      // 6. Find or create the customer
      const customer = await tx.customer.upsert({
        where: {
          businessId_email: { businessId, email: customerData.email },
        },
        update: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          notes: customerData.notes,
          smsConsent: customerData.smsConsent ?? false,
        },
        create: {
          businessId,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          email: customerData.email,
          notes: customerData.notes,
          smsConsent: customerData.smsConsent ?? false,
        },
      })

      // 7. Generate a unique confirmation number
      let confirmationNumber = generateConfirmationNumber()
      let existing = await tx.appointment.findUnique({ where: { confirmationNumber } })
      while (existing) {
        confirmationNumber = generateConfirmationNumber()
        existing = await tx.appointment.findUnique({ where: { confirmationNumber } })
      }

      // 8. Create the appointment
      const appointment = await tx.appointment.create({
        data: {
          confirmationNumber,
          businessId,
          customerId: customer.id,
          barberId,
          serviceId,
          startTime,
          endTime,
          status: 'CONFIRMED', // auto-confirm for simplicity; can be PENDING
          customerNotes: customerData.notes,
          createdBy: 'ONLINE',
        },
        include: {
          customer: true,
          barber: true,
          service: true,
        },
      })

      return appointment
    })

    return { success: true, appointment: result }
  } catch (error: any) {
    if (error.message === 'SLOT_TAKEN') {
      return { success: false, error: 'Sorry, that time was just booked. Please select another time.' }
    }
    if (error.message === 'BARBER_OFF') {
      return { success: false, error: 'The barber is not available on this day.' }
    }
    if (error.message === 'BLOCKED') {
      return { success: false, error: 'This time slot is blocked.' }
    }
    console.error('Booking error:', error)
    return { success: false, error: 'An error occurred while creating your appointment.' }
  }
}
