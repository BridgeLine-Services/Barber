import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { getRebookingTasks } from '@/lib/rebooking-engine'
import { getRetentionDashboardMetrics } from '@/lib/retention-dashboard'
import { RebookingDashboardClient } from './RebookingDashboardClient'

export default async function RebookingDashboardPage() {
  const session = await getDemoSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  const businessId = user.businessId

  let tasks: any[] = []
  let metrics = null
  try {
    ;[tasks, metrics] = await Promise.all([
      getRebookingTasks(businessId),
      getRetentionDashboardMetrics(businessId),
    ])
  } catch (error) {
    console.error('Failed to load retention dashboard:', error)
  }

  return <RebookingDashboardClient initialTasks={tasks} initialMetrics={metrics} />
}
