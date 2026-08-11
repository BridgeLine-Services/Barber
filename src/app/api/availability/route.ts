import { NextRequest, NextResponse } from 'next/server'
import { resolveBusinessId } from '@/lib/business'
import { getAvailableSlots, getEarliestAvailableSlot } from '@/lib/availability'
import { parseISO, isValid } from 'date-fns'

export async function GET(req: NextRequest) {
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

    const businessId = await resolveBusinessId(req)

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
      })
      return NextResponse.json({ earliest, slots })
    }

    const slots = await getAvailableSlots({
      businessId,
      barberId,
      serviceId,
      date,
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
