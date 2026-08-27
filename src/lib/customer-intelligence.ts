import { prisma } from '@/lib/prisma'
import { getRetentionLifecycle, getRecommendedIntervalDays, calculateRetentionStats, type RetentionLifecycle } from '@/lib/retention'

// ============================================================================
// Customer Intelligence Engine
// Computes behavioral history for each customer:
// - Visit count
// - Last visit
// - Favorite barber (most frequent)
// - Favorite service (most frequent)
// - Average interval between visits (days)
// - Average ticket price
// - Cancellation count
// - No-show count
// - Next predicted appointment date
// - Lifetime value
// ============================================================================

export interface CustomerIntelligence {
  customerId: string
  visitCount: number
  completedCount: number
  lastVisit: Date | null
  firstVisit: Date | null
  favoriteBarber: { id: string; name: string } | null
  favoriteService: { id: string; name: string } | null
  averageIntervalDays: number | null
  averageTicket: number | null
  lifetimeValue: number
  cancellationCount: number
  noShowCount: number
  lastCancellationDate: Date | null
  nextPredictedDate: Date | null
  isDueForRebook: boolean
  retentionStatus: RetentionLifecycle
  cancellationRate: number
  noShowRate: number
  recordedServiceValue: number
}

export async function getCustomerIntelligence(
  customerId: string,
  businessId: string
): Promise<CustomerIntelligence> {
  const appointments = await prisma.appointment.findMany({
    where: { customerId, businessId },
    include: {
      barber: { select: { id: true, name: true } },
      service: { select: { id: true, name: true, price: true, recommendedRebookingIntervalDays: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  const completed = appointments.filter((a) => a.status === 'COMPLETED')
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED')
  const noShows = appointments.filter((a) => a.status === 'NO_SHOW')
  const activeOrCompleted = appointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CONFIRMED' || a.status === 'PENDING'
  )

  // Visit count = completed appointments
  const visitCount = completed.length

  // Last & first visit from completed appointments
  const lastVisit = completed.length > 0 ? completed[completed.length - 1].startTime : null
  const firstVisit = completed.length > 0 ? completed[0].startTime : null

  // Favorite barber: most frequent among completed appointments
  const barberCounts = new Map<string, { id: string; name: string; count: number }>()
  for (const appt of completed) {
    if (appt.barber) {
      const key = appt.barber.id
      const existing = barberCounts.get(key)
      if (existing) {
        existing.count++
      } else {
        barberCounts.set(key, { id: appt.barber.id, name: appt.barber.name, count: 1 })
      }
    }
  }
  let favoriteBarber: { id: string; name: string } | null = null
  if (barberCounts.size > 0) {
    const sorted = Array.from(barberCounts.values()).sort((a, b) => b.count - a.count)
    favoriteBarber = { id: sorted[0].id, name: sorted[0].name }
  }

  // Favorite service: most frequent among completed appointments
  const serviceCounts = new Map<string, { id: string; name: string; count: number }>()
  for (const appt of completed) {
    if (appt.service) {
      const key = appt.service.id
      const existing = serviceCounts.get(key)
      if (existing) {
        existing.count++
      } else {
        serviceCounts.set(key, { id: appt.service.id, name: appt.service.name, count: 1 })
      }
    }
  }
  let favoriteService: { id: string; name: string } | null = null
  if (serviceCounts.size > 0) {
    const sorted = Array.from(serviceCounts.values()).sort((a, b) => b.count - a.count)
    favoriteService = { id: sorted[0].id, name: sorted[0].name }
  }

  // Average interval between completed appointments (in days)
  let averageIntervalDays: number | null = null
  if (completed.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < completed.length; i++) {
      const diff = completed[i].startTime.getTime() - completed[i - 1].startTime.getTime()
      intervals.push(diff / (1000 * 60 * 60 * 24)) // convert ms to days
    }
    averageIntervalDays = Math.round(
      intervals.reduce((sum, val) => sum + val, 0) / intervals.length
    )
  }

  // Average ticket from completed appointments
  let averageTicket: number | null = null
  if (completed.length > 0) {
    const total = completed.reduce((sum, a) => sum + (a.service?.price || 0), 0)
    averageTicket = Math.round((total / completed.length) * 100) / 100
  }

  // Lifetime value = sum of all completed appointment prices
  const lifetimeValue = completed.reduce((sum, a) => sum + (a.service?.price || 0), 0)

  // Cancellation info
  const cancellationCount = cancelled.length
  const lastCancellationDate = cancelled.length > 0
    ? cancelled[cancelled.length - 1].startTime
    : null

  // No-show count
  const noShowCount = noShows.length

  // Predict next appointment date using observed behavior first, then the service rule.
  const intervalDays = getRecommendedIntervalDays(
    averageIntervalDays,
    completed.at(-1)?.service?.recommendedRebookingIntervalDays,
  )
  let nextPredictedDate: Date | null = null
  let isDueForRebook = false
  if (lastVisit) {
    nextPredictedDate = new Date(lastVisit)
    nextPredictedDate.setDate(nextPredictedDate.getDate() + intervalDays)

    const now = new Date()
    const hasUpcoming = activeOrCompleted.some(
      (a) => a.startTime > now && (a.status === 'CONFIRMED' || a.status === 'PENDING')
    )
    isDueForRebook = nextPredictedDate < now && !hasUpcoming
  }

  const stats = calculateRetentionStats(appointments.map((appointment) => ({
    status: appointment.status,
    startTime: appointment.startTime,
    servicePrice: appointment.service?.price,
  })))
  const retentionStatus = getRetentionLifecycle(stats, nextPredictedDate)

  return {
    customerId,
    visitCount,
    completedCount: completed.length,
    lastVisit,
    firstVisit,
    favoriteBarber,
    favoriteService,
    averageIntervalDays,
    averageTicket,
    lifetimeValue,
    cancellationCount,
    noShowCount,
    lastCancellationDate,
    nextPredictedDate,
    isDueForRebook,
    retentionStatus,
    cancellationRate: stats.cancellationRate,
    noShowRate: stats.noShowRate,
    recordedServiceValue: stats.recordedServiceValue,
  }
}

/**
 * Compute rebooking suggestion for a customer.
 * Preselects: barber, service, suggested date (3 weeks from last visit),
 * and finds the closest available time slot.
 */
export async function getRebookingSuggestion(
  customerId: string,
  businessId: string
): Promise<{
  barber: { id: string; name: string } | null
  service: { id: string; name: string; duration: number; price: number } | null
  suggestedDate: Date | null
  lastVisit: Date | null
  averageIntervalDays: number | null
}> {
  const intelligence = await getCustomerIntelligence(customerId, businessId)

  // Use favorite barber and service, or fall back to most recent
  // Note: only id/name are needed here — full duration/price are re-fetched below into serviceDetails
  let barber: { id: string; name: string } | null = intelligence.favoriteBarber
  let service: { id: string; name: string } | null = intelligence.favoriteService

  if (!barber || !service) {
    // Fall back to most recent completed appointment
    const recent = await prisma.appointment.findFirst({
      where: { customerId, businessId, status: 'COMPLETED' },
      include: {
        barber: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { startTime: 'desc' },
    })

    if (!barber && recent?.barber) {
      barber = { id: recent.barber.id, name: recent.barber.name }
    }
    if (!service && recent?.service) {
      service = {
        id: recent.service.id,
        name: recent.service.name,
      }
    }
  }

  // Get full service details
  let serviceDetails: { id: string; name: string; duration: number; price: number } | null = null
  if (service) {
    const svc = await prisma.service.findFirst({
      where: { id: service.id, businessId },
      select: { id: true, name: true, duration: true, price: true },
    })
    if (svc) {
      serviceDetails = { id: svc.id, name: svc.name, duration: svc.duration, price: svc.price }
    }
  }

  // Suggested date: average interval from last visit (default 21 days)
  let suggestedDate: Date | null = null
  if (intelligence.lastVisit) {
    const intervalDays = intelligence.averageIntervalDays || 21
    suggestedDate = new Date(intelligence.lastVisit)
    suggestedDate.setDate(suggestedDate.getDate() + intervalDays)

    // If suggested date is in the past, suggest from today + 1 day
    const now = new Date()
    if (suggestedDate < now) {
      suggestedDate = new Date(now)
      suggestedDate.setDate(suggestedDate.getDate() + 1)
    }
  }

  return {
    barber,
    service: serviceDetails,
    suggestedDate,
    lastVisit: intelligence.lastVisit,
    averageIntervalDays: intelligence.averageIntervalDays,
  }
}
