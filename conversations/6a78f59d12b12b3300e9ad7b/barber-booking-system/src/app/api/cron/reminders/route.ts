export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminder } from '@/lib/notifications'

/**
 * GET /api/cron/reminders
 * Called by Vercel Cron (or external scheduler) every 15 minutes.
 * Sends booking reminders at 24h, 3h, 1h, and 30min before appointment time.
 *
 * Protected by CRON_SECRET — must match Authorization header.
 *
 * Vercel cron config (vercel.json):
 *   { "crons": [{ "path": "/api/cron/reminders", "schedule": "0,15,30,45 * * * *" }] }
 */

const REMINDER_WINDOWS = [
  { hoursBefore: 24,  label: '24h' },
  { hoursBefore: 3,   label: '3h' },
  { hoursBefore: 1,   label: '1h' },
  { hoursBefore: 0.5, label: '30min' },
]

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Array<{ window: string; sent: number; failed: number; skipped: number }> = []
  const now = new Date()

  try {
    for (const window of REMINDER_WINDOWS) {
      // Calculate the time window: appointments starting between (now + windowHours - 7.5min) and (now + windowHours + 7.5min)
      // Since cron runs every 15 min, we use a ±8 min buffer to avoid missing any
      const targetTime = new Date(now.getTime() + window.hoursBefore * 60 * 60 * 1000)
      const windowStart = new Date(targetTime.getTime() - 8 * 60 * 1000)
      const windowEnd = new Date(targetTime.getTime() + 8 * 60 * 1000)

      // Find confirmed appointments in this time window that haven't had this reminder sent yet
      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          startTime: {
            gte: windowStart,
            lte: windowEnd,
          },
          // Exclude appointments that already got this reminder type
          notificationLogs: {
            none: {
              type: 'BOOKING_REMINDER',
              status: 'SENT',
              // Check if the reminder label is in errorMessage or we use a different approach
              // We'll use createdAt to determine which window — compare with the reminder window time
            },
          },
        },
        include: {
          customer: true,
          barber: true,
          service: true,
          business: true,
          notificationLogs: {
            where: {
              type: 'BOOKING_REMINDER',
              status: 'SENT',
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      let sent = 0
      let failed = 0
      let skipped = 0

      for (const appointment of appointments) {
        // Check if we already sent a reminder for this window
        // Use the notification log timestamps to deduplicate
        const alreadySent = appointment.notificationLogs.some((log) => {
          const logTime = new Date(log.createdAt)
          const expectedReminderTime = new Date(appointment.startTime.getTime() - window.hoursBefore * 60 * 60 * 1000)
          // If a reminder was sent within ±15 min of when this window's reminder should have been sent
          return Math.abs(logTime.getTime() - expectedReminderTime.getTime()) < 15 * 60 * 1000
        })

        if (alreadySent) {
          skipped++
          continue
        }

        try {
          await sendAppointmentReminder(
            {
              id: appointment.id,
              confirmationNumber: appointment.confirmationNumber,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              customer: {
                firstName: appointment.customer.firstName,
                lastName: appointment.customer.lastName,
                email: appointment.customer.email,
                phone: appointment.customer.phone,
              },
              barber: { name: appointment.barber.name },
              service: {
                name: appointment.service.name,
                duration: appointment.service.duration,
                price: appointment.service.price,
              },
              business: {
                id: appointment.business.id,
                name: appointment.business.name,
                phone: appointment.business.phone,
                email: appointment.business.email,
                address: appointment.business.address,
              },
            },
            window.hoursBefore
          )
          sent++
        } catch (error) {
          console.error(`Failed to send ${window.label} reminder for appointment ${appointment.id}:`, error)
          failed++
        }
      }

      results.push({ window: window.label, sent, failed, skipped })
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    })
  } catch (error: any) {
    if (error.code === 'P1001' || error.message?.includes('connect')) {
      return NextResponse.json({
        success: false,
        demo: true,
        message: 'No database connected. Reminders require a database to query appointments.',
      }, { status: 503 })
    }
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 })
  }
}
