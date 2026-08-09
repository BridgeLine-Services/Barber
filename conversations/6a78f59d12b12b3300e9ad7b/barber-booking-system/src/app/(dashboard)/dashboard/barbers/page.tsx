import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveBusinessId } from '@/lib/business'
import { BarbersClient } from '@/components/dashboard/BarbersClient'

export default async function BarbersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  const businessId = await resolveBusinessId()

  const barbers = await prisma.barber.findMany({
    where: { businessId },
    include: {
      _count: {
        select: { appointments: true },
      },
    },
    orderBy: { order: 'asc' },
  })

  const serializedBarbers = barbers.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  return (
    <div className="max-w-7xl mx-auto">
      <BarbersClient initialBarbers={serializedBarbers} />
    </div>
  )
}
