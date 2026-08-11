import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const confirmationNumber = searchParams.get('confirmationNumber')

    if (!confirmationNumber) {
      return NextResponse.json(
        { error: 'confirmationNumber parameter is required' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        confirmationNumber: confirmationNumber.trim().toUpperCase(),
      },
      include: {
        customer: true,
        barber: true,
        service: true,
        business: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ appointment })
  } catch (error: any) {
    console.error('Error looking up appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to lookup appointment' },
      { status: 500 }
    )
  }
}
