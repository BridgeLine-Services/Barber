import { prisma } from '@/lib/prisma'
import { getAvailableSlots, validateSlot, createAppointmentSafely } from '@/lib/availability'
import { addDays } from 'date-fns'

// ============================================================================
// Recurring Appointment Engine
// Creates a series of appointments at regular intervals (2, 3, or 4 weeks).
// Checks availability for each occurrence and returns a preview with
// conflict resolution options before committing.
// ============================================================================

export type RecurringInterval = 2 | 3 | 4 // weeks

export interface RecurringPreviewOccurrence {
  date: Date
  dateLabel: string
  available: boolean
  reason?: string // why unavailable
  existingSlot?: string // the conflicting appointment
}

export interface RecurringPreview {
  occurrences: RecurringPreviewOccurrence[]
  totalOccurrences: number
  availableCount: number
  conflictCount: number
}

/**
 * Preview a recurring appointment series WITHOUT creating any appointments.
 * Checks barber availability for each occurrence and returns conflicts.
 */
export async function previewRecurringAppointments(params: {
  businessId: string
  barberId: string
  serviceId: string
  startDate: Date
  intervalWeeks: RecurringInterval
  totalOccurrences: number
  preferredTime?: string // e.g. "2:00 PM" — the time on each date
}): Promise<RecurringPreview> {
  const { businessId, barberId, serviceId, startDate, intervalWeeks, totalOccurrences, preferredTime } = params

  const intervalDays = intervalWeeks * 7
  const occurrences: RecurringPreviewOccurrence[] = []

  for (let i = 0; i < totalOccurrences; i++) {
    const occurrenceDate = addDays(startDate, i * intervalDays)
    const dateLabel = occurrenceDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    // Check if barber is working on this day
    const dayOfWeek = occurrenceDate.getDay()
    const schedule = await prisma.schedule.findUnique({
      where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
    })

    if (!schedule || schedule.isOff) {
      occurrences.push({
        date: occurrenceDate,
        dateLabel,
        available: false,
        reason: 'Barber not working on this day',
      })
      continue
    }

    // Check for business closures
    const closures = await prisma.businessClosure.findMany({
      where: {
        businessId,
        isActive: true,
        startDate: { lte: occurrenceDate },
        endDate: { gte: occurrenceDate },
      },
    })

    if (closures.some(c => c.isAllDay)) {
      occurrences.push({
        date: occurrenceDate,
        dateLabel,
        available: false,
        reason: 'Shop closed',
      })
      continue
    }

    // Check for blocked times
    const dayStart = new Date(occurrenceDate.getFullYear(), occurrenceDate.getMonth(), occurrenceDate.getDate(), 0, 0, 0)
    const dayEnd = new Date(occurrenceDate.getFullYear(), occurrenceDate.getMonth(), occurrenceDate.getDate() + 1, 0, 0, 0)

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        businessId,
        OR: [{ barberId }, { barberId: null }],
        startTime: { gte: dayStart, lt: dayEnd },
      },
    })

    // If we have a preferred time, validate the specific slot
    if (preferredTime) {
      const bookingDate = parseTimeString(occurrenceDate, preferredTime)
      const validation = await validateSlot({
        businessId,
        barberId,
        serviceId,
        startTime: bookingDate,
      })

      if (!validation.valid) {
        // Check if it's a blocked time or closure
        const isBlocked = blockedTimes.some(bt =>
          bookingDate < bt.endTime && bookingDate >= bt.startTime
        )
        occurrences.push({
          date: occurrenceDate,
          dateLabel,
          available: false,
          reason: isBlocked ? 'Time blocked' : validation.error,
        })
        continue
      }

      occurrences.push({
        date: occurrenceDate,
        dateLabel,
        available: true,
      })
    } else {
      // No preferred time — check if ANY slot is available on this date
      const slots = await getAvailableSlots({
        businessId,
        barberId,
        serviceId,
        date: occurrenceDate,
      })

      const hasAvailable = slots.some(s => s.available)

      if (!hasAvailable) {
        occurrences.push({
          date: occurrenceDate,
          dateLabel,
          available: false,
          reason: 'No available slots',
        })
        continue
      }

      occurrences.push({
        date: occurrenceDate,
        dateLabel,
        available: true,
      })
    }
  }

  const conflictCount = occurrences.filter(o => !o.available).length

  return {
    occurrences,
    totalOccurrences: occurrences.length,
    availableCount: occurrences.length - conflictCount,
    conflictCount,
  }
}

/**
 * Create a recurring appointment series.
 * Only creates appointments for available occurrences.
 * Returns the created appointments and any skipped conflicts.
 */
export async function createRecurringAppointments(params: {
  businessId: string
  barberId: string
  serviceId: string
  startDate: Date
  intervalWeeks: RecurringInterval
  totalOccurrences: number
  preferredTime: string
  customerData: {
    firstName: string
    lastName: string
    phone: string
    email: string
    notes?: string
    smsConsent?: boolean
  }
  createdBy?: string
}): Promise<{
  created: any[]
  conflicts: { date: Date; dateLabel: string; reason: string }[]
}> {
  const { businessId, barberId, serviceId, startDate, intervalWeeks, totalOccurrences, preferredTime, customerData, createdBy } = params
  const intervalDays = intervalWeeks * 7
  const created: any[] = []
  const conflicts: { date: Date; dateLabel: string; reason: string }[] = []

  for (let i = 0; i < totalOccurrences; i++) {
    const occurrenceDate = addDays(startDate, i * intervalDays)
    const dateLabel = occurrenceDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    const bookingDate = parseTimeString(occurrenceDate, preferredTime)

    const result = await createAppointmentSafely({
      businessId,
      barberId,
      serviceId,
      startTime: bookingDate,
      customerData,
    })

    if (result.success) {
      created.push(result.appointment)
    } else {
      conflicts.push({ date: occurrenceDate, dateLabel, reason: result.error || 'Unknown error' })
    }
  }

  // Log to audit log
  if (created.length > 0) {
    try {
      await prisma.auditLog.create({
        data: {
          businessId,
          action: 'APPOINTMENT_CREATED',
          entityType: 'RecurringSeries',
          newValues: {
            barberId,
            serviceId,
            intervalWeeks,
            totalOccurrences,
            createdCount: created.length,
            conflictCount: conflicts.length,
            createdBy,
          },
        },
      })
    } catch (e) {
      // Non-critical
    }
  }

  return { created, conflicts }
}

/**
 * Parse a time string like "2:00 PM" into a Date on the given day.
 */
function parseTimeString(date: Date, timeStr: string): Date {
  const result = new Date(date)
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const period = match[3].toUpperCase()
    if (period === 'PM' && hours < 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    result.setHours(hours, minutes, 0, 0)
  } else {
    const parts = timeStr.split(':')
    result.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0)
  }
  return result
}
