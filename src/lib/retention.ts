import type { AppointmentStatus } from '@prisma/client'

export type RetentionLifecycle = 'NEW' | 'ACTIVE' | 'DUE' | 'OVERDUE' | 'AT_RISK' | 'INACTIVE'

export interface RetentionSettingsInput {
  defaultRebookingIntervalDays?: number | null
  dueSoonWindowDays?: number | null
  atRiskAfterDays?: number | null
  inactiveAfterDays?: number | null
  highRiskWarningThreshold?: number | null
  maxCancellationsBeforeWarning?: number | null
}

export interface RetentionAppointment {
  status: AppointmentStatus | string
  startTime: Date
  servicePrice?: number | null
}

export interface RetentionStats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  rescheduledAppointments: number
  recordedServiceValue: number
  averageAppointmentValue: number
  cancellationRate: number
  noShowRate: number
  firstCompletedAt: Date | null
  lastCompletedAt: Date | null
  averageIntervalDays: number | null
}

export function calculateRetentionStats(appointments: RetentionAppointment[]): RetentionStats {
  const completed = appointments.filter((a) => a.status === 'COMPLETED').sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED').length
  const noShowAppointments = appointments.filter((a) => a.status === 'NO_SHOW').length
  const rescheduledAppointments = appointments.filter((a) => a.status === 'RESCHEDULED').length
  const recordedServiceValue = completed.reduce((sum, appointment) => sum + (appointment.servicePrice ?? 0), 0)
  const intervals = completed.slice(1).map((appointment, index) =>
    (appointment.startTime.getTime() - completed[index].startTime.getTime()) / 86_400_000,
  )
  const totalOutcomes = completed.length + cancelledAppointments + noShowAppointments

  return {
    totalAppointments: appointments.length,
    completedAppointments: completed.length,
    cancelledAppointments,
    noShowAppointments,
    rescheduledAppointments,
    recordedServiceValue: Math.round(recordedServiceValue * 100) / 100,
    averageAppointmentValue: completed.length ? Math.round((recordedServiceValue / completed.length) * 100) / 100 : 0,
    cancellationRate: totalOutcomes ? cancelledAppointments / totalOutcomes : 0,
    noShowRate: totalOutcomes ? noShowAppointments / totalOutcomes : 0,
    firstCompletedAt: completed[0]?.startTime ?? null,
    lastCompletedAt: completed.at(-1)?.startTime ?? null,
    averageIntervalDays: intervals.length ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : null,
  }
}

export function getRecommendedIntervalDays(
  averageIntervalDays: number | null,
  serviceIntervalDays?: number | null,
  defaultIntervalDays = 21,
): number {
  const candidate = serviceIntervalDays ?? averageIntervalDays ?? defaultIntervalDays
  return Math.max(1, Math.round(candidate))
}

export function getExpectedReturnDate(lastCompletedAt: Date | null, intervalDays: number): Date | null {
  if (!lastCompletedAt) return null
  const expected = new Date(lastCompletedAt)
  expected.setDate(expected.getDate() + getRecommendedIntervalDays(null, intervalDays))
  return expected
}

export function getRetentionLifecycle(
  stats: Pick<RetentionStats, 'completedAppointments' | 'lastCompletedAt' | 'noShowAppointments' | 'cancelledAppointments'>,
  expectedReturnDate: Date | null,
  settings: RetentionSettingsInput = {},
  now = new Date(),
): RetentionLifecycle {
  if (stats.completedAppointments <= 1) return 'NEW'
  if (!expectedReturnDate) return 'INACTIVE'

  const daysSinceExpected = Math.floor((now.getTime() - expectedReturnDate.getTime()) / 86_400_000)
  const dueSoonWindow = Math.max(1, settings.dueSoonWindowDays ?? 5)
  const atRiskAfter = Math.max(dueSoonWindow + 1, settings.atRiskAfterDays ?? 30)
  const inactiveAfter = Math.max(atRiskAfter + 1, settings.inactiveAfterDays ?? 90)
  const riskThreshold = Math.max(1, settings.highRiskWarningThreshold ?? 2)

  if (stats.noShowAppointments >= riskThreshold || stats.cancelledAppointments >= (settings.maxCancellationsBeforeWarning ?? 3)) return 'AT_RISK'
  if (daysSinceExpected >= inactiveAfter) return 'INACTIVE'
  if (daysSinceExpected >= atRiskAfter) return 'AT_RISK'
  if (daysSinceExpected >= 0) return 'OVERDUE'
  if (daysSinceExpected >= -dueSoonWindow) return 'DUE'
  return 'ACTIVE'
}

export function formatRetentionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

export function buildRebookingIdempotencyKey(customerId: string, channel: 'SMS' | 'EMAIL', referenceDate: Date): string {
  return `rebooking:${customerId}:${channel}:${referenceDate.toISOString().slice(0, 10)}`
}

export function buildRebookingMessage(firstName: string, serviceName: string, barberName: string, bookingUrl: string): string {
  return `Hi ${firstName}! It is about time for your next ${serviceName}. Want to book with ${barberName}? ${bookingUrl}`
}

export function isAppointmentEligibleForReminder(status: string): boolean {
  return status === 'PENDING' || status === 'CONFIRMED'
}

export function isCompletedStatus(status: string): boolean {
  return status === 'COMPLETED'
}
