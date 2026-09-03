import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { getAnalytics } from '@/lib/analytics'
import { AnalyticsClient } from './AnalyticsClient'

export default async function AnalyticsPage() {
  const session = await getDemoSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    redirect('/dashboard')
  }

  let initialData = null
  try {
    initialData = await getAnalytics(user.businessId, 30)
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }

  return <AnalyticsClient initialData={initialData} />
}
