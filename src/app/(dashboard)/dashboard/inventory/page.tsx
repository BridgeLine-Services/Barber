import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { InventoryClient } from './InventoryClient'

export default async function InventoryPage() {
  const session = await getDemoSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  let items: any[] = []
  let barbers: any[] = []

  try {
    items = await prisma.inventoryItem.findMany({
      where: { businessId: user.businessId },
      include: { barber: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })

    barbers = await prisma.barber.findMany({
      where: { businessId: user.businessId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Failed to load inventory:', error)
  }

  const serializedItems = items.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }))

  return <InventoryClient initialItems={serializedItems} barbers={barbers} />
}
