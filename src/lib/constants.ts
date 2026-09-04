// ─── App-wide constants ────────────────────────────────────────────────────

export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
] as const

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-Show',
  RESCHEDULED: 'Rescheduled',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-200',
  RESCHEDULED: 'bg-purple-100 text-purple-800 border-purple-200',
}

export const STATUS_DOT_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-green-500',
  COMPLETED: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-gray-500',
  RESCHEDULED: 'bg-purple-500',
}

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const PAYMENT_DISCLAIMER =
  'Prices are subject to change. Payment is collected in person at the time of your appointment.'

export const BOOKING_FLOW_STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Barber' },
  { id: 3, label: 'Date' },
  { id: 4, label: 'Time' },
  { id: 5, label: 'Your Info' },
  { id: 6, label: 'Confirm' },
] as const
