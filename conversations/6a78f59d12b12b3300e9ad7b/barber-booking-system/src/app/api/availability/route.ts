export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { resolveBusinessId } from '@/lib/business'
import { getAvailableSlots, getEarliestAvailableSlot } from '@/lib/availability'
import { parseISO, isValid } from 'date-fns'
import { demoServices, demoBarbers, demoBusiness } from '@/lib/demo-data'

function generateDemoSlots(date: Date, serviceDuration: number, barberId?: string): any[] {
  const slots: any[] = []
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const hours = (demoBusiness.hours as any)?.[dayName]

  if (!hours || hours.isOff) return slots

  const [openH, openM] = hours.open.split(':').map(Number)
  const [closeH, closeM] = hours.close.split(':').map(Number)

  const start = new Date(date)
  start.setHours(openH, openM, 0, 0)

  const end = new Date(date)
  end.setHours(closeH, closeM, 0, 0)

  const barber = barberId && barberId !== 'any'
    ? demoBarbers.find(b => b.id === barberId)
    : null

  while (start < end) {
    const slotEnd = new Date(start.getTime() + serviceDuration * 60000)
    if (slotEnd > end) break

    // Skip 12pm-1pm (lunch break) for realism
    const hour = start.getHours()
    if (hour !== 12) {
      const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      slots.push({
        time: timeStr,
        available: true,
        barberId: barber?.id,
        barberName: barber?.name,
      })
    }

    start.setTime(start.getTime() + serviceDuration * 60000)
  }

  // For "any barber", assign different barbers to different slots for realism
  if (!barberId || barberId === 'any') {
    slots.forEach((slot, i) => {
      const b = demoBarbers[i % demoBarbers.length]
      slot.barberId = b.id
      slot.barberName = b.name
    })
  }

  return slots
}

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
    // Database not connected — return demo time slots for template mode
    const dateStr = req.nextUrl.searchParams.get('date')
    const serviceId = req.nextUrl.searchParams.get('serviceId')
    const barberId = req.nextUrl.searchParams.get('barberId')
    const isAny = req.nextUrl.searchParams.get('any') === 'true'

    if (dateStr && serviceId) {
      const [y, m, d] = dateStr.split('-').map(Number)
      const date = new Date(y, m - 1, d, 0, 0, 0)
      const demoService = demoServices.find(s => s.id === serviceId)
      const duration = demoService?.duration || 30

      const effectiveBarberId = barberId === 'any' || isAny || !barberId ? 'any' : barberId
      const slots = generateDemoSlots(date, duration, effectiveBarberId)
      return NextResponse.json({ slots, demo: true })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
