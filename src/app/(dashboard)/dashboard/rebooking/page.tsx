import { getDemoSession } from '@/lib/demo-auth'
import { redirect } from 'next/navigation'
import { getRebookingTasks } from '@/lib/rebooking-engine'
import { RebookingDashboardClient } from './RebookingDashboardClient'

export default async function RebookingDashboardPage() {
  const session = await getDemoSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  const businessId = user.businessId

  let tasks: any[] = []
  try {
    tasks = await getRebookingTasks(businessId)
  } catch (error) {
    console.error('Failed to load rebooking tasks:', error)
  }

  return <RebookingDashboardClient initialTasks={tasks} />
}
