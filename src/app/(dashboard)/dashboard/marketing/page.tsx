import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MarketingClient } from './MarketingClient'

export default async function MarketingPage() {
  const session = await getDemoSession()
  if (!session?.user) redirect('/login')

  const user = session.user as any
  const businessId = user.businessId

  const [campaigns, barbers, services] = await Promise.all([
    prisma.marketingCampaign.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.barber.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true },
    }),
    prisma.service.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true },
    }),
  ])

  // Serialize dates to strings for the client component
  const serializedCampaigns = campaigns.map(c => ({
    ...c,
    sentAt: c.sentAt ? c.sentAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <MarketingClient
      initialCampaigns={serializedCampaigns}
      barbers={barbers}
      services={services}
      isOwner={user.role === 'OWNER'}
    />
  )
}
