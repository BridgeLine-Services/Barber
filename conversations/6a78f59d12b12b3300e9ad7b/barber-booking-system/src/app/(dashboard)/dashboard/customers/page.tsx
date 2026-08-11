import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CustomersListView } from '@/components/dashboard/CustomersListView'

export default async function CustomersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  const businessId = user.businessId
  const isBarber = user.role === 'BARBER'
  const barberId = user.barberId

  const whereClause: any = { businessId }
  if (isBarber && barberId) {
    whereClause.appointments = {
      some: { barberId },
    }
  }

  let customers: any[] = []
  try {
    customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { appointments: true },
        },
        appointments: {
          select: { startTime: true },
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Failed to load customers:', error)
  }

  const serializedCustomers = customers.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    appointments: c.appointments.map((a: any) => ({
      ...a,
      startTime: a.startTime.toISOString(),
    })),
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CustomersListView initialCustomers={serializedCustomers} />
    </div>
  )
}
