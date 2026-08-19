export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { resolveBusinessId } from '@/lib/tenant'
import { getAvailableSlots, getEarliestAvailableSlot } from '@/lib/availability'
import { isValid } from 'date-fns'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * GET /api/availability?serviceId=<id>&date=<YYYY-MM-DD>&barberId=<id>&any=true
 *
 * Returns available time slots for the given service, date, and barber.
 * If barberId is 'any' or the 'any' param is true, returns merged slots
 * across all barbers offering the service.
 *
 * No demo fallback — requires a configured business and database.
 */
export async function GET(req: NextRequest) {
  const rateLimitResult = checkRateLimit(req, 'availability', RATE_LIMITS.AVAILABILITY)
  if (rateLimitResult) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a moment.' },
      { status: rateLimitResult.status }
    )
  }

  try {
    const { searchParams } = req.nextUrl
    const barberId = searchParams.get('barberId')
    const serviceId = searchParams.get('serviceId')
    const dateStr = searchParams.get('date')
    const isAnyParam = searchParams.get('any') === 'true'

    if (!serviceId || !dateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: serviceId and date are required' },
        { status: 400 }
      )
    }

    const businessId = await resolveBusinessId()

    // Handle date parsing (e.g. YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }
    const date = new Date(year, month - 1, day, 0, 0, 0)

    if (!isValid(date)) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    if (barberId === 'any' || isAnyParam || !barberId) {
      const { earliest, slots } = await getEarliestAvailableSlot({
        businessId,
        serviceId,
        date,
        dateStr,
      })
      return NextResponse.json({ earliest, slots })
    }

    const slots = await getAvailableSlots({
      businessId,
      barberId,
      serviceId,
      date,
      dateStr,
    })

    return NextResponse.json({ slots })
  } catch (error: any) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
