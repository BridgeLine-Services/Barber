import { prisma } from '@/lib/prisma'
import { formatFullDate, formatTime } from '@/lib/utils'
import nodemailer from 'nodemailer'

// ============================================================================
// Notification System
// Email notifications for booking confirmation, reminders, and barber alerts.
// SMS is optional and stubbed — wire up Twilio when ready.
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
  confirmationNumber: string
  startTime: Date
  endTime: Date
  customer: { firstName: string; lastName: string; email: string; phone: string }
  barber: { name: string }
  service: { name: string; duration: number; price: number }
  business: { name: string; phone: string; email: string; address: string }
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

  try {
    const transport = getTransporter()
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'noreply@barbershop.com',
      to: appointment.customer.email,
      subject: `Appointment Confirmed — ${appointment.business.name}`,
      html: customerHtml,
    })

    if (appointment.business.email) {
      await transport.sendMail({
        from: process.env.SMTP_FROM || 'noreply@barbershop.com',
        to: appointment.business.email,
        subject: `New Appointment: ${appointment.customer.firstName} ${appointment.customer.lastName}`,
        html: barberHtml,
      })
    }
  } catch (error) {
    console.error('Email notification error:', error)
    // Don't fail the booking if email fails
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
  } catch (error) {
    console.error('Reminder email error:', error)
  }
}

// SMS stub — wire up Twilio when ready
export async function sendSmsReminder(phone: string, message: string) {
  // TODO: Implement with Twilio when SMS is enabled
  console.log(`[SMS stub] To: ${phone}, Message: ${message}`)
}
