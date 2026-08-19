export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminder } from '@/lib/notifications'

/**
 * GET /api/cron/reminders
 * Called by Vercel Cron once daily (9 AM).
 * Sends booking reminders for all confirmed appointments happening
 * in the next 24 hours that haven't received a reminder yet.
 *
 * Protected by CRON_SECRET — must match Authorization header.
 *
 * Vercel cron config (vercel.json):
 *   { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 9 * * *" }] }
 *
 * Note: Hobby plans are limited to once-per-day cron jobs with ±59 min precision.
 * For sub-daily reminders (3h, 1h, 30min), upgrade to Vercel Pro and restore
 * the multi-window schedule.
 */

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const windowStart = now
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000) // next 24 hours

  try {
    // Find all confirmed appointments in the next 24h that haven't had a reminder sent
    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        notificationLogs: {
          none: {
            type: 'BOOKING_REMINDER',
            status: 'SENT',
          },
        },
      },
      include: {
        customer: true,
        barber: true,
        service: true,
        business: true,
      },
    })

    let sent = 0
    let failed = 0
    let skipped = 0

    for (const appointment of appointments) {
      // Calculate hours before appointment for the reminder label
      const hoursBefore = Math.round(
        (appointment.startTime.getTime() - now.getTime()) / (60 * 60 * 1000)
      )

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
          hoursBefore
        )
        sent++
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, error)
        failed++
      }
    }

    skipped = appointments.length - sent - failed

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        totalChecked: appointments.length,
        sent,
        failed,
        skipped,
        window: `${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
      },
    })
  } catch (error: any) {
    if (error.code === 'P1001' || error.message?.includes('connect')) {
      return NextResponse.json({
        success: false,
        message: 'No database connected. Reminders require a database to query appointments.',
      }, { status: 503 })
    }
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 })
  }
}
