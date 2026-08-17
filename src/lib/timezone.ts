// ============================================================================
// Timezone Utilities
// Centralized timezone handling for all business logic
// Every time computation goes through these functions to ensure consistency
// ============================================================================

/**
 * The business timezone is stored on the Business model (business.timezone).
 * All appointment times in the DB are stored as UTC.
 * These helpers convert between UTC and the business's local timezone for display and logic.
 */

import { DateTime } from 'luxon'

/**
 * Convert a UTC Date to a local DateTime in the business timezone
 */
export function toLocalDate(utcDate: Date | string, timezone: string): DateTime {
  const dt = typeof utcDate === 'string' ? DateTime.fromISO(utcDate) : DateTime.fromJSDate(utcDate)
  return dt.setZone(timezone)
}

/**
 * Format a UTC date for display in the business timezone
 */
export function formatInTimezone(
  utcDate: Date | string,
  timezone: string,
  formatStr: string = 'MMM d, yyyy h:mm a'
): string {
  return toLocalDate(utcDate, timezone).toFormat(formatStr)
}

/**
 * Format just the time portion in the business timezone
 */
export function formatTimeInTimezone(utcDate: Date | string, timezone: string): string {
  return toLocalDate(utcDate, timezone).toFormat('h:mm a')
}

/**
 * Format just the date portion in the business timezone
 */
export function formatDateInTimezone(utcDate: Date | string, timezone: string): string {
  return toLocalDate(utcDate, timezone).toFormat('MMM d, yyyy')
}

/**
 * Get the start of day in the business timezone, as a UTC Date
 * Used for querying appointments that fall on a specific business-local day
 */
export function startOfDayUTC(timezone: string, date?: Date): Date {
  const dt = date ? DateTime.fromJSDate(date) : DateTime.now()
  return dt.setZone(timezone).startOf('day').toUTC().toJSDate()
}

/**
 * Get the end of day in the business timezone, as a UTC Date
 */
export function endOfDayUTC(timezone: string, date?: Date): Date {
  const dt = date ? DateTime.fromJSDate(date) : DateTime.now()
  return dt.setZone(timezone).endOf('day').toUTC().toJSDate()
}

/**
 * Get the start and end of a week (Monday-Sunday) in the business timezone
 */
export function weekRangeUTC(timezone: string, referenceDate?: Date): { start: Date; end: Date } {
  const dt = referenceDate ? DateTime.fromJSDate(referenceDate) : DateTime.now()
  const local = dt.setZone(timezone)
  const start = local.startOf('week').toUTC().toJSDate()
  const end = local.endOf('week').toUTC().toJSDate()
  return { start, end }
}

/**
 * Get the start and end of a month in the business timezone
 */
export function monthRangeUTC(timezone: string, year: number, month: number): { start: Date; end: Date } {
  const local = DateTime.fromObject({ year, month, day: 1 }, { zone: timezone })
  const start = local.toUTC().toJSDate()
  const end = local.endOf('month').endOf('day').toUTC().toJSDate()
  return { start, end }
}

/**
 * Check if a UTC date falls on the same calendar day in the business timezone
 */
export function isSameBusinessDay(utcDate: Date, timezone: string, referenceDate?: Date): boolean {
  const local = toLocalDate(utcDate, timezone)
  const ref = referenceDate ? toLocalDate(referenceDate, timezone) : toLocalDate(new Date(), timezone)
  return local.hasSame(ref, 'day')
}

/**
 * Get a human-readable timezone offset label
 * e.g. "PST (UTC-8)" or "PDT (UTC-7)"
 */
export function getTimezoneLabel(timezone: string): string {
  const now = DateTime.now().setZone(timezone)
  const offset = now.offset
  const offsetHours = Math.floor(Math.abs(offset) / 60)
  const offsetMins = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  const offsetStr = offsetMins > 0
    ? `UTC${sign}${offsetHours}:${offsetMins.toString().padStart(2, '0')}`
    : `UTC${sign}${offsetHours}`
  const abbr = now.toFormat('ZZZZ')
  return `${abbr} (${offsetStr})`
}

/**
 * List of common US timezones for settings dropdown
 */
export const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

/**
 * Generate available time slots in the business timezone,
 * converting to UTC for DB queries and storage
 */
export function localTimeToUTC(
  localTimeStr: string, // "HH:mm"
  date: Date,
  timezone: string
): Date {
  const [hours, minutes] = localTimeStr.split(':').map(Number)
  const local = DateTime.fromObject(
    { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: hours, minute: minutes },
    { zone: timezone }
  )
  return local.toUTC().toJSDate()
}
