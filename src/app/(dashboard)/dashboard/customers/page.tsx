import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CustomersListView } from '@/components/dashboard/CustomersListView'

export default async function CustomersPage() {
  const session = await getDemoSession()
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

  const isOwner = user.role === 'OWNER'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {isOwner && (
        <div className="flex justify-end">
          <a href="/api/dashboard/customers/export" download>
            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 hover:border-amber-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </a>
        </div>
      )}
      <CustomersListView initialCustomers={serializedCustomers} />
    </div>
  )
}
