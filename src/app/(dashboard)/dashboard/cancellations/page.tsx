import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CancellationIntelligenceClient } from './CancellationIntelligenceClient'

export default async function CancellationIntelligencePage() {
  const session = await getDemoSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  let records: any[] = []
  let stats: any = { total: 0, byReason: {}, uniqueCustomers: 0 }

  try {
    const rawRecords = await prisma.cancellationRecord.findMany({
      where: { businessId: user.businessId },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    records = rawRecords.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))

    stats = {
      total: records.length,
      byReason: records.reduce((acc, r) => {
        acc[r.reason] = (acc[r.reason] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      uniqueCustomers: new Set(records.map(r => r.customerId)).size,
    }
  } catch (error) {
    console.error('Failed to load cancellations:', error)
  }

  return <CancellationIntelligenceClient initialRecords={records} initialStats={stats} />
}
