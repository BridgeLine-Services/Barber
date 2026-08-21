import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TodayAppointmentsView } from '@/components/dashboard/TodayAppointmentsView'

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  const businessId = user.businessId

  // If the owner hasn't created a shop yet, redirect to shop creation
  if (!businessId) {
    redirect('/dashboard/create-shop')
  }

  const userRole = user.role
  const barberId = user.barberId

  // Start and end of today
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const todayDateStr = now.toISOString().split('T')[0]

  // Build where filter
  const whereFilter: any = {
    businessId,
    startTime: {
      gte: startOfDay,
      lte: endOfDay,
    },
  }

  // If BARBER role, limit to their appointments
  if (userRole === 'BARBER' && barberId) {
    whereFilter.barberId = barberId
  }

  let appointments: any[] = []
  try {
    appointments = await prisma.appointment.findMany({
      where: whereFilter,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })
  } catch (error) {
    console.error('Failed to load appointments:', error)
  }

  // Format dates to JSON safe strings
  const formattedAppointments = appointments.map((a) => ({
    ...a,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    customer: a.customer
      ? {
          ...a.customer,
          createdAt: a.customer.createdAt.toISOString(),
          updatedAt: a.customer.updatedAt.toISOString(),
        }
      : null,
    barber: a.barber
      ? {
          ...a.barber,
          createdAt: a.barber.createdAt.toISOString(),
          updatedAt: a.barber.updatedAt.toISOString(),
        }
      : null,
    service: a.service
      ? {
          ...a.service,
          createdAt: a.service.createdAt.toISOString(),
          updatedAt: a.service.updatedAt.toISOString(),
        }
      : null,
  }))

  return (
    <TodayAppointmentsView
      initialAppointments={formattedAppointments}
      todayDateStr={todayDateStr}
      userName={user.name || 'User'}
      userRole={userRole}
      barberId={barberId}
    />
  )
}
