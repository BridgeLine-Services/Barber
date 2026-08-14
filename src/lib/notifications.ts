import { prisma } from '@/lib/prisma'
import { formatFullDate, formatTime } from '@/lib/utils'
import nodemailer from 'nodemailer'

// ============================================================================
// Notification System
// Email notifications for booking confirmation, reminders, and barber alerts.
// SMS is optional and stubbed — wire up Twilio when ready.
// All notification attempts are logged to the NotificationLog table for
// delivery tracking. The owner dashboard can show which emails failed.
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
  type: 'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'CANCELLATION_NOTICE' | 'RESCHEDULE_NOTICE' | 'CONTACT_FORM'
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
}

// SMS stub — wire up Twilio when ready
export async function sendSmsReminder(phone: string, message: string) {
  // TODO: Implement with Twilio when SMS is enabled
  console.log(`[SMS stub] To: ${phone}, Message: ${message}`)
  await logNotification({
    recipient: phone,
    channel: 'SMS',
    type: 'BOOKING_REMINDER',
    status: 'SENT',
  })
}
