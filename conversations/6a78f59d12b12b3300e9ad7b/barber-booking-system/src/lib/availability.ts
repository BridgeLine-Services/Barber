import { prisma } from '@/lib/prisma'
import { generateConfirmationNumber, generateCustomerAccessToken } from '@/lib/utils'
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
 * Find the earliest available slot across all active barbers offering a given service on a date.
 */
export async function getEarliestAvailableSlot(params: {
  businessId: string
  serviceId: string
  date: Date
}): Promise<{
  earliest: { barberId: string; barberName: string; time: string } | null
  slots: { time: string; available: boolean; barberId?: string; barberName?: string }[]
}> {
  const { businessId, serviceId, date } = params

  const barbers = await prisma.barber.findMany({
    where: { businessId, isActive: true },
    include: {
      services: true,
    },
    orderBy: { order: 'asc' },
  })

  const matchingBarbers = barbers.filter((barber) => {
    if (!barber.services || barber.services.length === 0) return true
    return barber.services.some((bs) => bs.serviceId === serviceId)
  })

  if (matchingBarbers.length === 0) {
    return { earliest: null, slots: [] }
  }

  const barberSlotsMap = await Promise.all(
    matchingBarbers.map(async (barber) => {
      const slots = await getAvailableSlots({
        businessId,
        barberId: barber.id,
        serviceId,
        date,
      })
      return { barber, slots }
    })
  )

  const slotMap = new Map<
    string,
    { time: string; available: boolean; barberId?: string; barberName?: string }
  >()

  for (const { barber, slots } of barberSlotsMap) {
    for (const slot of slots) {
      if (!slotMap.has(slot.time)) {
        slotMap.set(slot.time, {
          time: slot.time,
          available: slot.available,
          ...(slot.available && { barberId: barber.id, barberName: barber.name }),
        })
      } else {
        const existing = slotMap.get(slot.time)!
        if (!existing.available && slot.available) {
          existing.available = true
          existing.barberId = barber.id
          existing.barberName = barber.name
        }
      }
    }
  }

  const mergedSlots = Array.from(slotMap.values())

  const earliestSlot = mergedSlots.find((s) => s.available)
  const earliest =
    earliestSlot && earliestSlot.barberId && earliestSlot.barberName
      ? {
          barberId: earliestSlot.barberId,
          barberName: earliestSlot.barberName,
          time: earliestSlot.time,
        }
      : null

  return { earliest, slots: mergedSlots }
}

/**
 * Canonical slot validation — the single source of truth for whether a
 * specific start time is bookable for a barber+service+business.
 *
 * Used by BOTH the initial booking AND reschedule to ensure one consistent
 * rule set. Never duplicate these checks — call this function.
 */
export async function validateSlot(params: {
  businessId: string
  barberId: string
  serviceId: string
  startTime: Date
  excludeAppointmentId?: string // exclude self when rescheduling
}): Promise<{ valid: boolean; error?: string; endTime?: Date }> {
  const { businessId, barberId, serviceId, startTime, excludeAppointmentId } = params

  // 1. Verify the barber belongs to this business and is active
  const barber = await prisma.barber.findFirst({
    where: { id: barberId, businessId, isActive: true },
    include: { services: true },
  })
  if (!barber) return { valid: false, error: 'Barber not found or inactive' }

  // 2. Verify the service belongs to this business and is active
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  })
  if (!service) return { valid: false, error: 'Service not found or inactive' }

  // 3. Verify the barber offers this service (if barber has services defined)
  if (barber.services.length > 0 && !barber.services.some(bs => bs.serviceId === serviceId)) {
    return { valid: false, error: 'Barber does not offer this service' }
  }

  // 4. Cannot book in the past
  const now = new Date()
  if (startTime < now) return { valid: false, error: 'Cannot book an appointment in the past' }

  const endTime = addMinutes(startTime, service.duration)

  // 5. Check barber schedule for this day of week
  const dayOfWeek = startTime.getDay()
  const schedule = await prisma.schedule.findUnique({
    where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
  })
  if (!schedule || schedule.isOff) return { valid: false, error: 'Barber is not working on this day' }

  // 6. Check the start/end time is within working hours
  const [startH, startM] = schedule.startTime.split(':').map(Number)
  const [endH, endM] = schedule.endTime.split(':').map(Number)
  const dayStart = new Date(startTime)
  dayStart.setHours(startH, startM, 0, 0)
  const dayEnd = new Date(startTime)
  dayEnd.setHours(endH, endM, 0, 0)

  if (startTime < dayStart || endTime > dayEnd) {
    return { valid: false, error: 'Selected time is outside working hours' }
  }

  // 7. Check breaks
  if (schedule.breaks && Array.isArray(schedule.breaks)) {
    for (const brk of schedule.breaks as any[]) {
      if (brk && typeof brk === 'object' && 'start' in brk && 'end' in brk) {
        const [bh, bm] = String(brk.start).split(':').map(Number)
        const [eh, em] = String(brk.end).split(':').map(Number)
        const breakStart = new Date(startTime)
        breakStart.setHours(bh, bm, 0, 0)
        const breakEnd = new Date(startTime)
        breakEnd.setHours(eh, em, 0, 0)
        if (startTime < breakEnd && endTime > breakStart) {
          return { valid: false, error: 'Selected time overlaps a break' }
        }
      }
    }
  }

  // 8. Check blocked times
  const blocked = await prisma.blockedTime.findFirst({
    where: {
      businessId,
      OR: [{ barberId }, { barberId: null }],
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  })
  if (blocked) return { valid: false, error: 'This time slot is blocked' }

  // 9. Check existing appointment conflicts (exclude self for reschedule)
  const conflictWhere: any = {
    businessId,
    barberId,
    status: { in: ['PENDING', 'CONFIRMED'] },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  }
  if (excludeAppointmentId) {
    conflictWhere.id = { not: excludeAppointmentId }
  }
  const conflicting = await prisma.appointment.findFirst({ where: conflictWhere })
  if (conflicting) return { valid: false, error: 'This time slot conflicts with another appointment' }

  return { valid: true, endTime }
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
  idempotencyKey?: string
  customerData: {
    firstName: string
    lastName: string
    phone: string
    email: string
    notes?: string
    smsConsent?: boolean
  }
}): Promise<{ success: boolean; appointment?: any; error?: string }> {
  const { businessId, barberId, serviceId, startTime, idempotencyKey, customerData } = params

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

      // 8. Create the appointment with secure customer access token
      const customerAccessToken = generateCustomerAccessToken()
      const appointment = await tx.appointment.create({
        data: {
          confirmationNumber,
          customerAccessToken,
          idempotencyKey,
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
