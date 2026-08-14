// ============================================================================
// Validation Schemas (Zod)
// Every API route MUST validate input with these schemas before processing.
// ============================================================================

import { z } from 'zod'

// ─── Booking ───────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  barberId: z.string().min(1).optional(), // can be "any"
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().min(1),
  customer: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z.string().min(7).max(20),
    email: z.string().email().max(100),
    notes: z.string().max(1000).optional(),
    smsConsent: z.boolean().optional(),
  }),
})

export const cancelByTokenSchema = z.object({
  reason: z.string().max(500).optional(),
})

export const lookupAppointmentSchema = z.object({
  confirmationNumber: z.string().min(1).max(20),
})

// ─── Dashboard: Appointments ───────────────────────────────────────────────

export const createManualAppointmentSchema = z.object({
  customerId: z.string().optional(),
  customerData: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z.string().min(7).max(20),
    email: z.string().email().max(100),
    notes: z.string().max(1000).optional(),
    smsConsent: z.boolean().optional(),
  }).optional(),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().min(1),
  notes: z.string().max(1000).optional(),
})

export const updateAppointmentSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED',
  ]).optional(),
  startTime: z.string().optional(), // ISO string for reschedule
  cancellationReason: z.string().max(500).optional(),
})

// ─── Dashboard: Services ───────────────────────────────────────────────────

export const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  duration: z.number().int().min(5).max(480), // 5 min to 8 hours
  price: z.number().min(0).max(10000),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  barberIds: z.array(z.string()).optional(),
})

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  duration: z.number().int().min(5).max(480).optional(),
  price: z.number().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  barberIds: z.array(z.string()).optional(),
})

// ─── Dashboard: Barbers ────────────────────────────────────────────────────

export const createBarberSchema = z.object({
  name: z.string().min(1).max(100),
  specialty: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  photo: z.string().url().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  serviceIds: z.array(z.string()).optional(),
})

export const updateBarberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  specialty: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  photo: z.string().url().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  serviceIds: z.array(z.string()).optional(),
})

// ─── Dashboard: Schedule ───────────────────────────────────────────────────

export const scheduleEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'startTime must be HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'endTime must be HH:mm'),
  isOff: z.boolean(),
  breaks: z.array(z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional(),
})

export const updateScheduleSchema = z.object({
  schedules: z.array(scheduleEntrySchema),
})

// ─── Dashboard: Blocked Time ───────────────────────────────────────────────

export const createBlockedTimeSchema = z.object({
  barberId: z.string().optional().nullable(),
  startTime: z.string(), // ISO string
  endTime: z.string(), // ISO string
  reason: z.string().max(500).optional(),
})

// ─── Dashboard: Customer ───────────────────────────────────────────────────

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().max(100).optional(),
  notes: z.string().max(2000).optional(),
  smsConsent: z.boolean().optional(),
})

// ─── Contact Form ──────────────────────────────────────────────────────────

export const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  message: z.string().min(1).max(5000),
})

// ─── Business Settings ─────────────────────────────────────────────────────

export const updateBusinessSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  timezone: z.string().max(50).optional(),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  tiktok: z.string().max(100).optional(),
  aboutText: z.string().max(5000).optional(),
  hours: z.record(z.string(), z.any()).optional(),
})

// ─── Appointment Status Transitions ────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
  COMPLETED: [], // terminal
  CANCELLED: [], // terminal
  NO_SHOW: [], // terminal
  RESCHEDULED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
}

export function isValidTransition(from: string, to: string): boolean {
  // Owner override is allowed via forceUpdate param — handled in route
  const allowed = VALID_TRANSITIONS[from] || []
  return allowed.includes(to)
}

export function isTerminalStatus(status: string): boolean {
  return ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)
}
