import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveBusinessId } from '@/lib/business'
import { createAppointmentSafely } from '@/lib/availability'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any
  const businessId = await resolveBusinessId()
  const isBarber = user.role === 'BARBER'
  const sessionBarberId = user.barberId

  const searchParams = req.nextUrl.searchParams
  const dateParam = searchParams.get('date')
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const barberIdParam = searchParams.get('barberId')
  const statusParam = searchParams.get('status')
  const searchParam = searchParams.get('search')

  const where: any = { businessId }

  if (isBarber && sessionBarberId) {
    where.barberId = sessionBarberId
  } else if (barberIdParam) {
    where.barberId = barberIdParam
  }

  if (statusParam) {
    where.status = statusParam
  }

  if (dateParam) {
    const d = new Date(dateParam)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0)
    where.startTime = { gte: dayStart, lt: dayEnd }
  } else if (fromParam || toParam) {
    where.startTime = {}
    if (fromParam) where.startTime.gte = new Date(fromParam)
    if (toParam) where.startTime.lte = new Date(toParam)
  }

  if (searchParam) {
    where.OR = [
      { confirmationNumber: { contains: searchParam, mode: 'insensitive' } },
      { customer: { firstName: { contains: searchParam, mode: 'insensitive' } } },
      { customer: { lastName: { contains: searchParam, mode: 'insensitive' } } },
      { customer: { phone: { contains: searchParam, mode: 'insensitive' } } },
      { customer: { email: { contains: searchParam, mode: 'insensitive' } } },
    ]
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(appointments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businessId = await resolveBusinessId()

  try {
    const body = await req.json()
    const { customerId, customerData, barberId, serviceId, date, time, notes } = body

    if (!barberId || !serviceId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let targetCustomerData = customerData

    if (!targetCustomerData && customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, businessId },
      })
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      targetCustomerData = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        notes: notes || customer.notes,
        smsConsent: customer.smsConsent,
      }
    }

    if (!targetCustomerData?.firstName || !targetCustomerData?.email || !targetCustomerData?.phone) {
      return NextResponse.json({ error: 'Customer details (name, email, phone) are required' }, { status: 400 })
    }

    // Combine date ("YYYY-MM-DD") and time ("HH:mm") into Date object
    const startIso = `${date}T${time}:00`
    const startTime = new Date(startIso)

    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time' }, { status: 400 })
    }

    const result = await createAppointmentSafely({
      businessId,
      barberId,
      serviceId,
      startTime,
      customerData: {
        firstName: targetCustomerData.firstName,
        lastName: targetCustomerData.lastName,
        phone: targetCustomerData.phone,
        email: targetCustomerData.email,
        notes: notes || targetCustomerData.notes || '',
        smsConsent: targetCustomerData.smsConsent ?? false,
      },
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Update createdBy to MANUAL if created via dashboard
    if (result.appointment?.id) {
      await prisma.appointment.update({
        where: { id: result.appointment.id },
        data: { createdBy: 'MANUAL' },
      })
    }

    return NextResponse.json(result.appointment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
