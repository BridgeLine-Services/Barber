export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { resolveBusinessId } from '@/lib/business'
import { getEarliestAvailableSlot } from '@/lib/availability'
import { demoServices, demoBarbers, demoBusiness } from '@/lib/demo-data'
import { format } from 'date-fns'

/**
 * GET /api/availability/earliest?serviceId=<id>
 *
 * Searches the next 30 days for the earliest available slot across all
 * active barbers offering the given service. Returns:
 *   { date, time, barberId, barberName }  – earliest slot found
 *   { earliest: null }                     – nothing available in the window
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing required parameter: serviceId' },
        { status: 400 }
      )
    }

    const businessId = await resolveBusinessId(req)

    // Search the next 30 days starting from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      const { earliest } = await getEarliestAvailableSlot({
        businessId,
        serviceId,
        date,
      })

      if (earliest) {
        return NextResponse.json({
          date: format(date, 'yyyy-MM-dd'),
          time: earliest.time,
          barberId: earliest.barberId,
          barberName: earliest.barberName,
        })
      }
    }

    return NextResponse.json({ earliest: null })
  } catch (error: any) {
    // Database not connected — fall back to demo data
    const serviceId = req.nextUrl.searchParams.get('serviceId')

    if (serviceId) {
      const demoService = demoServices.find((s) => s.id === serviceId)
      const duration = demoService?.duration || 30

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i =  0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)

        const dayName = date
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase()
        const hours = (demoBusiness.hours as any)?.[dayName]

        if (!hours || hours.isOff) continue

        const [openH, openM] = hours.open.split(':').map(Number)
        const slotStart = new Date(date)
        slotStart.setHours(openH, openM, 0, 0)

        // Skip past times on today
        const now = new Date()
        while (
          slotStart.getTime() < new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59).getTime() &&
          slotStart.getTime() < now.getTime()
        ) {
          slotStart.setTime(slotStart.getTime() + duration * 60000)
        }

        const dayEnd = new Date(date)
        const [closeH, closeM] = hours.close.split(':').map(Number)
        dayEnd.setHours(closeH, closeM, 0, 0)
        if (slotStart >= dayEnd) continue

        // Find first barber that offers this service
        const matchingBarbers = demoBarbers.filter(
          (b) => b.services.length === 0 || b.services.some((s) => s.serviceId === serviceId)
        )

        if (matchingBarbers.length === 0) continue

        const barber = matchingBarbers[0]
        const timeStr = slotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })

        return NextResponse.json({
          date: format(date, 'yyyy-MM-dd'),
          time: timeStr,
          barberId: barber.id,
          barberName: barber.name,
          demo: true,
        })
      }
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch earliest availability' },
      { status: 500 }
    )
  }
}
