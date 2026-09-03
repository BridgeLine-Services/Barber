import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BarbersClient } from '@/components/dashboard/BarbersClient'

export default async function BarbersPage() {
  const session = await getDemoSession()
  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  const businessId = (user as any).businessId

  let barbers: any[] = []
  try {
    barbers = await prisma.barber.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { order: 'asc' },
    })
  } catch (error) {
    console.error('Failed to load barbers:', error)
  }

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
