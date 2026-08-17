import { prisma } from '@/lib/prisma'
import { formatFullDate, formatTime } from '@/lib/utils'
import nodemailer from 'nodemailer'
import { sendSms, isTwilioConfigured, buildReminderMessage, buildConfirmationMessage } from '@/lib/twilio'

// ============================================================================
// Notification System
// Email + SMS notifications for booking confirmation, reminders, and alerts.
// Email uses Nodemailer (SMTP). SMS uses Twilio REST API (no npm package).
// All notification attempts are logged to the NotificationLog table for
// delivery tracking. The owner dashboard can show which messages failed.
// ============================================================================

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

interface AppointmentWithRelations {
  id?: string
  confirmationNumber: string
  startTime: Date
  endTime: Date
  customer: { firstName: string; lastName: string; email: string; phone: string }
  barber: { name: string }
  service: { name: string; duration: number; price: number }
  business: { name: string; phone: string | null; email: string | null; address: string | null; id?: string }
}

/**
 * Log a notification attempt to the database for delivery tracking.
 */
async function logNotification(params: {
  businessId?: string
  appointmentId?: string
  recipient: string
  channel: 'EMAIL' | 'SMS'
  type: 'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'CANCELLATION_NOTICE' | 'RESCHEDULE_NOTICE' | 'CONTACT_FORM' | 'WAITLIST_NOTIFICATION'
  status: 'PENDING' | 'SENT' | 'FAILED'
  errorMessage?: string
}) {
  try {
    await prisma.notificationLog.create({
      data: {
        businessId: params.businessId || null,
        appointmentId: params.appointmentId || null,
        recipient: params.recipient,
        channel: params.channel,
        type: params.type,
        status: params.status,
        errorMessage: params.errorMessage || null,
        sentAt: params.status === 'SENT' ? new Date() : null,
      },
    })
  } catch (error) {
    console.error('Failed to log notification:', error)
  }
}

export async function sendBookingConfirmation(appointment: AppointmentWithRelations) {
  const dateStr = formatFullDate(appointment.startTime)
  const timeStr = formatTime(appointment.startTime)

  // Customer email
  const customerHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Appointment Confirmed</h1>
      <p>Hi ${appointment.customer.firstName},</p>
      <p>Your appointment with <strong>${appointment.barber.name}</strong> is scheduled for:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>${appointment.service.name}</strong></p>
        <p style="margin: 5px 0;">${dateStr} at ${timeStr}</p>
        <p style="margin: 5px 0;">Barber: ${appointment.barber.name}</p>
        <p style="margin: 5px 0;">Duration: ${appointment.service.duration} minutes</p>
        <p style="margin: 5px 0; color: #666;">Payment: Pay in person at the barbershop.</p>
      </div>
      <p style="font-size: 14px; color: #666;">
        Confirmation #: <strong>${appointment.confirmationNumber}</strong><br/>
        Prices are subject to change. Payment is collected in person.
      </p>
      <p style="font-size: 14px; color: #666;">
        Need to reschedule or cancel? Use your confirmation number on our website.
      </p>
    </div>
  `

  // Barber email
  const barberHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">New Appointment</h1>
      <p>You have a new booking:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>${appointment.customer.firstName} ${appointment.customer.lastName}</strong></p>
        <p style="margin: 5px 0;">${appointment.service.name} — ${appointment.service.duration} min</p>
        <p style="margin: 5px 0;">${dateStr} at ${timeStr}</p>
        <p style="margin: 5px 0;">Phone: ${appointment.customer.phone}</p>
        <p style="margin: 5px 0;">Email: ${appointment.customer.email}</p>
        <p style="margin: 5px 0;">Confirmation #: ${appointment.confirmationNumber}</p>
      </div>
    </div>
  `

  // Send customer confirmation email
  try {
    const transport = getTransporter()
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'noreply@barbershop.com',
      to: appointment.customer.email,
      subject: `Appointment Confirmed — ${appointment.business.name}`,
      html: customerHtml,
    })
    await logNotification({
      businessId: appointment.business.id,
      appointmentId: appointment.id,
      recipient: appointment.customer.email,
      channel: 'EMAIL',
      type: 'BOOKING_CONFIRMATION',
      status: 'SENT',
    })
  } catch (error) {
    console.error('Email notification error:', error)
    await logNotification({
      businessId: appointment.business.id,
      appointmentId: appointment.id,
      recipient: appointment.customer.email,
      channel: 'EMAIL',
      type: 'BOOKING_CONFIRMATION',
      status: 'FAILED',
      errorMessage: String(error),
    })
  }

  // Send barber/shop notification email
  if (appointment.business.email) {
    try {
      const transport = getTransporter()
      await transport.sendMail({
        from: process.env.SMTP_FROM || 'noreply@barbershop.com',
        to: appointment.business.email,
        subject: `New Appointment: ${appointment.customer.firstName} ${appointment.customer.lastName}`,
        html: barberHtml,
      })
      await logNotification({
        businessId: appointment.business.id,
        appointmentId: appointment.id,
        recipient: appointment.business.email,
        channel: 'EMAIL',
        type: 'BOOKING_CONFIRMATION',
        status: 'SENT',
      })
    } catch (error) {
      console.error('Barber email notification error:', error)
      await logNotification({
        businessId: appointment.business.id,
        appointmentId: appointment.id,
        recipient: appointment.business.email,
        channel: 'EMAIL',
        type: 'BOOKING_CONFIRMATION',
        status: 'FAILED',
        errorMessage: String(error),
      })
    }
  }

  // Send SMS confirmation if Twilio is configured
  if (isTwilioConfigured() && appointment.customer.phone) {
    const smsBody = buildConfirmationMessage({
      businessName: appointment.business.name,
      customerName: appointment.customer.firstName,
      service: appointment.service.name,
      date: dateStr,
      time: timeStr,
      confirmationNumber: appointment.confirmationNumber,
    })
    const smsResult = await sendSms(appointment.customer.phone, smsBody)
    await logNotification({
      businessId: appointment.business.id,
      appointmentId: appointment.id,
      recipient: appointment.customer.phone,
      channel: 'SMS',
      type: 'BOOKING_CONFIRMATION',
      status: smsResult.success ? 'SENT' : 'FAILED',
      errorMessage: smsResult.success ? undefined : smsResult.error,
    })
  }
}

export async function sendAppointmentReminder(appointment: AppointmentWithRelations, hoursBefore: number) {
  const dateStr = formatFullDate(appointment.startTime)
  const timeStr = formatTime(appointment.startTime)
  const reminderText =
    hoursBefore === 24
      ? `Reminder: You have an appointment tomorrow at ${timeStr}.`
      : `Reminder: Your barber appointment is coming up at ${timeStr}.`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Appointment Reminder</h2>
      <p>${reminderText}</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>${appointment.service.name}</strong></p>
        <p style="margin: 5px 0;">${dateStr}</p>
        <p style="margin: 5px 0;">Barber: ${appointment.barber.name}</p>
        <p style="margin: 5px 0;">Confirmation #: ${appointment.confirmationNumber}</p>
      </div>
    </div>
  `

  // Email reminder
  try {
    const transport = getTransporter()
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'noreply@barbershop.com',
      to: appointment.customer.email,
      subject: `Appointment Reminder — ${appointment.business.name}`,
      html,
    })
    await logNotification({
      businessId: appointment.business.id,
      appointmentId: appointment.id,
      recipient: appointment.customer.email,
      channel: 'EMAIL',
      type: 'BOOKING_REMINDER',
      status: 'SENT',
    })
  } catch (error) {
    console.error('Reminder email error:', error)
    await logNotification({
      businessId: appointment.business.id,
      appointmentId: appointment.id,
      recipient: appointment.customer.email,
      channel: 'EMAIL',
      type: 'BOOKING_REMINDER',
      status: 'FAILED',
      errorMessage: String(error),
    })
  }

  // SMS reminder if Twilio is configured
  if (isTwilioConfigured() && appointment.customer.phone) {
    const smsBody = buildReminderMessage({
      businessName: appointment.business.name,
      customerName: appointment.customer.firstName,
      service: appointment.service.name,
      date: dateStr,
      time: timeStr,
      confirmationNumber: appointment.confirmationNumber,
    })
    const smsResult = await sendSms(appointment.customer.phone, smsBody)
    await logNotification({
      businessId: appointment.business.id,
      appointmentId: appointment.id,
      recipient: appointment.customer.phone,
      channel: 'SMS',
      type: 'BOOKING_REMINDER',
      status: smsResult.success ? 'SENT' : 'FAILED',
      errorMessage: smsResult.success ? undefined : smsResult.error,
    })
  }
}

/**
 * Send an SMS reminder to a customer.
 * Now uses real Twilio instead of a stub.
 */
export async function sendSmsReminder(phone: string, message: string) {
  if (!isTwilioConfigured()) {
    console.log(`[SMS not configured] To: ${phone}, Message: ${message}`)
    await logNotification({
      recipient: phone,
      channel: 'SMS',
      type: 'BOOKING_REMINDER',
      status: 'FAILED',
      errorMessage: 'Twilio not configured',
    })
    return
  }

  const result = await sendSms(phone, message)
  await logNotification({
    recipient: phone,
    channel: 'SMS',
    type: 'BOOKING_REMINDER',
    status: result.success ? 'SENT' : 'FAILED',
    errorMessage: result.success ? undefined : result.error,
  })
}

// ============================================================================
// Waitlist notifications
// Sent when a cancelled slot is offered to the top waitlist candidate.
// Includes a secure claim link so the customer can book the released slot.
// ============================================================================

export async function sendWaitlistSlotNotification(params: {
  businessId?: string
  entryId: string
  customer: { firstName: string; lastName: string; email: string; phone: string }
  service: { name: string; duration: number }
  barber: { name: string }
  slotStart: Date
  slotEnd: Date
  claimToken: string
  claimUrl: string
  business: { name: string; phone: string | null; email: string | null }
}): Promise<void> {
  const dateStr = formatFullDate(params.slotStart)
  const timeStr = formatTime(params.slotStart)
  const holdMinutes = 15

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">A Slot Just Opened Up!</h1>
      <p>Hi ${params.customer.firstName},</p>
      <p>Good news — an appointment slot just became available that matches your waitlist request:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>${params.service.name}</strong></p>
        <p style="margin: 5px 0;">${dateStr} at ${timeStr}</p>
        <p style="margin: 5px 0;">Barber: ${params.barber.name}</p>
      </div>
      <p>This slot is held for you for <strong>${holdMinutes} minutes</strong>. Click below to claim it:</p>
      <a href="${params.claimUrl}" style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0;">Claim This Slot</a>
      <p style="font-size: 14px; color: #666;">If you no longer need an appointment, you can ignore this email.</p>
    </div>
  `

  // Email
  try {
    const transport = getTransporter()
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'noreply@barbershop.com',
      to: params.customer.email,
      subject: `Slot Available — ${params.business.name}`,
      html,
    })
    await logNotification({
      businessId: params.businessId,
      recipient: params.customer.email,
      channel: 'EMAIL',
      type: 'WAITLIST_NOTIFICATION',
      status: 'SENT',
    })
  } catch (error) {
    console.error('Waitlist email error:', error)
    await logNotification({
      businessId: params.businessId,
      recipient: params.customer.email,
      channel: 'EMAIL',
      type: 'WAITLIST_NOTIFICATION',
      status: 'FAILED',
      errorMessage: String(error),
    })
  }

  // SMS for waitlist notification
  if (isTwilioConfigured() && params.customer.phone) {
    const smsBody = `${params.business.name}: A slot opened for ${params.service.name} on ${dateStr} at ${timeStr}. You have ${holdMinutes} min to claim: ${params.claimUrl}`
    const smsResult = await sendSms(params.customer.phone, smsBody)
    await logNotification({
      businessId: params.businessId,
      recipient: params.customer.phone,
      channel: 'SMS',
      type: 'WAITLIST_NOTIFICATION',
      status: smsResult.success ? 'SENT' : 'FAILED',
      errorMessage: smsResult.success ? undefined : smsResult.error,
    })
  }
}
